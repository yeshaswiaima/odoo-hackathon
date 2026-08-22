import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Palmtree,
  Edit,
  Plus,
  ArrowRight,
  TrendingUp
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

export const AdminAttendancePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0
  });

  // Filters
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Manual Mark Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [markFormData, setMarkFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00 AM',
    checkOutTime: '06:00 PM',
    status: 'present',
    hoursWorked: 8.5
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/all', {
        date: dateFilter,
        department: deptFilter,
        status: statusFilter,
        search
      });

      if (res.success) {
        setRecords(res.records || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Failed to load admin attendance:', err);
      toast.error('Unable to fetch organization attendance.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees');
      if (res.success && res.employees) {
        setAllEmployees(res.employees);
        if (res.employees.length > 0 && !markFormData.employeeId) {
          setMarkFormData(prev => ({ ...prev, employeeId: res.employees[0].id }));
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, deptFilter, statusFilter, search]);

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!markFormData.employeeId) {
      toast.warning('Please select an employee.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/attendance/mark', markFormData);
      if (res.success) {
        toast.success('Attendance record updated successfully.', 'Record Saved');
        setIsMarkModalOpen(false);
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Organization Attendance</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Monitor real-time company check-ins, punctuality metrics, and work logs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsMarkModalOpen(true)}
        >
          Mark / Adjust Record
        </Button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Present Employees"
          value={stats.present || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Half-Day Records"
          value={stats.halfDay || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="On Scheduled Leave"
          value={stats.leave || 0}
          icon={Palmtree}
          color="purple"
        />
        <StatCard
          title="Absent Records"
          value={stats.absent || 0}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Filter Toolbar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by name, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="py-2 text-xs"
          />

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 text-xs"
          />

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="present">Present</option>
            <option value="half-day">Half-day</option>
            <option value="leave">On Leave</option>
            <option value="absent">Absent</option>
          </Select>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} type="table" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance logs found"
            description="No employee records matched the selected date or filter criteria."
            actionLabel="Reset Date to Today"
            onAction={() => {
              setDateFilter(new Date().toISOString().split('T')[0]);
              setDeptFilter('All');
              setStatusFilter('All');
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
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Hours</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`}
                          alt={r.name}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">{r.name}</p>
                          <p className="text-[11px] text-brand-muted">{r.empCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{r.department}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.checkInTime || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.checkOutTime || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.hoursWorked ? `${r.hoursWorked} hrs` : r.checkInTime && r.checkOutTime ? '8.5 hrs' : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => {
                          setMarkFormData({
                            employeeId: r.employeeId,
                            date: r.date,
                            checkInTime: r.checkInTime || '09:00 AM',
                            checkOutTime: r.checkOutTime || '06:00 PM',
                            status: r.status,
                            hoursWorked: r.hoursWorked || 8.5
                          });
                          setIsMarkModalOpen(true);
                        }}
                        className="text-brand-blue hover:bg-blue-50 py-1 px-2.5 text-xs"
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Mark / Adjust Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Mark / Adjust Attendance Record"
        description="Override or log an attendance record for any employee."
      >
        <form onSubmit={handleSaveAttendance} className="space-y-4">
          <Select
            label="Select Employee *"
            value={markFormData.employeeId}
            onChange={(e) => setMarkFormData({ ...markFormData, employeeId: Number(e.target.value) })}
            required
          >
            {allEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId} - {emp.department})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={markFormData.date}
              onChange={(e) => setMarkFormData({ ...markFormData, date: e.target.value })}
              required
            />

            <Select
              label="Status *"
              value={markFormData.status}
              onChange={(e) => setMarkFormData({ ...markFormData, status: e.target.value })}
            >
              <option value="present">Present</option>
              <option value="half-day">Half-day</option>
              <option value="leave">On Leave</option>
              <option value="absent">Absent</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Check In Time"
              placeholder="e.g. 09:15 AM"
              value={markFormData.checkInTime}
              onChange={(e) => setMarkFormData({ ...markFormData, checkInTime: e.target.value })}
            />
            <Input
              label="Check Out Time"
              placeholder="e.g. 06:00 PM"
              value={markFormData.checkOutTime}
              onChange={(e) => setMarkFormData({ ...markFormData, checkOutTime: e.target.value })}
            />
          </div>

          <Input
            label="Hours Worked"
            type="number"
            step="0.5"
            value={markFormData.hoursWorked}
            onChange={(e) => setMarkFormData({ ...markFormData, hoursWorked: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border">
            <Button variant="secondary" onClick={() => setIsMarkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAttendancePage;
