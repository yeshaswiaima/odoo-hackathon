import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  CreditCard,
  Edit2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const MyProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    profileImage: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setProfile(res.user);
        setFormData({
          phone: res.user.phone || '+1 (555) 345-6782',
          address: res.user.address || '742 Evergreen Terrace, San Francisco, CA 94110',
          profileImage: res.user.profileImage || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Unable to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile?.employeeRecordId) return;

    setSaving(true);
    try {
      const res = await api.put(`/employees/${profile.employeeRecordId}`, {
        phone: formData.phone,
        address: formData.address,
      });

      if (res.success) {
        toast.success('Your profile contact information has been updated.', 'Profile Saved');
        updateUser({ phone: formData.phone, address: formData.address });
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} type="card" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">My Profile</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage your personal contact details and view employment information.
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="primary"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
          >
            Edit Contact Details
          </Button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={profile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
          alt={profile?.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 object-cover border-2 border-slate-200 shadow-sm flex-shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-2xl font-bold text-brand-navy">{profile?.name}</h3>
              <p className="text-xs text-brand-muted mt-0.5">{profile?.designation} • {profile?.department}</p>
            </div>
            <div>
              <StatusBadge status={profile?.status || 'active'} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-blue" /> {profile?.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-blue" /> {profile?.phone || formData.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" /> {profile?.address || formData.address}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form / View Sections */}
      {isEditing ? (
        <Card title="Edit Contact Information" subtitle="You can update your personal phone number and home address">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                icon={Phone}
                required
              />
              <Input
                label="Home Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State / Country"
                icon={MapPin}
                required
              />
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-brand-muted">
              <span className="font-semibold text-brand-navy block mb-0.5">Note on Protected Fields:</span>
              To request a change to your official name, job title, department, or salary structure, please submit an HR inquiry.
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Details Card */}
          <Card title="Employment Details" subtitle="Official organizational records">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Employee ID:</span>
                <span className="font-mono font-bold text-brand-navy">{profile?.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Department:</span>
                <span className="font-semibold text-brand-navy">{profile?.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Designation:</span>
                <span className="font-semibold text-brand-navy">{profile?.designation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Reporting Manager:</span>
                <span className="font-semibold text-brand-navy">{profile?.managerName || 'Priya Sharma'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-brand-muted">Joining Date:</span>
                <span className="font-semibold text-brand-navy">{profile?.joiningDate || '2022-03-01'}</span>
              </div>
            </div>
          </Card>

          {/* Account Security Card */}
          <Card title="Account & Security" subtitle="Authentication and session credentials">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Sign-in Email:</span>
                <span className="font-semibold text-brand-navy">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Role Permission:</span>
                <span className="font-semibold uppercase tracking-wider text-brand-blue">{profile?.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-brand-muted">Two-Factor Authentication:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-brand-muted">Password:</span>
                <span className="text-brand-muted font-mono">••••••••••••</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
