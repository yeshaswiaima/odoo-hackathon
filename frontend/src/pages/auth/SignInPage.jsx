import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success(`Welcome back, ${user.name}!`, 'Sign In Successful');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify and try again.');
      toast.error(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userType) => {
    setErrorMessage('');
    if (userType === 'admin') {
      setEmail('admin@dayflow.com');
      setPassword('Admin@123');
    } else {
      setEmail('employee@dayflow.com');
      setPassword('Employee@123');
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      {/* Left Feature Showcase Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Dayflow</span>
            <span className="block text-[11px] uppercase font-semibold tracking-wider text-blue-400">
              Modern Enterprise HRMS
            </span>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-blue-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Modern Role-Based Workforce OS</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Every workday, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              perfectly aligned.
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Dayflow digitizes attendance, streamlined leave approvals, dynamic payroll structures, and real-time organization insights in a unified, professional workspace.
          </p>

          {/* Value props */}
          <div className="space-y-3 pt-2">
            {[
              'Single-click daily attendance with live check-in timestamps',
              'Transparent leave balance tracking with instant admin approvals',
              'Itemized compensation breakdowns and printable payslips',
              'Enterprise-grade security and role-based permissions',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800 pt-6 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Dayflow Technologies Inc.</span>
          <span>Version 2.4 Enterprise</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-brand-navy">Dayflow</span>
              <span className="block text-[10px] uppercase font-semibold text-brand-muted">HRMS Platform</span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Welcome back</h2>
            <p className="text-xs text-brand-muted mt-1.5">
              Sign in to your Dayflow account to manage your workday.
            </p>
          </div>

          {/* Quick Fill Preset Buttons for fast demo test */}
          <div className="p-3.5 bg-slate-50 border border-brand-border rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-navy uppercase tracking-wider">
                Demo Accounts Quick-Fill:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Admin / HR</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('employee')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Employee</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-brand-danger text-xs font-medium animate-in fade-in duration-200">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-brand-navy transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30 h-4 w-4"
                />
                <span className="text-xs text-brand-muted font-medium select-none">Remember this device</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info('For this demo, use the credentials provided above: admin@dayflow.com or employee@dayflow.com.', 'Password Reset')}
                className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Bottom Sign Up Link */}
          <p className="text-center text-xs text-brand-muted pt-2">
            Don't have an employee account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-0.5">
              Create an account <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
