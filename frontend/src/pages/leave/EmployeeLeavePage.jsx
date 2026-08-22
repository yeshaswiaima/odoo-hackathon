import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Palmtree,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ChevronRight,
  Info
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

export const EmployeeLeavePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({
    paidLeave: { total: 18, used: 0, remaining: 18 },
    sickLeave: { total: 12, used: 0, remaining: 12 },
    unpaidLeave: { used: 0 }
  });

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Paid Leave',
    startDate: '',
    endDate: '',
    remarks: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balRes, histRes] = await Promise.all([
        api.get('/leaves/balances'),
        api.get('/leaves/my')
      ]);

      if (balRes.success) {
        setBalances(balRes.balances || {});
      }
      if (histRes.success) {
        setLeaves(histRes.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
      toast.error('Unable to fetch leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  // Calculate days whenever start or end date changes
  useEffect(() => {
    if (applyForm.startDate && applyForm.endDate) {
      const start = new Date(applyForm.startDate);
      const end = new Date(applyForm.endDate);
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [applyForm.startDate, applyForm.endDate]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate) {
      toast.warning('Please select start and end dates.');
      return;
    }

    if (new Date(applyForm.endDate) < new Date(applyForm.startDate)) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/leaves/apply', applyForm);
      if (res.success) {
        toast.success('Leave request submitted successfully!', 'Request Submitted');
        setIsApplyModalOpen(false);
        setApplyForm({
          leaveType: 'Paid Leave',
          startDate: '',
          endDate: '',
          remarks: '',
        });
        fetchLeaveData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (leaveId) => {
    try {
      const res = await api.delete(`/leaves/${leaveId}`);
      if (res.success) {
        toast.info('Leave request cancelled.');
        fetchLeaveData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Leave & Time Off</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            View allocated leave quotas, submit new time-off requests, and track approval status.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsApplyModalOpen(true)}
          className="shadow-sm"
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Paid Leave Card */}
        <Card bodyClassName="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">Paid / Annual Leave</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-navy">
              {balances.paidLeave?.remaining ?? 18}
            </span>
            <span className="text-xs text-brand-muted">days remaining</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-blue h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((balances.paidLeave?.used || 0) / (balances.paidLeave?.total || 18)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-brand-muted mt-2">
              <span>Used: {balances.paidLeave?.used || 0} days</span>
              <span>Total Quota: {balances.paidLeave?.total || 18} days</span>
            </div>
          </div>
        </Card>

        {/* Sick Leave Card */}
        <Card bodyClassName="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">Sick / Medical Leave</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-navy">
              {balances.sickLeave?.remaining ?? 12}
            </span>
            <span className="text-xs text-brand-muted">days remaining</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((balances.sickLeave?.used || 0) / (balances.sickLeave?.total || 12)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-brand-muted mt-2">
              <span>Used: {balances.sickLeave?.used || 0} days</span>
              <span>Total Quota: {balances.sickLeave?.total || 12} days</span>
            </div>
          </div>
        </Card>

        {/* Unpaid Leave Card */}
        <Card bodyClassName="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">Unpaid Leave</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-navy">
              {balances.unpaidLeave?.used || 0}
            </span>
            <span className="text-xs text-brand-muted">days taken</span>
          </div>
          <p className="text-xs text-brand-muted mt-3 leading-relaxed">
            Unpaid leaves are approved under special circumstances and deducted from monthly payroll disbursal.
          </p>
        </Card>
      </div>

      {/* Leave Request History Table */}
      <Card
        title="Leave Request History"
        subtitle="All submitted time-off requests with real-time review status"
      >
        {loading ? (
          <LoadingSkeleton count={4} type="table" />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No leave requests yet"
            description="You haven't submitted any time-off requests yet. Use the button above to request time off."
            actionLabel="Apply for Leave"
            onAction={() => setIsApplyModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Admin Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-brand-navy">
                      {l.leaveType}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {l.numberOfDays} day{l.numberOfDays > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {l.remarks || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={l.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {l.adminComment || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(l.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Apply for Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time Off"
        description="Select your leave type and dates. Your request will be routed to HR and management."
      >
        <form onSubmit={handleApply} className="space-y-4">
          <Select
            label="Leave Type *"
            value={applyForm.leaveType}
            onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
            required
          >
            <option value="Paid Leave">Paid / Annual Leave</option>
            <option value="Sick Leave">Sick / Medical Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={applyForm.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
              required
            />

            <Input
              label="End Date *"
              type="date"
              value={applyForm.endDate}
              min={applyForm.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
              required
            />
          </div>

          {/* Auto calculated duration banner */}
          {calculatedDays > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-brand-navy font-semibold">Total Duration Calculated:</span>
              <span className="text-brand-blue font-bold px-2 py-0.5 bg-white rounded-md border border-blue-200">
                {calculatedDays} Calendar Day{calculatedDays > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <Input
            label="Reason / Remarks"
            placeholder="Brief reason for your leave request..."
            value={applyForm.remarks}
            onChange={(e) => setApplyForm({ ...applyForm, remarks: e.target.value })}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border">
            <Button variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={actionLoading}
              disabled={calculatedDays <= 0}
            >
              Submit Leave Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeavePage;
