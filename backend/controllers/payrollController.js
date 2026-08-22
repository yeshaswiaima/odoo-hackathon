import db from '../config/db.js';

export const getMyPayroll = (req, res) => {
  try {
    const employeeId = req.user.employeeRecordId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated.' });
    }

    const records = db.table('payroll').find(p => p.employeeId === Number(employeeId));

    // Sort newest month / year first
    records.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (b.id || 0) - (a.id || 0);
    });

    const currentStructure = records.length > 0 ? records[0] : {
      basicSalary: 65000,
      houseAllowance: 10000,
      otherAllowances: 5000,
      deductions: 3500,
      tax: 5500,
      netSalary: 71000,
      status: 'active'
    };

    return res.status(200).json({
      success: true,
      currentSalary: currentStructure,
      history: records
    });
  } catch (err) {
    console.error('Get my payroll error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payroll details.' });
  }
};

export const getAllPayroll = (req, res) => {
  try {
    const { month, year, search = '', department = 'All' } = req.query;

    const allPayroll = db.table('payroll').find();
    const employees = db.table('employees').find();
    const users = db.table('users').find();

    let combined = allPayroll.map(pay => {
      const emp = employees.find(e => e.id === pay.employeeId) || {};
      const user = users.find(u => u.id === emp.userId || u.employeeId === emp.employeeId) || {};

      return {
        id: pay.id,
        employeeId: pay.employeeId,
        empCode: emp.employeeId || 'N/A',
        name: user.name || 'Unknown Employee',
        email: user.email || '',
        department: emp.department || 'General',
        designation: emp.designation || 'Staff',
        profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pay.employeeId}`,
        month: pay.month,
        year: pay.year,
        basicSalary: pay.basicSalary,
        houseAllowance: pay.houseAllowance || 0,
        otherAllowances: pay.otherAllowances || 0,
        deductions: pay.deductions || 0,
        tax: pay.tax || 0,
        netSalary: pay.netSalary,
        status: pay.status,
        paymentDate: pay.paymentDate,
        createdAt: pay.createdAt
      };
    });

    if (month && month !== 'All') {
      combined = combined.filter(p => (p.month || '').toLowerCase() === month.toLowerCase());
    }

    if (year) {
      combined = combined.filter(p => Number(p.year) === Number(year));
    }

    if (department && department !== 'All') {
      combined = combined.filter(p => (p.department || '').toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.empCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
      );
    }

    // Sort by id desc
    combined.sort((a, b) => b.id - a.id);

    const totalDisbursed = combined
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

    const totalPending = combined
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

    return res.status(200).json({
      success: true,
      count: combined.length,
      payroll: combined,
      stats: {
        totalDisbursed,
        totalPending,
        paidCount: combined.filter(p => p.status === 'paid').length,
        pendingCount: combined.filter(p => p.status === 'pending').length
      }
    });
  } catch (err) {
    console.error('Get all payroll error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payroll records.' });
  }
};

export const updateSalaryStructure = (req, res) => {
  try {
    const { id } = req.params; // payroll record ID or employee ID
    const {
      basicSalary = 0,
      houseAllowance = 0,
      otherAllowances = 0,
      deductions = 0,
      tax = 0,
      status = 'paid',
      month,
      year
    } = req.body;

    const numBasic = Math.max(Number(basicSalary) || 0, 0);
    const numHra = Math.max(Number(houseAllowance) || 0, 0);
    const numOther = Math.max(Number(otherAllowances) || 0, 0);
    const numDed = Math.max(Number(deductions) || 0, 0);
    const numTax = Math.max(Number(tax) || 0, 0);

    const netSalary = Math.max(numBasic + numHra + numOther - numDed - numTax, 0);

    let payrollRecord = db.table('payroll').findById(Number(id));

    if (!payrollRecord) {
      // Check if id is employeeId
      const byEmp = db.table('payroll').find({ employeeId: Number(id) });
      if (byEmp.length > 0) {
        payrollRecord = byEmp[byEmp.length - 1];
      }
    }

    if (payrollRecord) {
      const updated = db.table('payroll').update(payrollRecord.id, {
        basicSalary: numBasic,
        houseAllowance: numHra,
        otherAllowances: numOther,
        deductions: numDed,
        tax: numTax,
        netSalary,
        status: status || payrollRecord.status,
        month: month || payrollRecord.month,
        year: year ? Number(year) : payrollRecord.year
      });

      return res.status(200).json({
        success: true,
        message: 'Salary structure updated successfully.',
        payroll: updated
      });
    } else {
      // Create new record
      const created = db.table('payroll').insert({
        employeeId: Number(id),
        month: month || new Date().toLocaleString('default', { month: 'long' }),
        year: year ? Number(year) : new Date().getFullYear(),
        basicSalary: numBasic,
        houseAllowance: numHra,
        otherAllowances: numOther,
        deductions: numDed,
        tax: numTax,
        netSalary,
        status: status || 'pending',
        paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null
      });

      return res.status(201).json({
        success: true,
        message: 'Salary structure created successfully.',
        payroll: created
      });
    }
  } catch (err) {
    console.error('Update salary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update salary structure.' });
  }
};

export const getPayslipDetails = (req, res) => {
  try {
    const { id } = req.params;
    const payroll = db.table('payroll').findById(Number(id));

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payslip record not found.' });
    }

    const employee = db.table('employees').findById(payroll.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Associated employee not found.' });
    }

    const user = db.table('users').findById(employee.userId) || {};

    // Check RBAC
    const isSelf = req.user.employeeRecordId === employee.id;
    const isAdmin = ['admin', 'hr'].includes((req.user.role || '').toLowerCase());

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({
      success: true,
      payslip: {
        id: payroll.id,
        payslipNumber: `DF-PAY-${payroll.year}-${String(payroll.id).padStart(4, '0')}`,
        month: payroll.month,
        year: payroll.year,
        paymentDate: payroll.paymentDate || 'Pending Disbursal',
        status: payroll.status,
        company: {
          name: 'Dayflow Technologies Inc.',
          tagline: 'Every workday, perfectly aligned.',
          address: '100 Silicon Way, Tech Park, San Francisco, CA 94105',
          contact: 'hr@dayflow.com'
        },
        employee: {
          name: user.name,
          employeeId: employee.employeeId,
          email: user.email,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          bankAccount: `•••• •••• •••• ${String(employee.id * 1111).slice(-4)}`
        },
        earnings: [
          { label: 'Basic Salary', amount: payroll.basicSalary },
          { label: 'House Rent Allowance (HRA)', amount: payroll.houseAllowance || 0 },
          { label: 'Special & Other Allowances', amount: payroll.otherAllowances || 0 }
        ],
        deductions: [
          { label: 'Provident Fund / 401(k)', amount: payroll.deductions || 0 },
          { label: 'Income Tax (TDS / PAYE)', amount: payroll.tax || 0 }
        ],
        totalEarnings: Number(payroll.basicSalary) + Number(payroll.houseAllowance || 0) + Number(payroll.otherAllowances || 0),
        totalDeductions: Number(payroll.deductions || 0) + Number(payroll.tax || 0),
        netSalary: payroll.netSalary
      }
    });
  } catch (err) {
    console.error('Get payslip error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate payslip.' });
  }
};
