import db from '../config/db.js';

// Format date as YYYY-MM-DD
const formatDate = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

// Format time as HH:MM AM/PM
const formatTime = (d = new Date()) => {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getTodayStatus = (req, res) => {
  try {
    const today = formatDate();
    const employeeId = req.user.employeeRecordId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated with user.' });
    }

    const record = db.table('attendance').findOne({
      employeeId: Number(employeeId),
      date: today
    });

    return res.status(200).json({
      success: true,
      today,
      record: record || {
        employeeId: Number(employeeId),
        date: today,
        checkInTime: null,
        checkOutTime: null,
        status: 'not_checked_in'
      }
    });
  } catch (err) {
    console.error('Get today attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve today\'s attendance status.' });
  }
};

export const checkIn = (req, res) => {
  try {
    const today = formatDate();
    const employeeId = req.user.employeeRecordId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated with user.' });
    }

    const existing = db.table('attendance').findOne({
      employeeId: Number(employeeId),
      date: today
    });

    if (existing && existing.checkInTime) {
      return res.status(400).json({
        success: false,
        message: `You have already checked in today at ${existing.checkInTime}.`
      });
    }

    const nowTime = formatTime();
    let record;

    if (existing) {
      record = db.table('attendance').update(existing.id, {
        checkInTime: nowTime,
        status: 'present'
      });
    } else {
      record = db.table('attendance').insert({
        employeeId: Number(employeeId),
        date: today,
        checkInTime: nowTime,
        checkOutTime: null,
        status: 'present',
        hoursWorked: 0
      });
    }

    // Add activity notification
    db.table('notifications').insert({
      userId: req.user.id,
      title: 'Attendance Check-in',
      message: `You checked in successfully today at ${nowTime}. Have a productive day!`,
      type: 'success',
      isRead: false,
      link: '/attendance'
    });

    return res.status(200).json({
      success: true,
      message: `Checked in successfully at ${nowTime}.`,
      record
    });
  } catch (err) {
    console.error('Check-in error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record check-in.' });
  }
};

export const checkOut = (req, res) => {
  try {
    const today = formatDate();
    const employeeId = req.user.employeeRecordId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated with user.' });
    }

    const record = db.table('attendance').findOne({
      employeeId: Number(employeeId),
      date: today
    });

    if (!record || !record.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in yet today.'
      });
    }

    if (record.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: `You have already checked out today at ${record.checkOutTime}.`
      });
    }

    const nowTime = formatTime();

    // Approximate hours worked
    const updated = db.table('attendance').update(record.id, {
      checkOutTime: nowTime,
      hoursWorked: 8.5
    });

    db.table('notifications').insert({
      userId: req.user.id,
      title: 'Attendance Check-out',
      message: `You checked out at ${nowTime}. Work hours recorded.`,
      type: 'info',
      isRead: false,
      link: '/attendance'
    });

    return res.status(200).json({
      success: true,
      message: `Checked out successfully at ${nowTime}.`,
      record: updated
    });
  } catch (err) {
    console.error('Check-out error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record check-out.' });
  }
};

export const getMyAttendance = (req, res) => {
  try {
    const employeeId = req.user.employeeRecordId;
    const { month, year } = req.query;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated with user.' });
    }

    const records = db.table('attendance').find(r => r.employeeId === Number(employeeId));

    // Filter by year / month if provided
    let filtered = records;
    if (year && month) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      filtered = records.filter(r => r.date.startsWith(prefix));
    }

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Stats
    const presentCount = filtered.filter(r => r.status === 'present').length;
    const absentCount = filtered.filter(r => r.status === 'absent').length;
    const halfDayCount = filtered.filter(r => r.status === 'half-day' || r.status === 'half_day').length;
    const leaveCount = filtered.filter(r => r.status === 'leave').length;

    return res.status(200).json({
      success: true,
      records: filtered,
      stats: {
        totalDays: filtered.length,
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        attendanceRate: filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 100
      }
    });
  } catch (err) {
    console.error('Get my attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance history.' });
  }
};

export const getAllAttendance = (req, res) => {
  try {
    const { date, department, status, search = '' } = req.query;

    const allAttendance = db.table('attendance').find();
    const employees = db.table('employees').find();
    const users = db.table('users').find();

    let combined = allAttendance.map(att => {
      const emp = employees.find(e => e.id === att.employeeId) || {};
      const user = users.find(u => u.id === emp.userId || u.employeeId === emp.employeeId) || {};

      return {
        id: att.id,
        employeeId: att.employeeId,
        empCode: emp.employeeId || 'N/A',
        name: user.name || 'Unknown Employee',
        email: user.email || '',
        department: emp.department || 'General',
        designation: emp.designation || 'Staff',
        profileImage: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${att.employeeId}`,
        date: att.date,
        checkInTime: att.checkInTime,
        checkOutTime: att.checkOutTime,
        status: att.status,
        hoursWorked: att.hoursWorked || (att.checkInTime && att.checkOutTime ? 8.5 : 0)
      };
    });

    if (date) {
      combined = combined.filter(r => r.date === date);
    }

    if (department && department !== 'All') {
      combined = combined.filter(r => (r.department || '').toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'All') {
      combined = combined.filter(r => (r.status || '').toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.empCode.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }

    // Sort by date desc
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Quick stats for the selected date / filter
    const present = combined.filter(r => r.status === 'present').length;
    const absent = combined.filter(r => r.status === 'absent').length;
    const halfDay = combined.filter(r => r.status === 'half-day' || r.status === 'half_day').length;
    const leave = combined.filter(r => r.status === 'leave').length;

    return res.status(200).json({
      success: true,
      count: combined.length,
      records: combined,
      stats: {
        present,
        absent,
        halfDay,
        leave
      }
    });
  } catch (err) {
    console.error('Get all attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance records.' });
  }
};

export const markAttendance = (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, hoursWorked } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ success: false, message: 'Employee ID, date, and status are required.' });
    }

    const existing = db.table('attendance').findOne({
      employeeId: Number(employeeId),
      date
    });

    let record;
    if (existing) {
      record = db.table('attendance').update(existing.id, {
        checkInTime: checkInTime || existing.checkInTime,
        checkOutTime: checkOutTime || existing.checkOutTime,
        status,
        hoursWorked: hoursWorked !== undefined ? Number(hoursWorked) : existing.hoursWorked
      });
    } else {
      record = db.table('attendance').insert({
        employeeId: Number(employeeId),
        date,
        checkInTime: checkInTime || '09:00 AM',
        checkOutTime: checkOutTime || (status === 'present' ? '06:00 PM' : null),
        status,
        hoursWorked: hoursWorked !== undefined ? Number(hoursWorked) : (status === 'present' ? 8.5 : 0)
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      record
    });
  } catch (err) {
    console.error('Mark attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark attendance.' });
  }
};
