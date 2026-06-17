import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';

import UserStores from './pages/user/Stores';

import OwnerDashboard from './pages/owner/Dashboard';

import ChangePassword from './pages/shared/ChangePassword';

import './styles/global.css';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'user') return <Navigate to="/user/stores" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute role="admin"><AdminStores /></ProtectedRoute>
          } />

          {/* Normal User */}
          <Route path="/user/stores" element={
            <ProtectedRoute role="user"><UserStores /></ProtectedRoute>
          } />
          <Route path="/user/password" element={
            <ProtectedRoute role="user"><ChangePassword /></ProtectedRoute>
          } />

          {/* Store Owner */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute role="store_owner"><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/owner/password" element={
            <ProtectedRoute role="store_owner"><ChangePassword /></ProtectedRoute>
          } />

          {/* Root redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
