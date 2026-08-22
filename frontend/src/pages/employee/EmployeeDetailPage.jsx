import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  UserCheck,
  CreditCard,
  FileText,
  Edit,
  Download,
  CheckCircle2,
  ShieldAlert
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

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}`);
      if (res.success && res.employee) {
        setEmployee(res.employee);
        setEditFormData(res.employee);
      }
    } catch (err) {
      console.error('Failed to load employee details:', err);
      toast.error(err.message || 'Failed to retrieve employee record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/employees/${employee.id}`, editFormData);
      if (res.success) {
        toast.success('Employee profile updated successfully.', 'Changes Saved');
        setIsEditModalOpen(false);
        fetchEmployee();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-brand-border">
        <h3 className="text-base font-semibold text-brand-navy">Employee not found</h3>
        <p className="text-xs text-brand-muted mt-1">The requested employee record does not exist or has been removed.</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/employees')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const isSelf = user?.employeeRecordId === employee.id || user?.id === employee.userId;
  const canEdit = isAdmin || isSelf;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee List
        </button>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            icon={Edit}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={employee.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
          alt={employee.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 object-cover border-2 border-slate-200 shadow-sm flex-shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-brand-navy">{employee.name}</h2>
              <p className="text-xs text-brand-muted mt-0.5">{employee.designation} • {employee.department}</p>
            </div>
            <div>
              <StatusBadge status={employee.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-blue" /> {employee.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-blue" /> {employee.phone || '+1 (555) 012-3456'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" /> {employee.address || 'San Francisco, CA'}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Information */}
        <Card title="Employment & Job Information" subtitle="Organizational placement and designation">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Employee ID</span>
              <span className="font-semibold font-mono text-brand-navy mt-1 block">{employee.employeeId}</span>
            </div>
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Department</span>
              <span className="font-semibold text-brand-navy mt-1 block">{employee.department}</span>
            </div>
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Designation</span>
              <span className="font-semibold text-brand-navy mt-1 block">{employee.designation}</span>
            </div>
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Reporting Manager</span>
              <span className="font-semibold text-brand-navy mt-1 block">{employee.managerName || 'Priya Sharma'}</span>
            </div>
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Joining Date</span>
              <span className="font-semibold text-brand-navy mt-1 block">{employee.joiningDate || '2022-03-01'}</span>
            </div>
            <div>
              <span className="text-brand-muted block uppercase text-[10px] font-bold tracking-wider">Work Status</span>
              <span className="font-semibold text-brand-navy mt-1 block capitalize">{employee.status}</span>
            </div>
          </div>
        </Card>

        {/* Salary Information (Admin/Self) */}
        <Card
          title="Compensation & Salary Breakdown"
          subtitle="Itemized compensation and monthly disbursal"
        >
          {employee.salary ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Basic Monthly Salary:</span>
                <span className="font-semibold text-brand-navy">${employee.salary.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">House Rent Allowance (HRA):</span>
                <span className="font-semibold text-brand-navy">${employee.salary.houseAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Special & Other Allowances:</span>
                <span className="font-semibold text-brand-navy">${employee.salary.otherAllowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Statutory Deductions & Taxes:</span>
                <span className="font-semibold text-brand-danger">-${(employee.salary.deductions + employee.salary.tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 border-t border-brand-border font-bold text-sm bg-blue-50/50 px-3 rounded-lg">
                <span className="text-brand-navy">Net Disbursable Salary:</span>
                <span className="text-brand-blue">${employee.salary.netSalary.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-brand-muted">No salary breakdown assigned yet.</p>
          )}
        </Card>
      </div>

      {/* Documents Section */}
      <Card
        title="Employee Documents & Verification"
        subtitle="Onboarding agreements, tax documentation, and offer letters"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Offer_Letter.pdf', size: '240 KB', date: 'Jan 2022' },
            { name: 'NDA_Agreement.pdf', size: '180 KB', date: 'Jan 2022' },
            { name: 'Identity_Verification.pdf', size: '420 KB', date: 'Jan 2022' }
          ].map((doc, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-brand-border hover:border-brand-blue/40 bg-slate-50/50 flex items-center justify-between transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-brand-blue flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-navy">{doc.name}</p>
                  <p className="text-[10px] text-brand-muted">{doc.size} • {doc.date}</p>
                </div>
              </div>
              <button
                onClick={() => toast.info(`Downloading ${doc.name}...`, 'Document Download')}
                className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-white rounded-md transition"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee Information"
        description={isAdmin ? 'Update employee personal and job records.' : 'Update your contact information.'}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {isAdmin && (
            <Input
              label="Full Name"
              name="name"
              value={editFormData.name || ''}
              onChange={handleEditChange}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              value={editFormData.phone || ''}
              onChange={handleEditChange}
            />
            <Input
              label="Address"
              name="address"
              value={editFormData.address || ''}
              onChange={handleEditChange}
            />
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                name="department"
                value={editFormData.department || 'Engineering'}
                onChange={handleEditChange}
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
                label="Designation"
                name="designation"
                value={editFormData.designation || ''}
                onChange={handleEditChange}
              />
            </div>
          )}

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reporting Manager"
                name="managerName"
                value={editFormData.managerName || ''}
                onChange={handleEditChange}
              />
              <Select
                label="Account Status"
                name="status"
                value={editFormData.status || 'active'}
                onChange={handleEditChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDetailPage;
