import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-brand-border shadow-card space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy">Page Not Found</h2>
        <p className="text-xs text-brand-muted leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist on Dayflow HRMS.
        </p>
        <div className="pt-3 flex items-center justify-center gap-3">
          <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" size="md" icon={Home} onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
