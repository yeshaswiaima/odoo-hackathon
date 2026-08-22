import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck,
  Calendar,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const EmployeeAttendancePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    attendanceRate: 100
  });

  const [todayRecord, setTodayRecord] = useState({
    status: 'not_checked_in',
    checkInTime: null,
    checkOutTime: null,
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedMonth = currentDate.getMonth() + 1;
  const selectedYear = currentDate.getFullYear();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [historyRes, todayRes] = await Promise.all([
        api.get('/attendance/my', { month: selectedMonth, year: selectedYear }),
        api.get('/attendance/today')
      ]);

      if (historyRes.success) {
        setAttendanceRecords(historyRes.records || []);
        setStats(historyRes.stats || {});
      }

      if (todayRes.success && todayRes.record) {
        setTodayRecord(todayRes.record);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
      toast.error('Unable to retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/attendance/check-in');
      if (res.success && res.record) {
        setTodayRecord(res.record);
        toast.success(res.message || 'Check-in recorded successfully!', 'Workday Started');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/attendance/check-out');
      if (res.success && res.record) {
        setTodayRecord(res.record);
        toast.success(res.message || 'Check-out recorded successfully!', 'Workday Completed');
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = todayRecord?.checkInTime && !todayRecord?.checkOutTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
  };

  // Calendar Day generator for visual monthly view
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 is Sun

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Attendance & Workday Logs</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Track your daily clock-in timestamps, monthly attendance percentage, and work hours.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-white border border-brand-border rounded-xl px-3 py-1.5 shadow-xs">
          <button
            onClick={prevMonth}
            className="p-1 rounded text-brand-muted hover:text-brand-navy hover:bg-slate-100 transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-brand-navy px-2">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-1 rounded text-brand-muted hover:text-brand-navy hover:bg-slate-100 transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate || 100}%`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Present Days"
          value={stats.present || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Half Days"
          value={stats.halfDay || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Leave Days"
          value={stats.leave || 0}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Absent Days"
          value={stats.absent || 0}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Check In / Check Out Interactive Action Card */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate text-white p-6 rounded-2xl border border-slate-800 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-xl font-bold">
                {isCheckedOut
                  ? 'Completed Workday'
                  : isCheckedIn
                  ? `Checked In at ${todayRecord.checkInTime}`
                  : 'Not Checked In Yet'}
              </h3>
              <StatusBadge status={isCheckedOut ? 'present' : isCheckedIn ? 'present' : 'not checked in'} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isCheckedIn && !isCheckedOut ? (
            <Button
              variant="primary"
              size="lg"
              icon={LogIn}
              className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue-hover text-white px-6 shadow-md"
              isLoading={actionLoading}
              onClick={handleCheckIn}
            >
              Record Check In
            </Button>
          ) : isCheckedIn ? (
            <Button
              variant="secondary"
              size="lg"
              icon={LogOut}
              className="w-full md:w-auto text-brand-navy bg-white hover:bg-slate-100 px-6 shadow-md"
              isLoading={actionLoading}
              onClick={handleCheckOut}
            >
              Record Check Out
            </Button>
          ) : (
            <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Workday completed (Check out: {todayRecord.checkOutTime})
            </div>
          )}
        </div>
      </div>

      {/* Monthly Attendance Calendar Grid */}
      <Card
        title="Monthly Attendance Calendar"
        subtitle={`Color-coded daily status log for ${monthName}`}
      >
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-brand-muted pb-3 border-b border-brand-border">
          <span className="font-semibold text-brand-navy">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Half-day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200" />
            <span>Weekend / Rest</span>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-brand-muted">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Tiles */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`offset-${i}`} className="h-16 rounded-xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            const rec = attendanceRecords.find(r => r.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            let tileBg = 'bg-white border-brand-border';
            let statusDot = null;
            let statusText = isWeekend ? 'Weekend' : 'Off';

            if (rec) {
              if (rec.status === 'present') {
                tileBg = 'bg-emerald-50/70 border-emerald-200 text-emerald-950';
                statusDot = 'bg-emerald-500';
                statusText = 'Present';
              } else if (rec.status === 'half-day' || rec.status === 'half_day') {
                tileBg = 'bg-amber-50/70 border-amber-200 text-amber-950';
                statusDot = 'bg-amber-500';
                statusText = 'Half-day';
              } else if (rec.status === 'leave') {
                tileBg = 'bg-blue-50/70 border-blue-200 text-blue-950';
                statusDot = 'bg-blue-500';
                statusText = 'On Leave';
              } else if (rec.status === 'absent') {
                tileBg = 'bg-rose-50/70 border-rose-200 text-rose-950';
                statusDot = 'bg-rose-500';
                statusText = 'Absent';
              }
            } else if (isWeekend) {
              tileBg = 'bg-slate-50 border-slate-200 text-slate-400';
            }

            return (
              <div
                key={dayNum}
                className={`h-16 p-2 rounded-xl border transition-all flex flex-col justify-between ${tileBg} ${
                  isToday ? 'ring-2 ring-brand-blue ring-offset-1 font-bold' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{dayNum}</span>
                  {statusDot && <span className={`w-2 h-2 rounded-full ${statusDot}`} />}
                </div>

                <span className="text-[10px] font-medium truncate mt-auto">
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Attendance History Table */}
      <Card
        title="Attendance Records Log"
        subtitle={`Detailed timestamp breakdown for ${monthName}`}
      >
        {attendanceRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-muted">
            No attendance records found for this month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Work Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendanceRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-brand-navy">
                      {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.checkInTime || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.checkOutTime || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.hoursWorked ? `${r.hoursWorked} hrs` : r.checkInTime && r.checkOutTime ? '8.5 hrs' : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeAttendancePage;
