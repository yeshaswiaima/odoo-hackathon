import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  Edit2,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Filter,
  Download
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

export const AdminPayrollPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [payrollList, setPayrollList] = useState([]);
  const [stats, setStats] = useState({
    totalDisbursed: 0,
    totalPending: 0,
    paidCount: 0,
    pendingCount: 0
  });

  // Filters
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('2026');
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Salary Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 0,
    houseAllowance: 0,
    otherAllowances: 0,
    deductions: 0,
    tax: 0,
    status: 'paid'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/all', {
        month: monthFilter,
        year: yearFilter,
        department: deptFilter,
        search
      });

      if (res.success) {
        setPayrollList(res.payroll || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Failed to load admin payroll:', err);
      toast.error('Unable to fetch organization payroll.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [monthFilter, yearFilter, deptFilter, search]);

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setSalaryForm({
      basicSalary: Number(rec.basicSalary) || 0,
      houseAllowance: Number(rec.houseAllowance) || 0,
      otherAllowances: Number(rec.otherAllowances) || 0,
      deductions: Number(rec.deductions) || 0,
      tax: Number(rec.tax) || 0,
      status: rec.status || 'paid'
    });
    setIsEditModalOpen(true);
  };

  const calculatedNet = Math.max(
    Number(salaryForm.basicSalary) +
      Number(salaryForm.houseAllowance) +
      Number(salaryForm.otherAllowances) -
      Number(salaryForm.deductions) -
      Number(salaryForm.tax),
    0
  );

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/payroll/salary/${selectedRecord.id}`, salaryForm);
      if (res.success) {
        toast.success(`Salary structure updated for ${selectedRecord.name}!`, 'Compensation Updated');
        setIsEditModalOpen(false);
        fetchPayrollData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update salary.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Payroll & Compensation Management</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Configure employee compensation structures, review monthly disbursals, and monitor company payroll budget.
          </p>
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Disbursed Payroll"
          value={`$${Number(stats.totalDisbursed || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trendLabel="Paid statements"
        />
        <StatCard
          title="Pending Payroll"
          value={`$${Number(stats.totalPending || 0).toLocaleString()}`}
          icon={Clock}
          color="amber"
          trendLabel="Awaiting disbursal"
        />
        <StatCard
          title="Disbursed Count"
          value={stats.paidCount || 0}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingCount || 0}
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Filter Toolbar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by employee, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="py-2 text-xs"
          />

          <Select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="All">All Months</option>
            <option value="August">August</option>
            <option value="July">July</option>
            <option value="June">June</option>
            <option value="May">May</option>
            <option value="April">April</option>
            <option value="March">March</option>
          </Select>

          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </Select>

          <Select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="2026">Year: 2026</option>
            <option value="2025">Year: 2025</option>
          </Select>
        </div>
      </Card>

      {/* Payroll Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} type="table" />
          </div>
        ) : payrollList.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payroll records found"
            description="No employee salary records matched the selected filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setMonthFilter('All');
              setDeptFilter('All');
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
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Basic Pay</th>
                  <th className="py-3.5 px-4">Allowances</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payrollList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                          alt={p.name}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">{p.name}</p>
                          <p className="text-[11px] text-brand-muted">{p.empCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">{p.department}</td>
                    <td className="py-4 px-4 font-medium text-slate-700">{p.month} {p.year}</td>
                    <td className="py-4 px-4 font-mono text-slate-700">${Number(p.basicSalary).toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono text-slate-700">
                      +${(Number(p.houseAllowance || 0) + Number(p.otherAllowances || 0)).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-rose-600">
                      -${(Number(p.deductions || 0) + Number(p.tax || 0)).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                      ${Number(p.netSalary).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={p.status || 'paid'} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEdit(p)}
                        className="py-1 px-2.5 text-xs text-brand-blue border-blue-200 hover:bg-blue-50"
                      >
                        Adjust Salary
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Salary Structure Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Adjust Employee Salary Structure"
        description={`Update monthly compensation and statutory deductions for ${selectedRecord?.name} (${selectedRecord?.empCode}).`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveSalary} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Basic Monthly Salary ($) *"
              type="number"
              value={salaryForm.basicSalary}
              onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
              required
            />
            <Input
              label="House Rent Allowance (HRA) ($)"
              type="number"
              value={salaryForm.houseAllowance}
              onChange={(e) => setSalaryForm({ ...salaryForm, houseAllowance: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Special & Other Allowances ($)"
              type="number"
              value={salaryForm.otherAllowances}
              onChange={(e) => setSalaryForm({ ...salaryForm, otherAllowances: Number(e.target.value) })}
            />
            <Input
              label="Retirement / 401(k) Deductions ($)"
              type="number"
              value={salaryForm.deductions}
              onChange={(e) => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Income Tax Withholding ($)"
              type="number"
              value={salaryForm.tax}
              onChange={(e) => setSalaryForm({ ...salaryForm, tax: Number(e.target.value) })}
            />
            <Select
              label="Disbursal Status"
              value={salaryForm.status}
              onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value })}
            >
              <option value="paid">Paid / Disbursed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </Select>
          </div>

          {/* Dynamic Calculation Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-950 font-bold uppercase tracking-wider block">
                Calculated Net Salary:
              </span>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                Basic + Allowances - Deductions - Tax
              </span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-800 font-mono">
              ${calculatedNet.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Structure
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPayrollPage;
