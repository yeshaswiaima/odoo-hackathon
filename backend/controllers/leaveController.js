import db from '../config/db.js';

// Calculate days between two dates inclusive
const calculateDays = (startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diffDays, 0);
};

export const getLeaveBalances = (req, res) => {
  try {
    const employeeId = req.user.employeeRecordId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated.' });
    }

    const currentYear = new Date().getFullYear();
    const leaves = db.table('leaves').find(l => {
      return l.employeeId === Number(employeeId) &&
        l.status === 'approved' &&
        new Date(l.startDate).getFullYear() === currentYear;
    });

    const paidUsed = leaves
      .filter(l => (l.leaveType || '').toLowerCase().includes('paid') || (l.leaveType || '').toLowerCase().includes('annual') || (l.leaveType || '').toLowerCase().includes('casual'))
      .reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);

    const sickUsed = leaves
      .filter(l => (l.leaveType || '').toLowerCase().includes('sick') || (l.leaveType || '').toLowerCase().includes('medical'))
      .reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);

    const unpaidUsed = leaves
      .filter(l => (l.leaveType || '').toLowerCase().includes('unpaid'))
      .reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);

    const totalPaid = 18;
    const totalSick = 12;

    return res.status(200).json({
      success: true,
      balances: {
        paidLeave: {
          total: totalPaid,
          used: paidUsed,
          remaining: Math.max(totalPaid - paidUsed, 0)
        },
        sickLeave: {
          total: totalSick,
          used: sickUsed,
          remaining: Math.max(totalSick - sickUsed, 0)
        },
        unpaidLeave: {
          used: unpaidUsed
        }
      }
    });
  } catch (err) {
    console.error('Get leave balances error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave balances.' });
  }
};

export const getMyLeaves = (req, res) => {
  try {
    const employeeId = req.user.employeeRecordId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated.' });
    }

    const leaves = db.table('leaves').find(l => l.employeeId === Number(employeeId));
    // Sort descending
    leaves.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

    return res.status(200).json({
      success: true,
      leaves
    });
  } catch (err) {
    console.error('Get my leaves error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave history.' });
  }
};

export const applyLeave = (req, res) => {
  try {
    const employeeId = req.user.employeeRecordId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated.' });
    }

    const { leaveType, startDate, endDate, remarks } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, and end date are required.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      });
    }

    const numberOfDays = calculateDays(startDate, endDate);
    if (numberOfDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date selection. Duration must be at least 1 day.'
      });
    }

    const newLeave = db.table('leaves').insert({
      employeeId: Number(employeeId),
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      remarks: remarks || '',
      status: 'pending',
      adminComment: '',
      appliedOn: new Date().toISOString().split('T')[0]
    });

    // Notify Admins
    const adminUsers = db.table('users').find(u => u.role === 'admin' || u.role === 'hr');
    adminUsers.forEach(admin => {
      db.table('notifications').insert({
        userId: admin.id,
        title: 'New Leave Request',
        message: `${req.user.name} applied for ${numberOfDays} day(s) of ${leaveType} (${startDate} to ${endDate}).`,
        type: 'warning',
        isRead: false,
        link: '/leave-approvals'
      });
    });

    // Notify employee of submission
    db.table('notifications').insert({
      userId: req.user.id,
      title: 'Leave Request Submitted',
      message: `Your ${leaveType} request for ${numberOfDays} day(s) has been submitted for review.`,
      type: 'info',
      isRead: false,
      link: '/leaves'
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      leave: newLeave
    });
  } catch (err) {
    console.error('Apply leave error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.' });
  }
};

export const getAllLeaves = (req, res) => {
  try {
    const { status = 'all', leaveType = 'all', search = '' } = req.query;

    const allLeaves = db.table('leaves').find();
    const employees = db.table('employees').find();
    const users = db.table('users').find();

    let combined = allLeaves.map(leave => {
      const emp = employees.find(e => e.id === leave.employeeId) || {};
      const user = users.find(u => u.id === emp.userId || u.employeeId === emp.employeeId) || {};

      return {
        id: leave.id,
        employeeId: leave.employeeId,
        empCode: emp.employeeId || 'N/A',
        employeeName: user.name || 'Unknown Employee',
        employeeEmail: user.email || '',
        profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.employeeId}`,
        department: emp.department || 'General',
        designation: emp.designation || 'Staff',
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        numberOfDays: leave.numberOfDays,
        remarks: leave.remarks,
        status: leave.status,
        adminComment: leave.adminComment,
        appliedOn: leave.appliedOn || leave.createdAt ? leave.createdAt.split('T')[0] : leave.startDate,
        createdAt: leave.createdAt
      };
    });

    if (status && status !== 'all' && status !== 'All') {
      combined = combined.filter(l => (l.status || '').toLowerCase() === status.toLowerCase());
    }

    if (leaveType && leaveType !== 'all' && leaveType !== 'All') {
      combined = combined.filter(l => (l.leaveType || '').toLowerCase() === leaveType.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(l =>
        l.employeeName.toLowerCase().includes(q) ||
        l.empCode.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

    const pendingCount = combined.filter(l => l.status === 'pending').length;
    const approvedCount = combined.filter(l => l.status === 'approved').length;
    const rejectedCount = combined.filter(l => l.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      count: combined.length,
      leaves: combined,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    });
  } catch (err) {
    console.error('Get all leaves error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave requests.' });
  }
};

export const approveLeave = (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment = '' } = req.body;

    const leave = db.table('leaves').findById(Number(id));
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const updated = db.table('leaves').update(leave.id, {
      status: 'approved',
      adminComment: adminComment || 'Approved by HR'
    });

    // Notify the employee
    const emp = db.table('employees').findById(leave.employeeId);
    if (emp && emp.userId) {
      db.table('notifications').insert({
        userId: emp.userId,
        title: 'Leave Request Approved',
        message: `Your ${leave.leaveType} request for ${leave.numberOfDays} day(s) (${leave.startDate} to ${leave.endDate}) has been approved.${adminComment ? ` Note: ${adminComment}` : ''}`,
        type: 'success',
        isRead: false,
        link: '/leaves'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Leave request approved successfully.',
      leave: updated
    });
  } catch (err) {
    console.error('Approve leave error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve leave request.' });
  }
};

export const rejectLeave = (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment = 'Request cannot be accommodated at this time.' } = req.body;

    const leave = db.table('leaves').findById(Number(id));
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const updated = db.table('leaves').update(leave.id, {
      status: 'rejected',
      adminComment
    });

    // Notify the employee
    const emp = db.table('employees').findById(leave.employeeId);
    if (emp && emp.userId) {
      db.table('notifications').insert({
        userId: emp.userId,
        title: 'Leave Request Rejected',
        message: `Your ${leave.leaveType} request for ${leave.numberOfDays} day(s) was rejected. Reason: ${adminComment}`,
        type: 'danger',
        isRead: false,
        link: '/leaves'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected.',
      leave: updated
    });
  } catch (err) {
    console.error('Reject leave error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject leave request.' });
  }
};

export const cancelLeave = (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeRecordId;

    const leave = db.table('leaves').findById(Number(id));
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.employeeId !== Number(employeeId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only cancel your own requests.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled.' });
    }

    db.table('leaves').delete(leave.id);

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.'
    });
  } catch (err) {
    console.error('Cancel leave error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel leave request.' });
  }
};
