import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminPayrollPage from './AdminPayrollPage';
import EmployeePayrollPage from './EmployeePayrollPage';

export const PayrollDispatcher = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminPayrollPage /> : <EmployeePayrollPage />;
};

export default PayrollDispatcher;
