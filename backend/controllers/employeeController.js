import db from '../config/db.js';
import { hashPassword } from '../services/authService.js';

export const getAllEmployees = (req, res) => {
  try {
    const { search = '', department = '', status = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const employees = db.table('employees').find();
    const users = db.table('users').find();

    let combined = employees.map(emp => {
      const user = users.find(u => u.id === emp.userId || u.employeeId === emp.employeeId) || {};
      return {
        id: emp.id,
        userId: emp.userId,
        employeeId: emp.employeeId,
        name: user.name || 'Unnamed Employee',
        email: user.email || '',
        role: user.role || 'employee',
        profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.employeeId}`,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        address: emp.address,
        joiningDate: emp.joiningDate,
        dateOfBirth: emp.dateOfBirth,
        managerName: emp.managerName,
        status: emp.status
      };
    });

    // Apply Search
    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(emp =>
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
        (emp.designation && emp.designation.toLowerCase().includes(q))
      );
    }

    // Apply Department filter
    if (department && department !== 'All') {
      combined = combined.filter(emp => emp.department.toLowerCase() === department.toLowerCase());
    }

    // Apply Status filter
    if (status && status !== 'All') {
      combined = combined.filter(emp => emp.status.toLowerCase() === status.toLowerCase());
    }

    // Sort
    combined.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      count: combined.length,
      employees: combined
    });
  } catch (err) {
    console.error('Get all employees error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch employees list.' });
  }
};

export const getEmployeeById = (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(Number(id));
    
    // Find employee by employee table id OR employeeId string OR userId
    let emp = null;
    if (isNumeric) {
      emp = db.table('employees').findById(Number(id));
    }
    if (!emp) {
      emp = db.table('employees').findOne({ employeeId: id });
    }
    if (!emp && isNumeric) {
      emp = db.table('employees').findOne({ userId: Number(id) });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check RBAC permission: Admin can see anyone, Employee can only see self
    const isSelf = req.user.employeeRecordId === emp.id || req.user.id === emp.userId || req.user.employeeId === emp.employeeId;
    const isAdmin = ['admin', 'hr', 'hr_officer'].includes((req.user.role || '').toLowerCase());

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own employee profile.' });
    }

    const user = db.table('users').findById(emp.userId) || db.table('users').findOne({ employeeId: emp.employeeId }) || {};
    const payrollRecords = db.table('payroll').find({ employeeId: emp.id });
    const attendanceRecords = db.table('attendance').find({ employeeId: emp.id });
    const leaveRecords = db.table('leaves').find({ employeeId: emp.id });
    const documents = db.table('documents').find({ employeeId: emp.id });

    // Latest or active salary structure
    const currentPayroll = payrollRecords.length > 0 ? payrollRecords[payrollRecords.length - 1] : null;

    return res.status(200).json({
      success: true,
      employee: {
        id: emp.id,
        userId: emp.userId,
        employeeId: emp.employeeId,
        name: user.name || 'Unnamed Employee',
        email: user.email || '',
        role: user.role || 'employee',
        profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.employeeId}`,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        address: emp.address,
        joiningDate: emp.joiningDate,
        dateOfBirth: emp.dateOfBirth,
        managerName: emp.managerName,
        status: emp.status,
        salary: currentPayroll ? {
          basicSalary: currentPayroll.basicSalary,
          houseAllowance: currentPayroll.houseAllowance,
          otherAllowances: currentPayroll.otherAllowances,
          deductions: currentPayroll.deductions,
          tax: currentPayroll.tax,
          netSalary: currentPayroll.netSalary,
          status: currentPayroll.status
        } : null,
        stats: {
          totalAttendance: attendanceRecords.length,
          leavesTaken: leaveRecords.filter(l => l.status === 'approved').reduce((sum, l) => sum + (l.numberOfDays || 1), 0),
          pendingLeaves: leaveRecords.filter(l => l.status === 'pending').length
        },
        documents: documents || []
      }
    });
  } catch (err) {
    console.error('Get employee by ID error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee profile.' });
  }
};

export const createEmployee = (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      password = 'Employee@123',
      role = 'employee',
      department = 'Engineering',
      designation = 'Associate Engineer',
      phone = '+1 (555) 012-3456',
      address = 'San Francisco, CA',
      dateOfBirth = '1996-05-12',
      joiningDate = new Date().toISOString().split('T')[0],
      managerName = 'Priya Sharma',
      status = 'active',
      basicSalary = 65000,
      houseAllowance = 10000,
      otherAllowances = 5000,
      deductions = 4000,
      tax = 5000
    } = req.body;

    if (!employeeId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, full name, and email are required.'
      });
    }

    // Check duplicate email
    if (db.table('users').findOne({ email: email.toLowerCase().trim() })) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check duplicate employee ID
    if (db.table('users').findOne({ employeeId: employeeId.trim() })) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this Employee ID already exists.'
      });
    }

    const assignedRole = role === 'admin' || role === 'hr' ? 'admin' : 'employee';
    const passwordHash = hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newUser = db.table('users').insert({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      profileImage: avatar
    });

    const newEmployee = db.table('employees').insert({
      userId: newUser.id,
      employeeId: newUser.employeeId,
      department: department.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
      address: address.trim(),
      dateOfBirth,
      joiningDate,
      managerName: managerName.trim(),
      status
    });

    const netSalary = Number(basicSalary) + Number(houseAllowance) + Number(otherAllowances) - Number(deductions) - Number(tax);

    db.table('payroll').insert({
      employeeId: newEmployee.id,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      basicSalary: Number(basicSalary),
      houseAllowance: Number(houseAllowance),
      otherAllowances: Number(otherAllowances),
      deductions: Number(deductions),
      tax: Number(tax),
      netSalary,
      status: 'pending',
      paymentDate: null
    });

    // Create default documents
    db.table('documents').insert({
      employeeId: newEmployee.id,
      name: 'Offer_Letter.pdf',
      type: 'PDF',
      fileUrl: '/docs/offer-letter.pdf'
    });
    db.table('documents').insert({
      employeeId: newEmployee.id,
      name: 'Employment_Contract.pdf',
      type: 'PDF',
      fileUrl: '/docs/contract.pdf'
    });

    // Notify new employee
    db.table('notifications').insert({
      userId: newUser.id,
      title: 'Welcome to Dayflow HRMS',
      message: `Welcome to the team, ${newUser.name}! Your profile and onboarding records have been created.`,
      type: 'success',
      isRead: false,
      link: '/dashboard'
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee: {
        id: newEmployee.id,
        userId: newUser.id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newEmployee.department,
        designation: newEmployee.designation,
        phone: newEmployee.phone,
        status: newEmployee.status,
        netSalary
      }
    });
  } catch (err) {
    console.error('Create employee error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create new employee.' });
  }
};

export const updateEmployee = (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    const emp = db.table('employees').findById(numericId) || db.table('employees').findOne({ employeeId: id });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const isSelf = req.user.employeeRecordId === emp.id || req.user.id === emp.userId || req.user.employeeId === emp.employeeId;
    const isAdmin = ['admin', 'hr', 'hr_officer'].includes((req.user.role || '').toLowerCase());

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot edit another employee\'s information.' });
    }

    const {
      name,
      phone,
      address,
      profileImage,
      department,
      designation,
      managerName,
      status,
      dateOfBirth,
      joiningDate
    } = req.body;

    // Allowed updates for employee: phone, address, profileImage
    const empUpdates = {};
    const userUpdates = {};

    if (phone !== undefined) empUpdates.phone = phone;
    if (address !== undefined) empUpdates.address = address;
    if (profileImage !== undefined) userUpdates.profileImage = profileImage;

    // Admin-only updates
    if (isAdmin) {
      if (name !== undefined) userUpdates.name = name;
      if (department !== undefined) empUpdates.department = department;
      if (designation !== undefined) empUpdates.designation = designation;
      if (managerName !== undefined) empUpdates.managerName = managerName;
      if (status !== undefined) empUpdates.status = status;
      if (dateOfBirth !== undefined) empUpdates.dateOfBirth = dateOfBirth;
      if (joiningDate !== undefined) empUpdates.joiningDate = joiningDate;
    }

    if (Object.keys(empUpdates).length > 0) {
      db.table('employees').update(emp.id, empUpdates);
    }
    if (Object.keys(userUpdates).length > 0 && emp.userId) {
      db.table('users').update(emp.userId, userUpdates);
    }

    const updatedEmp = db.table('employees').findById(emp.id);
    const updatedUser = db.table('users').findById(emp.userId) || {};

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      employee: {
        id: updatedEmp.id,
        userId: updatedEmp.userId,
        employeeId: updatedEmp.employeeId,
        name: updatedUser.name || 'Unnamed',
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        department: updatedEmp.department,
        designation: updatedEmp.designation,
        phone: updatedEmp.phone,
        address: updatedEmp.address,
        joiningDate: updatedEmp.joiningDate,
        dateOfBirth: updatedEmp.dateOfBirth,
        managerName: updatedEmp.managerName,
        status: updatedEmp.status
      }
    });
  } catch (err) {
    console.error('Update employee error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update employee.' });
  }
};

export const deleteEmployee = (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    const emp = db.table('employees').findById(numericId) || db.table('employees').findOne({ employeeId: id });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Soft delete / set to inactive or hard delete
    db.table('employees').update(emp.id, { status: 'inactive' });

    return res.status(200).json({
      success: true,
      message: `Employee ${emp.employeeId} has been deactivated.`
    });
  } catch (err) {
    console.error('Delete employee error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete employee.' });
  }
};

export const getDepartments = (req, res) => {
  try {
    const employees = db.table('employees').find({ status: 'active' });
    const map = {};
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      map[dept] = (map[dept] || 0) + 1;
    });

    const departments = Object.entries(map).map(([name, count]) => ({
      name,
      count
    }));

    return res.status(200).json({ success: true, departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};
