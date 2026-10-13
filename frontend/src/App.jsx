import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/LeadsList';
import CompaniesPage from './pages/CompaniesPage';
import TasksPage from './pages/TasksPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route matching Wireframe 1 */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Layout matching Wireframe 2 */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>

        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
