import db from '../config/db.js';
import { hashPassword, verifyPassword, signToken } from '../services/authService.js';

export const register = (req, res) => {
  try {
    const { employeeId, name, email, password, role = 'employee', department, designation, phone, address } = req.body;

    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, full name, email, and password are required.'
      });
    }

    // Password validation: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-+=<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Check existing email
    const existingUser = db.table('users').findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing employee ID
    const existingEmpId = db.table('users').findOne({ employeeId: employeeId.trim() });
    if (existingEmpId) {
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
      department: department || 'Engineering',
      designation: designation || (assignedRole === 'admin' ? 'HR Manager' : 'Software Engineer'),
      phone: phone || '+1 (555) 019-2834',
      address: address || 'San Francisco, CA',
      dateOfBirth: '1995-06-15',
      joiningDate: new Date().toISOString().split('T')[0],
      managerName: assignedRole === 'admin' ? 'Executive Leadership' : 'Priya Sharma',
      status: 'active'
    });

    // Create default initial salary structure
    db.table('payroll').insert({
      employeeId: newEmployee.id,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      basicSalary: assignedRole === 'admin' ? 95000 : 75000,
      houseAllowance: 12000,
      otherAllowances: 8000,
      deductions: 5000,
      tax: 7000,
      netSalary: (assignedRole === 'admin' ? 95000 : 75000) + 12000 + 8000 - 5000 - 7000,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0]
    });

    // Create welcome notification
    db.table('notifications').insert({
      userId: newUser.id,
      title: 'Welcome to Dayflow HRMS!',
      message: `Hello ${newUser.name}, your account is now active. Explore your dashboard and check in for today.`,
      type: 'info',
      isRead: false,
      link: '/dashboard'
    });

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
        employeeRecordId: newEmployee.id,
        department: newEmployee.department,
        designation: newEmployee.designation
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating your account. Please try again.'
    });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email and password.'
      });
    }

    const user = db.table('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const employee = db.table('employees').findOne({ userId: user.id }) || {};
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        employeeRecordId: employee.id || null,
        department: employee.department || 'General',
        designation: employee.designation || (user.role === 'admin' ? 'HR Director' : 'Employee')
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to complete sign in. Please try again.'
    });
  }
};

export const getMe = (req, res) => {
  try {
    const user = db.table('users').findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const employee = db.table('employees').findOne({ userId: user.id }) || {};
    const unreadNotifications = db.table('notifications').count(n => n.userId === user.id && !n.isRead);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        employeeRecordId: employee.id || null,
        department: employee.department || 'General',
        designation: employee.designation || 'Staff',
        phone: employee.phone || '',
        address: employee.address || '',
        joiningDate: employee.joiningDate || '',
        dateOfBirth: employee.dateOfBirth || '',
        managerName: employee.managerName || '',
        status: employee.status || 'active',
        unreadNotifications
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};
