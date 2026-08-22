import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on route
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of workday activities and priorities' };
      case '/employees':
        return { title: 'Employee Directory', subtitle: 'Manage organization team members and records' };
      case '/attendance':
        return { title: 'Attendance Management', subtitle: 'Track workdays, check-ins, and attendance history' };
      case '/leaves':
      case '/leave-approvals':
        return { title: 'Leave & Time-Off', subtitle: 'Manage time-off balances, requests, and approvals' };
      case '/payroll':
        return { title: 'Payroll & Compensation', subtitle: 'Salary structures, monthly disbursals, and payslips' };
      case '/reports':
        return { title: 'Reports & Analytics', subtitle: 'Company-wide HR metrics, headcount, and attendance trends' };
      case '/notifications':
        return { title: 'Notification Center', subtitle: 'Activity alerts, system notifications, and updates' };
      case '/profile':
        return { title: 'My Profile', subtitle: 'Personal details, employment information, and security' };
      default:
        if (pathname.startsWith('/employees/')) {
          return { title: 'Employee Profile', subtitle: 'Comprehensive employment details and documents' };
        }
        return { title: 'Dayflow HRMS', subtitle: 'Every workday, perfectly aligned.' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
