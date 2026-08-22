import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboardPage from './AdminDashboardPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';

export const DashboardDispatcher = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboardPage /> : <EmployeeDashboardPage />;
};

export default DashboardDispatcher;
