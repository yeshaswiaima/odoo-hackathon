import db from '../config/db.js';

export const getDashboardMetrics = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const role = (req.user.role || '').toLowerCase();
    const isAdmin = ['admin', 'hr'].includes(role);

    const employees = db.table('employees').find({ status: 'active' });
    const users = db.table('users').find();
    const attendanceToday = db.table('attendance').find({ date: today });
    const pendingLeaves = db.table('leaves').find({ status: 'pending' });
    const approvedLeaves = db.table('leaves').find({ status: 'approved' });

    // Active leaves today
    const leavesToday = approvedLeaves.filter(l => {
      return l.startDate <= today && l.endDate >= today;
    });

    if (isAdmin) {
      const presentToday = attendanceToday.filter(a => a.status === 'present').length;
      const halfDayToday = attendanceToday.filter(a => a.status === 'half-day' || a.status === 'half_day').length;
      const absentToday = Math.max(employees.length - presentToday - halfDayToday - leavesToday.length, 0);

      // Recent Activity timeline
      const recentNotifications = db.table('notifications').find().slice(-6).reverse();
      const recentLeaves = db.table('leaves').find().slice(-5).reverse().map(l => {
        const emp = employees.find(e => e.id === l.employeeId) || {};
        const u = users.find(usr => usr.id === emp.userId || usr.employeeId === emp.employeeId) || {};
        return {
          id: l.id,
          employeeName: u.name || 'Employee',
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          numberOfDays: l.numberOfDays,
          status: l.status,
          appliedOn: l.appliedOn || l.createdAt ? l.createdAt.split('T')[0] : l.startDate
        };
      });

      return res.status(200).json({
        success: true,
        metrics: {
          totalEmployees: employees.length,
          presentToday,
          absentToday,
          halfDayToday,
          onLeaveToday: leavesToday.length,
          pendingLeaveRequests: pendingLeaves.length,
          attendanceRate: employees.length > 0 ? Math.round(((presentToday + halfDayToday * 0.5) / employees.length) * 100) : 100
        },
        attendanceBreakdown: {
          present: presentToday,
          absent: absentToday,
          halfDay: halfDayToday,
          onLeave: leavesToday.length
        },
        pendingLeavesList: pendingLeaves.slice(0, 5).map(l => {
          const emp = employees.find(e => e.id === l.employeeId) || {};
          const u = users.find(usr => usr.id === emp.userId) || {};
          return {
            id: l.id,
            employeeId: emp.employeeId,
            employeeName: u.name || 'Employee',
            profileImage: u.profileImage,
            department: emp.department,
            leaveType: l.leaveType,
            startDate: l.startDate,
            endDate: l.endDate,
            numberOfDays: l.numberOfDays,
            remarks: l.remarks,
            appliedOn: l.appliedOn || l.createdAt
          };
        }),
        recentActivities: recentNotifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          time: n.createdAt
        }))
      });
    } else {
      // Employee Dashboard metrics
      const employeeId = req.user.employeeRecordId;
      const myTodayAttendance = attendanceToday.find(a => a.employeeId === Number(employeeId));
      const myLeaves = db.table('leaves').find(l => l.employeeId === Number(employeeId));
      const myPendingLeaves = myLeaves.filter(l => l.status === 'pending');
      const myPayrolls = db.table('payroll').find(p => p.employeeId === Number(employeeId));
      const currentPayroll = myPayrolls.length > 0 ? myPayrolls[myPayrolls.length - 1] : null;

      // Balance
      const currentYear = new Date().getFullYear();
      const approvedPaid = myLeaves
        .filter(l => l.status === 'approved' && (l.leaveType || '').toLowerCase().includes('paid') && new Date(l.startDate).getFullYear() === currentYear)
        .reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);
      const approvedSick = myLeaves
        .filter(l => l.status === 'approved' && (l.leaveType || '').toLowerCase().includes('sick') && new Date(l.startDate).getFullYear() === currentYear)
        .reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);

      const userNotifications = db.table('notifications').find(n => n.userId === req.user.id).slice(-5).reverse();

      return res.status(200).json({
        success: true,
        metrics: {
          todayAttendance: myTodayAttendance || { status: 'not_checked_in' },
          remainingPaidLeave: Math.max(18 - approvedPaid, 0),
          remainingSickLeave: Math.max(12 - approvedSick, 0),
          pendingLeaveRequestsCount: myPendingLeaves.length,
          netSalary: currentPayroll ? currentPayroll.netSalary : 71000,
          payrollMonth: currentPayroll ? currentPayroll.month : 'Current'
        },
        recentActivities: userNotifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          time: n.createdAt
        }))
      });
    }
  } catch (err) {
    console.error('Get dashboard metrics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
};

export const getReportsData = (req, res) => {
  try {
    const employees = db.table('employees').find({ status: 'active' });
    const payrolls = db.table('payroll').find();
    const attendance = db.table('attendance').find();
    const leaves = db.table('leaves').find();

    // 1. Department Headcount & Salary breakdown
    const deptMap = {};
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, headcount: 0, totalSalary: 0 };
      }
      deptMap[dept].headcount += 1;

      const empPayroll = payrolls.filter(p => p.employeeId === emp.id);
      if (empPayroll.length > 0) {
        deptMap[dept].totalSalary += Number(empPayroll[empPayroll.length - 1].netSalary) || 0;
      }
    });

    const departmentStats = Object.values(deptMap);

    // 2. Attendance Summary
    const totalAttendanceRecords = attendance.length;
    const presentTotal = attendance.filter(a => a.status === 'present').length;
    const halfDayTotal = attendance.filter(a => a.status === 'half-day' || a.status === 'half_day').length;
    const absentTotal = attendance.filter(a => a.status === 'absent').length;

    // 3. Leave Distribution
    const leaveTypeCounts = {
      'Paid / Annual Leave': leaves.filter(l => (l.leaveType || '').toLowerCase().includes('paid')).length,
      'Sick / Medical Leave': leaves.filter(l => (l.leaveType || '').toLowerCase().includes('sick')).length,
      'Casual Leave': leaves.filter(l => (l.leaveType || '').toLowerCase().includes('casual')).length,
      'Unpaid Leave': leaves.filter(l => (l.leaveType || '').toLowerCase().includes('unpaid')).length
    };

    // 4. Monthly Payroll Trend (last 6 records summary)
    const totalMonthlyPayroll = payrolls
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

    return res.status(200).json({
      success: true,
      reports: {
        departmentStats,
        attendanceMetrics: {
          totalRecords: totalAttendanceRecords,
          present: presentTotal,
          halfDay: halfDayTotal,
          absent: absentTotal,
          punctualityRate: totalAttendanceRecords > 0 ? Math.round((presentTotal / totalAttendanceRecords) * 100) : 94
        },
        leaveDistribution: Object.entries(leaveTypeCounts).map(([type, count]) => ({ type, count })),
        payrollSummary: {
          totalSpend: totalMonthlyPayroll,
          averageSalary: employees.length > 0 ? Math.round(totalMonthlyPayroll / Math.max(employees.length, 1)) : 70000,
          paidCount: payrolls.filter(p => p.status === 'paid').length,
          pendingCount: payrolls.filter(p => p.status === 'pending').length
        }
      }
    });
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate reports data.' });
  }
};
