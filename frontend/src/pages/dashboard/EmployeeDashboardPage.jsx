import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  LogIn,
  LogOut,
  Sparkles,
  CalendarCheck,
  Palmtree,
  FileText,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({
    status: 'not_checked_in',
    checkInTime: null,
    checkOutTime: null,
  });
  const [metrics, setMetrics] = useState({
    remainingPaidLeave: 18,
    remainingSickLeave: 12,
    pendingLeaveRequestsCount: 0,
    netSalary: 71000,
    payrollMonth: 'Current'
  });
  const [activities, setActivities] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, metricsRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/reports/metrics')
      ]);

      if (todayRes.success && todayRes.record) {
        setTodayAttendance(todayRes.record);
      }

      if (metricsRes.success && metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
        setActivities(metricsRes.recentActivities || []);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
      toast.error('Unable to refresh dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setAttendanceLoading(true);
      const res = await api.post('/attendance/check-in');
      if (res.success && res.record) {
        setTodayAttendance(res.record);
        toast.success(res.message || 'Checked in successfully!', 'Attendance Recorded');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to check in.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttendanceLoading(true);
      const res = await api.post('/attendance/check-out');
      if (res.success && res.record) {
        setTodayAttendance(res.record);
        toast.success(res.message || 'Checked out successfully!', 'Workday Completed');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to check out.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const isCheckedIn = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const isCheckedOut = !!todayAttendance?.checkOutTime;

  if (loading) {
    return <LoadingSkeleton count={4} type="stat" />;
  }

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate text-white p-6 sm:p-8 rounded-2xl shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Employee Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greetingTime()}, {user?.name?.split(' ')[0] || 'Team Member'} 👋
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Here's a quick overview of your workday, attendance status, and pending approvals.
          </p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Today's Attendance Widget */}
        <Card className="flex flex-col justify-between" bodyClassName="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Today's Attendance
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-brand-blue">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={isCheckedOut ? 'present' : isCheckedIn ? 'present' : 'not checked in'} />
              </div>
              <p className="text-xs text-brand-muted mt-2">
                {isCheckedOut
                  ? `Checked out at ${todayAttendance.checkOutTime}`
                  : isCheckedIn
                  ? `Checked in at ${todayAttendance.checkInTime}`
                  : 'You have not checked in yet today.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border">
            {!isCheckedIn && !isCheckedOut ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={LogIn}
                isLoading={attendanceLoading}
                onClick={handleCheckIn}
              >
                Check In Now
              </Button>
            ) : isCheckedIn ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-brand-blue border-blue-200 hover:bg-blue-50"
                icon={LogOut}
                isLoading={attendanceLoading}
                onClick={handleCheckOut}
              >
                Check Out
              </Button>
            ) : (
              <div className="text-center py-1 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Day Completed (8.5 hrs)</span>
              </div>
            )}
          </div>
        </Card>

        {/* 2. Leave Balance Card */}
        <Card className="flex flex-col justify-between" bodyClassName="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Leave Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-success">
                <Palmtree className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-navy">
                {metrics.remainingPaidLeave + metrics.remainingSickLeave}
              </span>
              <span className="text-xs text-brand-muted">Days available</span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-brand-muted">
              <div className="flex justify-between">
                <span>Paid Leave:</span>
                <span className="font-semibold text-brand-navy">{metrics.remainingPaidLeave} / 18</span>
              </div>
              <div className="flex justify-between">
                <span>Sick Leave:</span>
                <span className="font-semibold text-brand-navy">{metrics.remainingSickLeave} / 12</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/leaves')}
            >
              Apply for Leave
            </Button>
          </div>
        </Card>

        {/* 3. Pending Requests Card */}
        <Card className="flex flex-col justify-between" bodyClassName="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Pending Requests
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-brand-warning">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-navy">
                {metrics.pendingLeaveRequestsCount}
              </span>
              <span className="text-xs text-brand-muted">Awaiting approval</span>
            </div>

            <p className="text-xs text-brand-muted mt-2">
              {metrics.pendingLeaveRequestsCount > 0
                ? 'Your manager has been notified of your requests.'
                : 'No pending time-off requests.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border">
            <button
              onClick={() => navigate('/leaves')}
              className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover flex items-center justify-center w-full gap-1 py-1"
            >
              View Leave History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* 4. Payroll Card */}
        <Card className="flex flex-col justify-between" bodyClassName="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Payroll
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-navy">
                ${metrics.netSalary.toLocaleString()}
              </span>
              <span className="text-xs text-brand-muted">/ mo net</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-brand-muted">Status: Active Disbursal</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/payroll')}
            >
              View Payroll & Payslip
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Workspace 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Activity & Workday Feed"
            subtitle="Real-time log of your attendance, approvals, and company updates"
          >
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-brand-muted">
                No recent activity recorded today.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-brand-navy">{act.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{act.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Quick Links & Company Alerts */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card title="Quick Actions" subtitle="Frequently used workforce shortcuts">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/attendance')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-border hover:border-brand-blue/40 hover:bg-blue-50/30 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <span className="text-xs font-medium text-brand-navy">Attendance Calendar</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-muted" />
              </button>

              <button
                onClick={() => navigate('/leaves')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-border hover:border-brand-blue/40 hover:bg-blue-50/30 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Palmtree className="w-4 h-4 text-brand-success" />
                  <span className="text-xs font-medium text-brand-navy">Apply for Time Off</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-muted" />
              </button>

              <button
                onClick={() => navigate('/payroll')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-brand-border hover:border-brand-blue/40 hover:bg-blue-50/30 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-brand-navy">Download Latest Payslip</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-muted" />
              </button>
            </div>
          </Card>

          {/* Company Announcements / Alerts Card */}
          <Card title="Upcoming & Alerts" subtitle="Important reminders for this week">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-brand-navy">August Payroll Statement Ready</h5>
                  <p className="text-[11px] text-brand-muted mt-0.5 leading-normal">
                    Your monthly salary and tax withholdings statement for August 2026 is published.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-brand-navy">Upcoming Company Holiday</h5>
                  <p className="text-[11px] text-brand-muted mt-0.5 leading-normal">
                    Labor Day holiday on Monday, September 7. Office will be closed.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
