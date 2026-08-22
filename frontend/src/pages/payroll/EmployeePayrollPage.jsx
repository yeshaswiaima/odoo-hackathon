import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  FileText,
  DollarSign,
  CheckCircle2,
  Calendar,
  Sparkles,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const EmployeePayrollPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [history, setHistory] = useState([]);

  // Payslip Modal
  const [activePayslip, setActivePayslip] = useState(null);
  const [payslipLoading, setPayslipLoading] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/my');
      if (res.success) {
        setCurrentSalary(res.currentSalary || {});
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
      toast.error('Unable to retrieve payroll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleOpenPayslip = async (payrollId) => {
    setPayslipLoading(true);
    try {
      const res = await api.get(`/payroll/payslip/${payrollId}`);
      if (res.success && res.payslip) {
        setActivePayslip(res.payslip);
      }
    } catch (err) {
      toast.error('Failed to generate payslip preview.');
    } finally {
      setPayslipLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSkeleton count={3} type="card" />;
  }

  const basic = Number(currentSalary?.basicSalary || 0);
  const hra = Number(currentSalary?.houseAllowance || 0);
  const allowances = Number(currentSalary?.otherAllowances || 0);
  const deductions = Number(currentSalary?.deductions || 0);
  const tax = Number(currentSalary?.tax || 0);
  const net = Number(currentSalary?.netSalary || (basic + hra + allowances - deductions - tax));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">My Payroll & Compensation</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Review your compensation structure, monthly disbursals, and download tax statements.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="primary"
            size="md"
            icon={Download}
            onClick={() => handleOpenPayslip(history[0].id)}
          >
            Download Latest Payslip
          </Button>
        )}
      </div>

      {/* Salary Breakdown Summary Banner Card */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-slate text-white p-6 sm:p-8 rounded-2xl shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Active Monthly Compensation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                ${net.toLocaleString()}
              </h3>
              <span className="text-xs text-slate-300">/ month net pay</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct deposit active to Bank Account ending in •••• {String(user?.id * 1111 || '4821').slice(-4)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-8 text-xs">
            <div>
              <span className="text-slate-400 block">Gross Earnings</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                ${(basic + hra + allowances).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Deductions</span>
              <span className="font-bold text-rose-300 text-sm mt-0.5 block">
                -${(deductions + tax).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Annual Estimate</span>
              <span className="font-bold text-emerald-300 text-sm mt-0.5 block">
                ${(net * 12).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Structure Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings Card */}
        <Card title="Monthly Earnings Breakdown" subtitle="Basic salary and company allowances">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">Basic Pay</span>
              <span className="font-bold text-brand-navy">${basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">House Rent Allowance (HRA)</span>
              <span className="font-bold text-brand-navy">${hra.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">Special & Flexible Allowances</span>
              <span className="font-bold text-brand-navy">${allowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2.5 pt-3 border-t border-brand-border font-bold text-sm bg-emerald-50/50 px-3 rounded-lg text-emerald-900">
              <span>Total Gross Monthly Earnings</span>
              <span className="text-emerald-700">${(basic + hra + allowances).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Deductions Card */}
        <Card title="Monthly Deductions & Withholdings" subtitle="Statutory tax and employee retirement fund">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">Provident Fund / 401(k) Contribution</span>
              <span className="font-bold text-slate-700">${deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">Income Tax Withholding (TDS)</span>
              <span className="font-bold text-slate-700">${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-brand-navy font-medium">Medical Insurance Contribution</span>
              <span className="font-bold text-emerald-600">Company Sponsored ($0)</span>
            </div>
            <div className="flex justify-between py-2.5 pt-3 border-t border-brand-border font-bold text-sm bg-rose-50/50 px-3 rounded-lg text-rose-900">
              <span>Total Monthly Deductions</span>
              <span className="text-rose-600">-${(deductions + tax).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Payslip History Table */}
      <Card
        title="Monthly Payslip History"
        subtitle="Download or preview previous salary payment statements"
      >
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-muted">
            No previous payslip records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Period / Month</th>
                  <th className="py-3.5 px-4">Basic Pay</th>
                  <th className="py-3.5 px-4">Allowances</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Salary Disbursed</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {history.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-brand-navy">
                      {p.month} {p.year}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">${Number(p.basicSalary).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      +${(Number(p.houseAllowance || 0) + Number(p.otherAllowances || 0)).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600">
                      -${(Number(p.deductions || 0) + Number(p.tax || 0)).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${Number(p.netSalary).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted">{p.paymentDate || '—'}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status || 'paid'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        onClick={() => handleOpenPayslip(p.id)}
                        className="py-1 px-2.5 text-xs text-brand-blue border-blue-200 hover:bg-blue-50"
                      >
                        View Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Printable Payslip Modal */}
      <Modal
        isOpen={!!activePayslip}
        onClose={() => setActivePayslip(null)}
        title="Employee Payslip Statement"
        maxWidth="max-w-3xl"
      >
        {activePayslip && (
          <div className="space-y-6">
            {/* Printable Payslip Content */}
            <div id="printable-payslip" className="p-6 sm:p-8 bg-white border border-brand-border rounded-2xl shadow-xs space-y-6 text-brand-navy">
              {/* Payslip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-brand-navy">Dayflow</h3>
                    <p className="text-[11px] text-brand-muted uppercase font-semibold tracking-wider">
                      {activePayslip.company?.tagline || 'Every workday, perfectly aligned.'}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {activePayslip.payslipNumber}
                  </span>
                  <p className="text-xs text-brand-muted mt-1 font-medium">
                    Pay Period: {activePayslip.month} {activePayslip.year}
                  </p>
                </div>
              </div>

              {/* Employee & Meta Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/75 rounded-xl border border-brand-border text-xs">
                <div>
                  <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Employee Name</span>
                  <span className="font-bold text-brand-navy mt-0.5 block">{activePayslip.employee?.name}</span>
                </div>
                <div>
                  <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Employee ID</span>
                  <span className="font-bold font-mono text-brand-navy mt-0.5 block">{activePayslip.employee?.employeeId}</span>
                </div>
                <div>
                  <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Department</span>
                  <span className="font-semibold text-brand-navy mt-0.5 block">{activePayslip.employee?.department}</span>
                </div>
                <div>
                  <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Disbursal Date</span>
                  <span className="font-semibold text-brand-navy mt-0.5 block">{activePayslip.paymentDate}</span>
                </div>
              </div>

              {/* Earnings & Deductions 2-Column Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earnings Table */}
                <div className="border border-brand-border rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-brand-border font-bold text-xs uppercase tracking-wider text-brand-navy">
                    Earnings
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {activePayslip.earnings?.map((e, idx) => (
                      <div key={idx} className="flex justify-between px-4 py-2">
                        <span className="text-slate-600">{e.label}</span>
                        <span className="font-bold font-mono text-brand-navy">${Number(e.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-2.5 bg-blue-50/40 font-bold text-xs text-brand-blue">
                      <span>Gross Earnings</span>
                      <span className="font-mono">${Number(activePayslip.totalEarnings).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-brand-border rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-brand-border font-bold text-xs uppercase tracking-wider text-brand-navy">
                    Deductions
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {activePayslip.deductions?.map((d, idx) => (
                      <div key={idx} className="flex justify-between px-4 py-2">
                        <span className="text-slate-600">{d.label}</span>
                        <span className="font-bold font-mono text-rose-600">${Number(d.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-2.5 bg-rose-50/40 font-bold text-xs text-rose-600">
                      <span>Total Deductions</span>
                      <span className="font-mono">-${Number(activePayslip.totalDeductions).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Net Disbursed Compensation
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Transferred to employee direct deposit account
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
                  ${Number(activePayslip.netSalary).toLocaleString()}
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 text-[10px] text-brand-muted border-t border-slate-100">
                This is a computer-generated statement issued by Dayflow Technologies Inc. No signature required.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setActivePayslip(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={handlePrint}>
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeePayrollPage;
