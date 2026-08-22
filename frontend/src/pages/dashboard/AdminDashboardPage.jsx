import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Palmtree,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    halfDayToday: 0,
    onLeaveToday: 0,
    pendingLeaveRequests: 0,
    attendanceRate: 95
  });
  const [attendanceBreakdown, setAttendanceBreakdown] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Modals for approval/rejection
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'reject', leave: object }
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/metrics');
      if (res.success) {
        setMetrics(res.metrics || {});
        setAttendanceBreakdown(res.attendanceBreakdown || {});
        setPendingLeaves(res.pendingLeavesList || []);
        setRecentActivities(res.recentActivities || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      toast.error('Unable to fetch organization metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const handleApprove = async () => {
    if (!activeModal?.leave) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${activeModal.leave.id}/approve`, {
        adminComment: actionComment || 'Approved by HR Administrator'
      });
      if (res.success) {
        toast.success(`Leave approved for ${activeModal.leave.employeeName}`, 'Request Approved');
        setActiveModal(null);
        setActionComment('');
        fetchAdminDashboard();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeModal?.leave) return;
    if (!actionComment.trim()) {
      toast.warning('Please enter a reason for rejecting the leave request.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${activeModal.leave.id}/reject`, {
        adminComment: actionComment
      });
      if (res.success) {
        toast.info(`Leave request rejected for ${activeModal.leave.employeeName}`, 'Request Rejected');
        setActiveModal(null);
        setActionComment('');
        fetchAdminDashboard();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} type="stat" />;
  }

  const totalHeadcount = Math.max(metrics.totalEmployees, 1);
  const presentPct = Math.round((attendanceBreakdown.present / totalHeadcount) * 100);
  const absentPct = Math.round((attendanceBreakdown.absent / totalHeadcount) * 100);
  const halfDayPct = Math.round((attendanceBreakdown.halfDay / totalHeadcount) * 100);
  const onLeavePct = Math.round((attendanceBreakdown.onLeave / totalHeadcount) * 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate text-white p-6 sm:p-8 rounded-2xl shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>HR Operations Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Here is what needs your attention today across attendance, time-off approvals, and employee operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={UserPlus}
              onClick={() => navigate('/employees')}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white shadow-md"
            >
              Manage Employees
            </Button>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Employees"
          value={metrics.totalEmployees}
          icon={Users}
          color="blue"
          trend="+2"
          trendLabel="new onboarded this month"
          onClick={() => navigate('/employees')}
        />

        <StatCard
          title="Present Today"
          value={metrics.presentToday}
          icon={CalendarCheck}
          color="green"
          trend={`${metrics.attendanceRate}%`}
          trendLabel="attendance rate"
          onClick={() => navigate('/attendance')}
        />

        <StatCard
          title="Pending Leaves"
          value={metrics.pendingLeaveRequests}
          icon={CalendarDays}
          color="amber"
          trend={metrics.pendingLeaveRequests > 0 ? 'Action required' : 'All clear'}
          trendDirection={metrics.pendingLeaveRequests > 0 ? 'down' : 'up'}
          trendLabel="in approval queue"
          onClick={() => navigate('/leave-approvals')}
        />

        <StatCard
          title="Employees On Leave"
          value={metrics.onLeaveToday}
          icon={Palmtree}
          color="purple"
          trendLabel="scheduled time-off"
          onClick={() => navigate('/attendance')}
        />
      </div>

      {/* 2-Column Section: Attendance Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Visual Breakdown */}
        <Card
          title="Today's Attendance Overview"
          subtitle={`Real-time distribution for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
          action={
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {/* Progress Bars Breakdown */}
          <div className="space-y-4 pt-2">
            {/* Multi-segment bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div style={{ width: `${presentPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Present: ${attendanceBreakdown.present}`} />
              <div style={{ width: `${halfDayPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Half Day: ${attendanceBreakdown.halfDay}`} />
              <div style={{ width: `${onLeavePct}%` }} className="bg-blue-500 transition-all duration-500" title={`On Leave: ${attendanceBreakdown.onLeave}`} />
              <div style={{ width: `${absentPct}%` }} className="bg-rose-400 transition-all duration-500" title={`Absent: ${attendanceBreakdown.absent}`} />
            </div>

            {/* Metric Items Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700">Present</span>
                </div>
                <span className="text-sm font-bold text-emerald-800">{attendanceBreakdown.present}</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-slate-700">Half-day</span>
                </div>
                <span className="text-sm font-bold text-amber-800">{attendanceBreakdown.halfDay}</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-700">On Leave</span>
                </div>
                <span className="text-sm font-bold text-blue-800">{attendanceBreakdown.onLeave}</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-slate-700">Absent</span>
                </div>
                <span className="text-sm font-bold text-rose-800">{attendanceBreakdown.absent}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Employee Activity Timeline */}
        <Card
          className="lg:col-span-2"
          title="Recent Organization Activity"
          subtitle="Real-time employee check-ins, time-off submissions, and records"
          action={
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1"
            >
              All Alerts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-xs text-brand-muted">
              No recent organizational activities recorded today.
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentActivities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-brand-navy">{act.title}</h4>
                      <span className="text-[10px] text-slate-400">
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

      {/* Pending Leave Requests Table */}
      <Card
        title="Pending Leave Approval Queue"
        subtitle="Requests requiring manager or HR review and decision"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/leave-approvals')}
          >
            View All Leaves
          </Button>
        }
      >
        {pendingLeaves.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-muted">
            <span className="inline-block p-2 bg-emerald-50 text-emerald-600 rounded-full mb-2">
              <Check className="w-5 h-5" />
            </span>
            <p className="font-semibold text-brand-navy">All leave requests have been reviewed!</p>
            <p className="mt-0.5">No pending items in your queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${l.employeeName}`}
                          alt={l.employeeName}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-brand-navy">{l.employeeName}</p>
                          <p className="text-[11px] text-brand-muted">{l.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{l.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-brand-navy">{l.leaveType}</span>
                      {l.remarks && <p className="text-[11px] text-brand-muted mt-0.5 italic">"{l.remarks}"</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-brand-navy">{l.startDate} to {l.endDate}</p>
                      <p className="text-[11px] text-brand-muted">{l.numberOfDays} day(s)</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="pending" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Check}
                          onClick={() => {
                            setActionComment('');
                            setActiveModal({ type: 'approve', leave: l });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={X}
                          onClick={() => {
                            setActionComment('');
                            setActiveModal({ type: 'reject', leave: l });
                          }}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={activeModal?.type === 'approve'}
        onClose={() => setActiveModal(null)}
        title="Approve Leave Request"
        description={`Confirm approval for ${activeModal?.leave?.employeeName}'s ${activeModal?.leave?.leaveType} (${activeModal?.leave?.numberOfDays} days).`}
      >
        <div className="space-y-4">
          <Input
            label="Optional Approval Note"
            placeholder="e.g. Approved. Have a great vacation!"
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              isLoading={actionLoading}
              onClick={handleApprove}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={activeModal?.type === 'reject'}
        onClose={() => setActiveModal(null)}
        title="Reject Leave Request"
        description={`Specify a reason for rejecting ${activeModal?.leave?.employeeName}'s request.`}
      >
        <div className="space-y-4">
          <Input
            label="Reason for Rejection *"
            placeholder="e.g. Critical project milestone sprint week; please reschedule."
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={actionLoading}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
