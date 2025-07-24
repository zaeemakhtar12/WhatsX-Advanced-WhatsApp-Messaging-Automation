import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #e0ffe8 0%, #00ff90 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 32,
      }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#222', marginBottom: 8, letterSpacing: 1 }}>Welcome to WhatsX</h1>
        <p style={{ fontSize: 18, color: '#444', opacity: 0.8, marginBottom: 0 }}>Your enhanced WhatsApp bulk messaging platform</p>
      </div>
      <div style={{
        display: 'flex',
        gap: '48px',
        marginTop: 12,
      }}>
        <div
          onClick={() => navigate('/login')}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            padding: '40px 60px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '22px',
            color: '#00b86b',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '2px solid #00ff90',
            textAlign: 'center',
            letterSpacing: 0.5,
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.07)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,144,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
          }}
        >
          User
        </div>
        <div
          onClick={() => navigate('/login?role=admin')}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            padding: '40px 60px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '22px',
            color: '#222',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '2px solid #222',
            textAlign: 'center',
            letterSpacing: 0.5,
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.07)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
          }}
        >
          Admin
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
