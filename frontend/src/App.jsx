// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UnifiedAuthPage from './pages/UnifiedAuthPage';
import Dashboard from './pages/Dashboard';
import VerifyOtpPage from './pages/VerifyOtpPage';
import AdminRequestPage from './pages/AdminRequestPage';
import { NotificationProvider } from './components/NotificationSystem';
import apiClient from './utils/apiClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || token === 'null' || token === 'undefined') {
        setIsAuthenticated(false);
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setIsAuthenticated(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        return;
      }

      // Verify token with backend
      await apiClient.get('/profile');
      
      const role = localStorage.getItem('role');
      setUserRole(role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const handleRegister = () => {
    window.location.href = '/verify-otp';
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-blue-50 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-whatsapp-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-blue-50 dark:from-dark-bg dark:to-dark-surface">
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <UnifiedAuthPage onLogin={handleLogin} onRegister={handleRegister} />
              )} 
            />
            <Route 
              path="/verify-otp" 
              element={<VerifyOtpPage />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? (
                <Dashboard userRole={userRole} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )} 
            />
            <Route 
              path="/admin-request" 
              element={<AdminRequestPage />} 
            />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;