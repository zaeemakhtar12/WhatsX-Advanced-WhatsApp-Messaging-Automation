

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLogin }) {
  const location = useLocation();
  const isAdmin = location.search.includes('role=admin');
  const roleParam = isAdmin ? '?role=admin' : '';
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: 'linear-gradient(180deg, #222 60%, #00ff90 100%)',
        color: '#fff',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '2px 0 16px rgba(0,0,0,0.07)',
      }}>
        {/* Logo removed to fix import error. If you want to show the logo, use: */}
        {/* <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="WhatsX Logo" style={{ width: 64, height: 64, marginBottom: 18, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,255,144,0.15)' }} /> */}
        <h2 style={{ color: '#00ff90', margin: 0, fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>WhatsX</h2>
        <p style={{ color: '#fff', fontSize: 18, marginTop: 8, opacity: 0.85, fontWeight: 500 }}>{isAdmin ? 'Admin Login' : 'User Login'}</p>
      </div>
      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '30px',
        background: 'linear-gradient(90deg, #e0ffe8 0%, #f9f9f9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          padding: '48px 36px',
          minWidth: 340,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h2 style={{ color: '#222', marginBottom: 24 }}>Sign In to WhatsX</h2>
          <LoginForm onLogin={onLogin} role={isAdmin ? 'admin' : 'user'} />
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <span style={{ color: '#555', fontSize: 15 }}>Don't have an account? </span>
            <Link to={`/register${roleParam}`} style={{ color: '#00b86b', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;