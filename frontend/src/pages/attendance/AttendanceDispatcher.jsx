import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminAttendancePage from './AdminAttendancePage';
import EmployeeAttendancePage from './EmployeeAttendancePage';

export const AttendanceDispatcher = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminAttendancePage /> : <EmployeeAttendancePage />;
};

export default AttendanceDispatcher;
