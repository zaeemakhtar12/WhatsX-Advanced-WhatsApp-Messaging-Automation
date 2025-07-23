import React, { useState, useMemo } from 'react';
import BulkMessagePage from '../features/BulkMessage/BulkMessagePage';
import UserList from '../components/UserList';
import ScheduleMessage from '../components/ScheduleMessage';
import MessageLog from '../components/MessageLog';
import TemplateManagement from '../components/TemplateManagement';

function Dashboard({ onLogout }) {
  const [selectedPage, setSelectedPage] = useState('home');

  // Decode user role from token
  const role = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'user';
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.role || 'user';
    } catch (error) {
      console.error('Error decoding token:', error);
      return 'user';
    }
  }, []);
  const renderContent = () => {
    switch (selectedPage) {
      case 'bulk':
        return <BulkMessagePage />;
      case 'schedule':
        return <ScheduleMessage />;
      case 'log':
        return <MessageLog />;
      case 'users':
        return <UserList />;
      case 'templates':
        return <TemplateManagement />;
      default:
        return (
          <>
            <h1 style={{ color: '#222' }}>
              Welcome to WhatsX <span style={{ textTransform: 'uppercase' }}>{role}</span> Dashboard
            </h1>
            <p style={{ marginTop: '20px', color: '#555' }}>
              Select an option from the sidebar to begin.
            </p>
            {/* Removed textarea input as requested */}
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: 'linear-gradient(180deg, #222 60%, #00ff90 100%)',
        color: '#fff',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        boxShadow: '2px 0 16px rgba(0,255,144,0.07)',
        borderTopRightRadius: '24px',
        borderBottomRightRadius: '24px',
        minHeight: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Logo" style={{ width: 38, height: 38, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,255,144,0.10)' }} />
          <h2 style={{ color: '#00ff90', margin: 0, fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>WhatsX</h2>
        </div>
        <hr style={{ width: '80%', border: 'none', borderTop: '1.5px solid #00ff90', margin: '10px 0 18px 0', opacity: 0.25 }} />
        <p style={{ color: '#fff', fontSize: 16, margin: 0, opacity: 0.85 }}>Role: <strong style={{ color: '#00ff90' }}>{role}</strong></p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0 0 0' }}>
          <SidebarButton onClick={() => setSelectedPage('bulk')}>Bulk Messaging</SidebarButton>
          <SidebarButton onClick={() => setSelectedPage('schedule')}>Schedule Message</SidebarButton>
          <SidebarButton onClick={() => setSelectedPage('log')}>Message Log</SidebarButton>
          {role === 'admin' && <SidebarButton onClick={() => setSelectedPage('users')}>User Management</SidebarButton>}
          {role === 'admin' && <SidebarButton onClick={() => setSelectedPage('templates')}>Template Management</SidebarButton>}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ ...btnStyle, backgroundColor: '#f44336', color: '#fff', width: '90%', marginTop: 18 }} onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          onLogout();
        }}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(120deg, #e0ffe8 0%, #00ff90 100%)',
        padding: '40px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: (selectedPage === 'users' || selectedPage === 'schedule' || selectedPage === 'log' || selectedPage === 'templates') ? 'flex-start' : 'center'
      }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          boxShadow: '0 4px 32px rgba(0,255,144,0.10)', 
          padding: (selectedPage === 'users' || selectedPage === 'schedule' || selectedPage === 'log' || selectedPage === 'templates') ? '20px' : '40px 36px', 
          minWidth: 340, 
          maxWidth: (selectedPage === 'users' || selectedPage === 'schedule' || selectedPage === 'log' || selectedPage === 'templates') ? '95%' : '700px', 
          width: '90%',
          maxHeight: (selectedPage === 'users' || selectedPage === 'schedule' || selectedPage === 'log' || selectedPage === 'templates') ? '90vh' : 'auto',
          overflowY: (selectedPage === 'users' || selectedPage === 'schedule' || selectedPage === 'log' || selectedPage === 'templates') ? 'auto' : 'visible'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}


const btnStyle = {
  backgroundColor: '#00b86b',
  color: '#fff',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '16px',
  margin: '4px 0',
  boxShadow: '0 2px 8px rgba(0,255,144,0.10)',
  transition: 'background 0.2s',
};

function SidebarButton({ children, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      style={{
        ...btnStyle,
        width: '100%',
        backgroundColor: hover ? '#00ff90' : btnStyle.backgroundColor,
        color: hover ? '#222' : btnStyle.color,
        transition: 'background 0.2s, color 0.2s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Dashboard;
