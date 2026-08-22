import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Building, Phone, BadgeCheck, Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    employeeId: `DF-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+1 (555) 012-3456',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Password rules validation
  const password = formData.password;
  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'One numeric number (0-9)', valid: /\d/.test(password) },
    { label: 'One special character (@$!%*?&#)', valid: /[@$!%*?&#^_\-+=<>]/.test(password) },
  ];

  const allRulesPassed = passwordRules.every((r) => r.valid);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.employeeId.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!allRulesPassed) {
      setErrorMessage('Password does not satisfy all security criteria.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Welcome to Dayflow, ${user.name}! Your workspace is ready.`, 'Account Created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-brand-border shadow-card p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">Create Dayflow Account</h2>
          <p className="text-xs text-brand-muted mt-1">
            Join your organization workspace on Dayflow HRMS
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-brand-danger text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g. DF-009"
              icon={BadgeCheck}
              required
            />

            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Employee (Standard Access)</option>
              <option value="admin">HR / Admin Officer</option>
            </Select>
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            icon={User}
            required
          />

          <Input
            label="Work Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane.doe@dayflow.com"
            icon={Mail}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
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
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              icon={Phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              icon={Lock}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-brand-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••••••"
              icon={Lock}
              required
              error={
                formData.confirmPassword && !passwordsMatch
                  ? 'Passwords do not match'
                  : undefined
              }
            />
          </div>

          {/* Password Requirements Checklist */}
          {formData.password && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 animate-in fade-in duration-200">
              <span className="text-[11px] font-semibold uppercase text-brand-navy tracking-wider block mb-1">
                Password Security Requirements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {passwordRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    {rule.valid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={rule.valid ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={isLoading}
            disabled={!allRulesPassed || !passwordsMatch}
          >
            Create Account & Join Dayflow
          </Button>
        </form>

        {/* Back to Sign in */}
        <div className="text-center mt-6 pt-4 border-t border-brand-border">
          <Link
            to="/login"
            className="text-xs text-brand-blue hover:text-brand-blue-hover font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
