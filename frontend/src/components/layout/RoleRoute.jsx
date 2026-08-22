import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Button from '../common/Button';

export const RoleRoute = ({ children, allowedRoles = ['admin'] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const userRole = (user?.role || '').toLowerCase();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-brand-border shadow-card mt-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-brand-danger mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-brand-navy">Access Restricted</h2>
        <p className="text-sm text-brand-muted mt-1.5 max-w-md leading-relaxed">
          You do not have administrative privileges to view this section. Please contact your HR Manager if you believe this is an error.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => window.location.href = '/dashboard'}>
            Return to My Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
