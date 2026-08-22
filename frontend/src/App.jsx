import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Guards
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

// Auth Pages
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

// Dashboards
import DashboardDispatcher from './pages/dashboard/DashboardDispatcher';

// Employee Management
import EmployeesPage from './pages/employee/EmployeesPage';
import EmployeeDetailPage from './pages/employee/EmployeeDetailPage';
import MyProfilePage from './pages/employee/MyProfilePage';

// Attendance
import AttendanceDispatcher from './pages/attendance/AttendanceDispatcher';

// Leaves
import LeaveDispatcher from './pages/leave/LeaveDispatcher';
import AdminLeaveApprovalsPage from './pages/leave/AdminLeaveApprovalsPage';

// Payroll
import PayrollDispatcher from './pages/payroll/PayrollDispatcher';

// Reports & Notifications
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// 404
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<SignInPage />} />
            <Route path="/register" element={<SignUpPage />} />

            {/* Authenticated Workspace Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Default Redirect to Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Dynamic Dashboard */}
              <Route path="dashboard" element={<DashboardDispatcher />} />

              {/* My Profile */}
              <Route path="profile" element={<MyProfilePage />} />

              {/* Attendance Tracking */}
              <Route path="attendance" element={<AttendanceDispatcher />} />

              {/* Leaves & Time Off */}
              <Route path="leaves" element={<LeaveDispatcher />} />

              {/* Payroll & Compensation */}
              <Route path="payroll" element={<PayrollDispatcher />} />

              {/* Notifications Center */}
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Admin Specific Routes with Role Guard */}
              <Route
                path="employees"
                element={
                  <RoleRoute allowedRoles={['admin', 'hr', 'hr_officer']}>
                    <EmployeesPage />
                  </RoleRoute>
                }
              />
              <Route
                path="employees/:id"
                element={
                  <RoleRoute allowedRoles={['admin', 'hr', 'hr_officer', 'employee']}>
                    <EmployeeDetailPage />
                  </RoleRoute>
                }
              />
              <Route
                path="leave-approvals"
                element={
                  <RoleRoute allowedRoles={['admin', 'hr', 'hr_officer']}>
                    <AdminLeaveApprovalsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <RoleRoute allowedRoles={['admin', 'hr', 'hr_officer']}>
                    <ReportsPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
