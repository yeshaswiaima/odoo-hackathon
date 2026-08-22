# Dayflow HRMS — Modern Human Resource Management System

> **“Every workday, perfectly aligned.”**

![Dayflow HRMS Platform](https://img.shields.io/badge/Dayflow-HRMS_2.4-blue?style=for-the-badge&logo=appveyor)
![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_TailwindCSS-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express_REST_APIs-339933?style=for-the-badge&logo=nodedotjs)
![Security](https://img.shields.io/badge/Security-JWT_Bearer_%2B_RBAC-success?style=for-the-badge)

Dayflow is a modern, responsive, full-stack Human Resource Management System (HRMS) designed with a clean, calm, SaaS aesthetic. It replaces disjointed spreadsheets and static forms with unified, real-time workflows for employee profiles, attendance tracking, leave applications & approvals, itemized payroll calculations, printable payslips, notification feeds, and company-wide analytics.

---

## 🌟 Key Features

### 1. Dual Role-Based Access Control (RBAC)
- **Employee Workspace**:
  - Live clock-in and clock-out with work duration calculation.
  - Leave balance tracking (Paid, Sick, and Unpaid leave) with instant application workflow.
  - Itemized salary breakdown (Gross Earnings, House Allowance, Deductions, Taxes, Net Disbursal).
  - Printable / downloadable computer-generated payslips.
  - Self-service contact details editing (phone, address, avatar).
  - Real-time personal notification alerts.
- **Admin / HR Officer Hub**:
  - Organization dashboard with real-time attendance distribution (Present, Half-day, On Leave, Absent).
  - Centralized Leave Approval Queue with single-click Approval and Rejection workflows (including notes and reasons).
  - Full Employee Directory with multi-field search, department filters, status toggle, and employee onboarding modal.
  - Organization-wide attendance log with date range picker and manual attendance overrides.
  - Compensation management with dynamic formula recalculation:
    $$\text{Net Salary} = \text{Basic Salary} + \text{House Allowance} + \text{Other Allowances} - \text{Deductions} - \text{Tax}$$
  - Workforce intelligence & exportable analytics reports for headcount and punctuality.

---

## 🔑 Demo Login Credentials

The system comes pre-seeded with realistic employee and administrative data. You can log in using either account below, or use the **one-click demo presets** on the Sign-In screen:

| Role | Email Address | Password | Name | Assigned Department |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / HR Officer** | `admin@dayflow.com` | `Admin@123` | Priya Sharma | Human Resources (HR Director) |
| **Employee** | `employee@dayflow.com` | `Employee@123` | Alex Morgan | Engineering (Senior Full Stack) |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (customized with Dayflow Navy & Deep Slate SaaS palette)
- **Routing**: React Router DOM v6 with role-protected route guards
- **Icons**: Lucide React
- **Typography**: Inter / Sans-Serif system font

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js REST API
- **Authentication**: Stateless JSON Web Tokens (JWT) with PBKDF2 secure password hashing
- **CORS & Middleware**: Express JSON body parsers, role-based authorization gates

### Database
- **Engine**: Persistent, zero-dependency local JSON database engine (`backend/database/dayflow_db.json`) supporting atomic writes, relational queries, auto-increment primary keys, and instant seeding.

---

## 📂 Project Architecture

```text
dayflow-hrms/
├── backend/
│   ├── config/
│   │   └── db.js                 # Persistent local JSON database engine
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile resolution
│   │   ├── employeeController.js # CRUD operations & department headcount
│   │   ├── attendanceController.js # Check-in/out, personal history, admin attendance
│   │   ├── leaveController.js    # Quotas, application, approvals, rejections
│   │   ├── payrollController.js  # Salary structures, recalculations, payslip data
│   │   ├── notificationController.js # Read/unread notifications center
│   │   └── reportController.js   # Workforce intelligence & analytics
│   ├── database/
│   │   ├── seed.js               # Realistic seed script
│   │   └── dayflow_db.json       # Persisted database storage
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer token verification
│   │   └── roleAuth.js           # Role-based access control guard
│   ├── routes/                   # Express route definitions
│   ├── services/
│   │   └── authService.js        # PBKDF2 hashing & JWT crypto
│   ├── package.json
│   └── server.js                 # Server entry point (Port 5000)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Button, Input, Select, Modal, StatusBadge, Card, StatCard, Skeleton
│   │   │   └── layout/           # Sidebar, Header, MainLayout, ProtectedRoute, RoleRoute
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Session management & user state
│   │   │   └── ToastContext.jsx  # Floating toast notification feedback
│   │   ├── pages/
│   │   │   ├── auth/             # SignInPage, SignUpPage
│   │   │   ├── dashboard/        # AdminDashboard, EmployeeDashboard
│   │   │   ├── employee/         # EmployeesPage, EmployeeDetailPage, MyProfilePage
│   │   │   ├── attendance/       # EmployeeAttendancePage, AdminAttendancePage
│   │   │   ├── leave/            # EmployeeLeavePage, AdminLeaveApprovalsPage
│   │   │   ├── payroll/          # EmployeePayrollPage, AdminPayrollPage
│   │   │   ├── reports/          # ReportsPage
│   │   │   └── notifications/    # NotificationsPage
│   │   ├── services/
│   │   │   └── api.js            # Unified API client
│   │   ├── App.jsx               # Route definitions & providers
│   │   ├── main.jsx              # DOM root mount
│   │   └── index.css             # Tailwind base styles & print styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

### 2. Backend Setup
Open a terminal in the project directory:

```bash
cd backend
npm install
```

#### Seed the Database:
Generate realistic test data including employees, 30 days of attendance records, pending/approved leaves, salary structures, and notifications:

```bash
npm run seed
```

#### Start the Backend Server:
```bash
npm run dev
```
*The API will be live at `http://localhost:5000/api/health`.*

---

### 3. Frontend Setup
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
*The Dayflow web application will open at `http://localhost:5173`.*

---

## 📸 Screenshots & Workflow Preview

### 1. Modern Split-Screen Authentication
Clean SaaS login interface featuring quick-fill preset buttons for instant role testing and comprehensive password strength validation.

### 2. Employee Workday Workspace
Interactive real-time check-in clock, remaining leave quota balance indicators, current month's salary preview, and recent activity log.

### 3. Executive Admin Dashboard
High-level organization metrics, real-time multi-color attendance distribution breakdown, and single-click leave approval queues.

### 4. Color-Coded Attendance Calendar
Intuitive monthly calendar grid color-coded by status (Green: Present, Amber: Half-day, Blue: Leave, Red: Absent).

### 5. Interactive SaaS Payslips
Printable, formatted salary payslips complete with company headers, earnings breakdown, statutory tax deductions, and net payable summaries.

---

## 🛡️ Role-Based API Permissions Reference

| Endpoint | Method | Role Allowed | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Public | Authenticates credentials and returns JWT token |
| `/api/v1/auth/register` | `POST` | Public | Registers a new employee or admin account |
| `/api/v1/auth/me` | `GET` | Authenticated | Retrieves current user session |
| `/api/v1/attendance/today` | `GET` | Employee / Admin | Returns today's check-in timestamp and status |
| `/api/v1/attendance/check-in` | `POST` | Employee / Admin | Records workday check-in |
| `/api/v1/attendance/check-out` | `POST` | Employee / Admin | Records workday check-out |
| `/api/v1/attendance/all` | `GET` | Admin / HR | Retrieves organization-wide attendance records |
| `/api/v1/leaves/balances` | `GET` | Employee / Admin | Returns remaining Paid & Sick leave quotas |
| `/api/v1/leaves/apply` | `POST` | Employee / Admin | Submits a new time-off application |
| `/api/v1/leaves/:id/approve` | `PUT` | Admin / HR | Approves leave request and notifies employee |
| `/api/v1/leaves/:id/reject` | `PUT` | Admin / HR | Declines leave request with required explanation |
| `/api/v1/employees` | `GET` | Admin / HR | Searchable, paginated employee directory |
| `/api/v1/payroll/salary/:id` | `PUT` | Admin / HR | Updates compensation structure and recalculates net |
| `/api/v1/reports/analytics` | `GET` | Admin / HR | Aggregated headcount, punctuality, and payroll metrics |

---

## 📄 License
Dayflow HRMS is released under the **MIT License**. Built with clean architecture and scalable code.
