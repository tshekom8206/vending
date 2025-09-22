import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estates from './pages/Estates';
import EstateDetails from './pages/EstateDetails';
import Users from './pages/Users';
import './App.css';

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) return false;

  try {
    const userData = JSON.parse(user);
    return userData.role === 'system_admin' || userData.role === 'estate_admin';
  } catch {
    return false;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to=\"/login\" replace />
  );
};

// Simple placeholder components for other routes
const EstatesPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">Estates Management</h2>
    <p className=\"text-gray-600\">Manage residential estates and their properties.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Estate CRUD operations, unit management, and occupancy tracking.
      </p>
    </div>
  </div>
);

const UsersPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">User Management</h2>
    <p className=\"text-gray-600\">Manage tenants, estate administrators, and system users.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> User CRUD operations, role management, and activity tracking.
      </p>
    </div>
  </div>
);

const PurchasesPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">Purchase Monitoring</h2>
    <p className=\"text-gray-600\">Monitor electricity purchases, transactions, and revenue.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Transaction history, refund management, and revenue analytics.
      </p>
    </div>
  </div>
);

const IncidentsPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">Incident Management</h2>
    <p className=\"text-gray-600\">Handle support tickets and customer issues.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Ticket management, escalation workflows, and SLA tracking.
      </p>
    </div>
  </div>
);

const NotificationsPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">Notification Center</h2>
    <p className=\"text-gray-600\">Manage system notifications and alerts.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Broadcast messaging, balance alerts, and notification templates.
      </p>
    </div>
  </div>
);

const ReportsPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">Reports & Analytics</h2>
    <p className=\"text-gray-600\">Generate reports and view system analytics.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Revenue reports, usage analytics, and performance metrics.
      </p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className=\"bg-white shadow rounded-lg p-6\">
    <h2 className=\"text-2xl font-bold mb-4\">System Settings</h2>
    <p className=\"text-gray-600\">Configure system settings and preferences.</p>
    <div className=\"mt-4 p-4 bg-blue-50 rounded-lg\">
      <p className=\"text-sm text-blue-800\">
        <strong>Coming Soon:</strong> Tariff management, payment gateway settings, and system configuration.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className=\"App\">
        <Routes>
          {/* Public Routes */}
          <Route
            path=\"/login\"
            element={isAuthenticated() ? <Navigate to=\"/\" replace /> : <Login />}
          />

          {/* Protected Routes */}
          <Route path=\"/\" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path=\"/estates\" element={
            <ProtectedRoute>
              <Estates />
            </ProtectedRoute>
          } />

          <Route path=\"/estates/:id\" element={
            <ProtectedRoute>
              <EstateDetails />
            </ProtectedRoute>
          } />

          <Route path=\"/users\" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />

          <Route path=\"/purchases\" element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          } />

          <Route path=\"/incidents\" element={
            <ProtectedRoute>
              <IncidentsPage />
            </ProtectedRoute>
          } />

          <Route path=\"/notifications\" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          <Route path=\"/reports\" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path=\"/settings\" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path=\"*\" element={<Navigate to=\"/\" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;