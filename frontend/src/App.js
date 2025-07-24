// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [userRole, setUserRole] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      console.log('Checking auth - Token exists:', !!token, 'Role:', role);
      
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          // Decode JWT token to check if it's expired
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Date.now() / 1000;
          
          console.log('Token payload:', payload);
          console.log('Token exp:', payload.exp, 'Current time:', currentTime);
          
          if (payload.exp && payload.exp > currentTime) {
            // Token is valid
            console.log('Token is valid, setting authenticated state');
            setIsAuthenticated(true);
            setUserRole(role || payload.role);
          } else {
            // Token is expired
            console.log('Token is expired, clearing auth');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } catch (error) {
          // Invalid token format
          console.error('Invalid token format:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        console.log('No valid token found, clearing any existing tokens and setting unauthenticated');
        // Clear any invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  // Add global CSS animations when app loads
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = (role) => {
    console.log('handleLogin called with role:', role);
    setIsAuthenticated(true);
    setUserRole(role);
    // Don't force page refresh, let React Router handle navigation
  };

  const handleLogout = () => {
    console.log('handleLogout called');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #25D366',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;