import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Building,
  MoreVertical,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export const EmployeesPage = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Employee Form State
  const [formData, setFormData] = useState({
    employeeId: `DF-00${Math.floor(Math.random() * 90) + 10}`,
    name: '',
    email: '',
    password: 'Employee@123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+1 (555) 019-3829',
    address: 'San Francisco, CA',
    dateOfBirth: '1995-05-20',
    joiningDate: new Date().toISOString().split('T')[0],
    managerName: 'Priya Sharma',
    basicSalary: 85000,
    houseAllowance: 12000,
    otherAllowances: 6000,
    deductions: 5000,
    tax: 9000,
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', {
          search,
          department: selectedDept,
          status: selectedStatus,
          sortBy,
          sortOrder
        }),
        api.get('/employees/departments')
      ]);

      if (empRes.success) {
        setEmployees(empRes.employees || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast.error('Unable to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus, sortBy, sortOrder]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/employees', formData);
      if (res.success) {
        toast.success(`Employee ${formData.name} added successfully!`, 'Employee Onboarded');
        setIsAddModalOpen(false);
        setFormData({
          employeeId: `DF-00${Math.floor(Math.random() * 90) + 10}`,
          name: '',
          email: '',
          password: 'Employee@123',
          role: 'employee',
          department: 'Engineering',
          designation: 'Software Engineer',
          phone: '+1 (555) 019-3829',
          address: 'San Francisco, CA',
          dateOfBirth: '1995-05-20',
          joiningDate: new Date().toISOString().split('T')[0],
          managerName: 'Priya Sharma',
          basicSalary: 85000,
          houseAllowance: 12000,
          otherAllowances: 6000,
          deductions: 5000,
          tax: 9000,
        });
        fetchEmployees();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!employeeToDelete) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/employees/${employeeToDelete.id}`);
      if (res.success) {
        toast.info(res.message || 'Employee status updated.');
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
        fetchEmployees();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate employee.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Employee Directory</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage organization members, compensation structures, and records.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm"
          >
            Add New Employee
          </Button>
        )}
      </div>

      {/* Filter and Search Bar Card */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search by name, ID, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              className="py-2 text-xs"
            />
          </div>

          {/* Department Filter */}
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.count})
              </option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </Select>

          {/* Sort By */}
          <Select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="py-2 text-xs"
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="joiningDate_desc">Sort: Joining Date (Newest)</option>
            <option value="joiningDate_asc">Sort: Joining Date (Oldest)</option>
            <option value="department_asc">Sort: Department</option>
          </Select>
        </div>
      </Card>

      {/* Employees Table Card */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} type="table" />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="No employees match your search query or selected filter criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setSelectedDept('All');
              setSelectedStatus('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-navy uppercase tracking-wider bg-slate-50/75">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Position / Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full bg-slate-100 object-cover flex-shrink-0 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-brand-navy hover:text-brand-blue cursor-pointer" onClick={() => navigate(`/employees/${emp.id}`)}>
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-brand-muted">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                      {emp.employeeId}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {emp.department}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {emp.designation}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={emp.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      {emp.joiningDate || '2022-01-15'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="py-1 px-2.5 text-xs text-brand-navy"
                        >
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setIsDeleteModalOpen(true);
                            }}
                            className="py-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Deactivate employee"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Fill in employee details to create their profile, system account, and salary structure."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID *"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Full Name *"
              name="name"
              placeholder="e.g. Liam Anderson"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email *"
              name="email"
              type="email"
              placeholder="liam.a@dayflow.com"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Default Password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              helperText="Employee can change password after first sign-in"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department *"
              name="department"
              value={formData.department}
              onChange={handleFormChange}
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </Select>

            <Input
              label="Job Designation *"
              name="designation"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.designation}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
            />
            <Input
              label="Joining Date"
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleFormChange}
            />
          </div>

          {/* Salary Setup */}
          <div className="pt-3 border-t border-brand-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-3">
              Initial Compensation Setup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Basic Salary ($)"
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleFormChange}
              />
              <Input
                label="House Allowance ($)"
                type="number"
                name="houseAllowance"
                value={formData.houseAllowance}
                onChange={handleFormChange}
              />
              <Input
                label="Deductions & Tax ($)"
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Create Employee Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deactivate Employee"
        description={`Are you sure you want to deactivate ${employeeToDelete?.name} (${employeeToDelete?.employeeId})? This will mark their status as inactive.`}
      >
        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={actionLoading}
            onClick={handleDeactivate}
          >
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
