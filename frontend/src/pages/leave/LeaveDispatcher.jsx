import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLeaveApprovalsPage from './AdminLeaveApprovalsPage';
import EmployeeLeavePage from './EmployeeLeavePage';

export const LeaveDispatcher = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminLeaveApprovalsPage /> : <EmployeeLeavePage />;
};

export default LeaveDispatcher;
