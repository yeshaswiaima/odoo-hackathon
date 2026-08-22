import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export const AdminLeaveApprovalsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'reject', leave: object }
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/all', {
        status: statusFilter,
        leaveType: typeFilter,
        search
      });

      if (res.success) {
        setLeaves(res.leaves || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
      toast.error('Unable to fetch organization leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter, search]);

  const handleApprove = async () => {
    if (!activeModal?.leave) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${activeModal.leave.id}/approve`, {
        adminComment: adminComment || 'Approved by HR Administrator'
      });
      if (res.success) {
        toast.success(`Leave approved for ${activeModal.leave.employeeName}`, 'Request Approved');
        setActiveModal(null);
        setAdminComment('');
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeModal?.leave) return;
    if (!adminComment.trim()) {
      toast.warning('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${activeModal.leave.id}/reject`, {
        adminComment
      });
      if (res.success) {
        toast.info(`Leave rejected for ${activeModal.leave.employeeName}`, 'Request Rejected');
        setActiveModal(null);
        setAdminComment('');
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Leave Requests & Approvals</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Review, approve, or decline employee time-off applications across the organization.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Requests"
          value={stats.pending || 0}
          icon={Clock}
          color="amber"
          trend={stats.pending > 0 ? 'Requires attention' : 'Queue cleared'}
          trendDirection={stats.pending > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Approved Time-Off"
          value={stats.approved || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Declined Requests"
          value={stats.rejected || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Filter Toolbar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by employee, ID, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="py-2 text-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval Only</option>
            <option value="approved">Approved Requests</option>
            <option value="rejected">Rejected Requests</option>
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="all">All Leave Types</option>
            <option value="Paid Leave">Paid / Annual Leave</option>
            <option value="Sick Leave">Sick / Medical Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </Select>
        </div>
      </Card>

      {/* Leave Requests Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} type="table" />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No leave requests found"
            description="No requests match your selected filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearch('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/75">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Reason / Remarks</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Admin Note</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${l.employeeName}`}
                          alt={l.employeeName}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">{l.employeeName}</p>
                          <p className="text-[11px] text-brand-muted">{l.empCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">{l.department}</td>
                    <td className="py-4 px-4 font-semibold text-brand-navy">{l.leaveType}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-brand-navy">{l.startDate} to {l.endDate}</p>
                      <p className="text-[11px] text-brand-muted">{l.numberOfDays} day{l.numberOfDays > 1 ? 's' : ''}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                      {l.remarks || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={l.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-slate-500 italic max-w-xs truncate">
                      {l.adminComment || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {l.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Check}
                            onClick={() => {
                              setAdminComment('');
                              setActiveModal({ type: 'approve', leave: l });
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={X}
                            onClick={() => {
                              setAdminComment('');
                              setActiveModal({ type: 'reject', leave: l });
                            }}
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 py-1 px-2.5 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Decided</span>
                      )}
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
        title="Approve Leave Application"
        description={`Confirm approval for ${activeModal?.leave?.employeeName}'s ${activeModal?.leave?.leaveType} (${activeModal?.leave?.numberOfDays} day(s)).`}
      >
        <div className="space-y-4">
          <Input
            label="Optional Note to Employee"
            placeholder="e.g. Approved. Enjoy your time off!"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
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
        title="Decline Leave Application"
        description={`Provide a reason for declining ${activeModal?.leave?.employeeName}'s leave request.`}
      >
        <div className="space-y-4">
          <Input
            label="Reason for Declining *"
            placeholder="e.g. Inadequate coverage during key product release."
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
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
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLeaveApprovalsPage;
