import db from '../config/db.js';
import { hashPassword } from '../services/authService.js';

console.log('🌱 Starting Dayflow HRMS Database Seeding...');

// Reset current database
db.reset();

// 1. Seed Users & Employees
const seedUsers = [
  {
    employeeId: 'DF-001',
    name: 'Priya Sharma',
    email: 'admin@dayflow.com',
    password: 'Admin@123',
    role: 'admin',
    department: 'Human Resources',
    designation: 'VP of People & HR Director',
    phone: '+1 (555) 234-5671',
    address: '450 Mission St, San Francisco, CA 94105',
    dateOfBirth: '1988-04-12',
    joiningDate: '2021-01-15',
    managerName: 'Board of Directors',
    status: 'active',
    basicSalary: 110000,
    houseAllowance: 18000,
    otherAllowances: 12000,
    deductions: 8000,
    tax: 14000
  },
  {
    employeeId: 'DF-002',
    name: 'Alex Morgan',
    email: 'employee@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    phone: '+1 (555) 345-6782',
    address: '742 Evergreen Terrace, San Francisco, CA 94110',
    dateOfBirth: '1993-08-24',
    joiningDate: '2022-03-01',
    managerName: 'Priya Sharma',
    status: 'active',
    basicSalary: 92000,
    houseAllowance: 14000,
    otherAllowances: 8000,
    deductions: 6000,
    tax: 11000
  },
  {
    employeeId: 'DF-003',
    name: 'Sophia Chen',
    email: 'sophia.chen@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Design',
    designation: 'Lead Product Designer',
    phone: '+1 (555) 456-7893',
    address: '120 Berkeley Way, Berkeley, CA 94704',
    dateOfBirth: '1994-11-19',
    joiningDate: '2022-07-15',
    managerName: 'Alex Morgan',
    status: 'active',
    basicSalary: 88000,
    houseAllowance: 13000,
    otherAllowances: 7000,
    deductions: 5500,
    tax: 10500
  },
  {
    employeeId: 'DF-004',
    name: 'Marcus Vance',
    email: 'marcus.v@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Staff Cloud Infrastructure Architect',
    phone: '+1 (555) 567-8904',
    address: '89 Oak Knoll Dr, Oakland, CA 94611',
    dateOfBirth: '1990-02-08',
    joiningDate: '2021-09-01',
    managerName: 'Alex Morgan',
    status: 'active',
    basicSalary: 105000,
    houseAllowance: 16000,
    otherAllowances: 10000,
    deductions: 7500,
    tax: 13000
  },
  {
    employeeId: 'DF-005',
    name: 'Elena Rostova',
    email: 'elena.r@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Human Resources',
    designation: 'Talent Acquisition & People Partner',
    phone: '+1 (555) 678-9015',
    address: '310 Castro St, Mountain View, CA 94041',
    dateOfBirth: '1995-09-30',
    joiningDate: '2023-02-10',
    managerName: 'Priya Sharma',
    status: 'active',
    basicSalary: 74000,
    houseAllowance: 11000,
    otherAllowances: 5000,
    deductions: 4500,
    tax: 8500
  },
  {
    employeeId: 'DF-006',
    name: 'Daniel Kim',
    email: 'daniel.k@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Marketing',
    designation: 'Product Marketing Manager',
    phone: '+1 (555) 789-0126',
    address: '500 University Ave, Palo Alto, CA 94301',
    dateOfBirth: '1992-06-14',
    joiningDate: '2023-05-20',
    managerName: 'Priya Sharma',
    status: 'active',
    basicSalary: 82000,
    houseAllowance: 12000,
    otherAllowances: 6000,
    deductions: 5000,
    tax: 9800
  },
  {
    employeeId: 'DF-007',
    name: 'Olivia Bennett',
    email: 'olivia.b@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Sales',
    designation: 'Senior Enterprise Account Executive',
    phone: '+1 (555) 890-1237',
    address: '225 2nd Ave, San Mateo, CA 94401',
    dateOfBirth: '1991-03-27',
    joiningDate: '2022-11-01',
    managerName: 'Priya Sharma',
    status: 'active',
    basicSalary: 95000,
    houseAllowance: 15000,
    otherAllowances: 12000,
    deductions: 6500,
    tax: 12000
  },
  {
    employeeId: 'DF-008',
    name: 'Rohan Patel',
    email: 'rohan.p@dayflow.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software QA Automation Specialist',
    phone: '+1 (555) 901-2348',
    address: '610 Market St, San Francisco, CA 94104',
    dateOfBirth: '1996-01-18',
    joiningDate: '2023-08-15',
    managerName: 'Alex Morgan',
    status: 'active',
    basicSalary: 72000,
    houseAllowance: 10000,
    otherAllowances: 5000,
    deductions: 4000,
    tax: 8000
  }
];

const createdUsers = [];
const createdEmployees = [];

seedUsers.forEach(u => {
  const passwordHash = hashPassword(u.password);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`;

  const user = db.table('users').insert({
    employeeId: u.employeeId,
    name: u.name,
    email: u.email.toLowerCase(),
    passwordHash,
    role: u.role,
    profileImage: avatar
  });
  createdUsers.push(user);

  const employee = db.table('employees').insert({
    userId: user.id,
    employeeId: user.employeeId,
    department: u.department,
    designation: u.designation,
    phone: u.phone,
    address: u.address,
    dateOfBirth: u.dateOfBirth,
    joiningDate: u.joiningDate,
    managerName: u.managerName,
    status: u.status
  });
  createdEmployees.push({ ...employee, seedData: u });

  // Add document records
  db.table('documents').insert({
    employeeId: employee.id,
    name: `${u.name.replace(' ', '_')}_Offer_Letter.pdf`,
    type: 'PDF',
    fileUrl: '/docs/offer-letter.pdf'
  });
  db.table('documents').insert({
    employeeId: employee.id,
    name: `${u.name.replace(' ', '_')}_NDA_Agreement.pdf`,
    type: 'PDF',
    fileUrl: '/docs/nda.pdf'
  });
});

console.log(`✅ Seeded ${createdUsers.length} Users and Employees.`);

// 2. Seed 30-day Attendance History
const today = new Date();

createdEmployees.forEach((emp, empIdx) => {
  for (let i = 25; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // Skip weekends (Saturday 6, Sunday 0)
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    let status = 'present';
    let checkInTime = '09:08 AM';
    let checkOutTime = '06:12 PM';
    let hoursWorked = 8.5;

    if (isToday) {
      if (empIdx === 0 || empIdx === 1 || empIdx === 2) {
        // Checked in today
        checkInTime = '09:12 AM';
        checkOutTime = null;
        status = 'present';
        hoursWorked = 0;
      } else if (empIdx === 3) {
        // On leave today
        status = 'leave';
        checkInTime = null;
        checkOutTime = null;
        hoursWorked = 0;
      } else {
        // Not checked in yet
        status = 'not_checked_in';
        checkInTime = null;
        checkOutTime = null;
        hoursWorked = 0;
      }
    } else {
      // Historical distribution
      const rand = (empIdx * 17 + i * 13) % 100;
      if (rand < 6) {
        status = 'absent';
        checkInTime = null;
        checkOutTime = null;
        hoursWorked = 0;
      } else if (rand < 14) {
        status = 'half-day';
        checkInTime = '09:30 AM';
        checkOutTime = '01:45 PM';
        hoursWorked = 4.25;
      } else if (rand < 20) {
        status = 'leave';
        checkInTime = null;
        checkOutTime = null;
        hoursWorked = 0;
      } else {
        status = 'present';
        const min = 5 + (rand % 25);
        checkInTime = `09:${String(min).padStart(2, '0')} AM`;
        checkOutTime = `06:${String(min + 5).padStart(2, '0')} PM`;
        hoursWorked = 8.5;
      }
    }

    if (status !== 'not_checked_in') {
      db.table('attendance').insert({
        employeeId: emp.id,
        date: dateStr,
        checkInTime,
        checkOutTime,
        status,
        hoursWorked
      });
    }
  }
});

console.log('✅ Seeded 30 days of attendance records.');

// 3. Seed Leave Requests
const leaveSamples = [
  {
    employeeId: 2, // Alex Morgan (Employee Demo Account)
    leaveType: 'Paid Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    numberOfDays: 3,
    remarks: 'Attending React & Cloud Architecture Conference.',
    status: 'pending',
    adminComment: '',
    appliedOn: '2026-08-20'
  },
  {
    employeeId: 2, // Alex Morgan
    leaveType: 'Sick Leave',
    startDate: '2026-07-14',
    endDate: '2026-07-15',
    numberOfDays: 2,
    remarks: 'Seasonal flu recovery and rest.',
    status: 'approved',
    adminComment: 'Get well soon!',
    appliedOn: '2026-07-13'
  },
  {
    employeeId: 2, // Alex Morgan
    leaveType: 'Casual Leave',
    startDate: '2026-06-05',
    endDate: '2026-06-05',
    numberOfDays: 1,
    remarks: 'Personal family commitment.',
    status: 'approved',
    adminComment: 'Approved.',
    appliedOn: '2026-06-01'
  },
  {
    employeeId: 3, // Sophia Chen
    leaveType: 'Paid Leave',
    startDate: '2026-08-28',
    endDate: '2026-09-02',
    numberOfDays: 4,
    remarks: 'Annual vacation with family.',
    status: 'pending',
    adminComment: '',
    appliedOn: '2026-08-21'
  },
  {
    employeeId: 4, // Marcus Vance
    leaveType: 'Paid Leave',
    startDate: '2026-08-22',
    endDate: '2026-08-25',
    numberOfDays: 2,
    remarks: 'Out of town for personal travel.',
    status: 'approved',
    adminComment: 'Enjoy your trip.',
    appliedOn: '2026-08-18'
  },
  {
    employeeId: 5, // Elena Rostova
    leaveType: 'Casual Leave',
    startDate: '2026-08-10',
    endDate: '2026-08-11',
    numberOfDays: 2,
    remarks: 'Moving to new apartment.',
    status: 'approved',
    adminComment: 'Approved.',
    appliedOn: '2026-08-05'
  },
  {
    employeeId: 6, // Daniel Kim
    leaveType: 'Paid Leave',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    numberOfDays: 8,
    remarks: 'Extended holiday travel.',
    status: 'rejected',
    adminComment: 'Key product launch sprint week; please reschedule to late July.',
    appliedOn: '2026-06-15'
  },
  {
    employeeId: 7, // Olivia Bennett
    leaveType: 'Paid Leave',
    startDate: '2026-09-15',
    endDate: '2026-09-18',
    numberOfDays: 4,
    remarks: 'Post quarter-close downtime.',
    status: 'pending',
    adminComment: '',
    appliedOn: '2026-08-22'
  }
];

leaveSamples.forEach(l => {
  db.table('leaves').insert(l);
});

console.log('✅ Seeded Leave Requests (Pending, Approved, Rejected).');

// 4. Seed 6 Months of Payroll Records
const months = [
  { month: 'March', year: 2026, status: 'paid', paymentDate: '2026-03-31' },
  { month: 'April', year: 2026, status: 'paid', paymentDate: '2026-04-30' },
  { month: 'May', year: 2026, status: 'paid', paymentDate: '2026-05-31' },
  { month: 'June', year: 2026, status: 'paid', paymentDate: '2026-06-30' },
  { month: 'July', year: 2026, status: 'paid', paymentDate: '2026-07-31' },
  { month: 'August', year: 2026, status: 'paid', paymentDate: '2026-08-22' }
];

createdEmployees.forEach(emp => {
  const seed = emp.seedData;
  const netSalary = seed.basicSalary + seed.houseAllowance + seed.otherAllowances - seed.deductions - seed.tax;

  months.forEach(m => {
    db.table('payroll').insert({
      employeeId: emp.id,
      month: m.month,
      year: m.year,
      basicSalary: seed.basicSalary,
      houseAllowance: seed.houseAllowance,
      otherAllowances: seed.otherAllowances,
      deductions: seed.deductions,
      tax: seed.tax,
      netSalary,
      status: m.status,
      paymentDate: m.paymentDate
    });
  });
});

console.log('✅ Seeded Payroll records across all employees.');

// 5. Seed Notifications
const initialNotifications = [
  {
    userId: 1, // Admin (Priya)
    title: 'New Leave Request Submitted',
    message: 'Alex Morgan submitted a request for 3 days of Paid Leave (Sep 10 - Sep 12).',
    type: 'warning',
    isRead: false,
    link: '/leave-approvals'
  },
  {
    userId: 1, // Admin
    title: 'Monthly Payroll Disbursed',
    message: 'August 2026 company payroll has been processed successfully for 8 active employees.',
    type: 'success',
    isRead: false,
    link: '/payroll'
  },
  {
    userId: 1, // Admin
    title: 'System Health Check',
    message: 'Dayflow HRMS database and automated check-in services running optimally.',
    type: 'info',
    isRead: true,
    link: '/dashboard'
  },
  {
    userId: 2, // Employee (Alex Morgan)
    title: 'August Payslip Available',
    message: 'Your salary statement for August 2026 ($97,000 net) is now available for download.',
    type: 'success',
    isRead: false,
    link: '/payroll'
  },
  {
    userId: 2, // Employee
    title: 'Check-in Reminder',
    message: 'Good morning Alex! Don\'t forget to record your workday check-in.',
    type: 'info',
    isRead: false,
    link: '/attendance'
  },
  {
    userId: 2, // Employee
    title: 'Leave Request Approved',
    message: 'Your Sick Leave request for July 14 - July 15 has been approved by Priya Sharma.',
    type: 'success',
    isRead: true,
    link: '/leaves'
  }
];

initialNotifications.forEach(n => db.table('notifications').insert(n));

console.log('✅ Seeded Notifications.');
console.log('✨ Dayflow HRMS Database Seeding Complete!');
console.log('=========================================');
console.log('Admin:    admin@dayflow.com    / Admin@123');
console.log('Employee: employee@dayflow.com / Employee@123');
console.log('=========================================');
