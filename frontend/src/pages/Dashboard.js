import React, { useState } from 'react';
import BulkMessagePage from '../features/BulkMessage/BulkMessagePage';

function Dashboard({ onLogout }) {
  const token = localStorage.getItem('token');
  const decoded = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const role = decoded.role;

  const [selectedPage, setSelectedPage] = useState('home'); // track selected option

  // Content rendering based on selected sidebar button
  const renderContent = () => {
    switch (selectedPage) {
      case 'bulk':
        return <BulkMessagePage />;
      case 'schedule':
        return <div>Schedule Message Page</div>;
      case 'log':
        return <div>Message Log Page</div>;
      case 'users':
        return <div>User Management Page</div>;
      case 'templates':
        return <div>Template Management Page</div>;
      default:
        return (
          <>
            <h1 style={{ color: '#222' }}>
              Welcome to WhatsX <span style={{ textTransform: 'uppercase' }}>{role}</span> Dashboard
            </h1>
            <p style={{ marginTop: '20px', color: '#555' }}>
              Select an option from the sidebar to begin.
            </p>
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        <h2 style={{ color: '#00ff90' }}>WhatsX</h2>
        <p>Role: <strong>{role}</strong></p>
        <button style={btnStyle} onClick={() => setSelectedPage('bulk')}>Bulk Messaging</button>
        <button style={btnStyle} onClick={() => setSelectedPage('schedule')}>Schedule Message</button>
        <button style={btnStyle} onClick={() => setSelectedPage('log')}>Message Log</button>
        {role === 'admin' && (
          <>
            <button style={btnStyle} onClick={() => setSelectedPage('users')}>User Management</button>
            <button style={btnStyle} onClick={() => setSelectedPage('templates')}>Template Management</button>
          </>
        )}
        <button style={{ ...btnStyle, backgroundColor: '#f44336' }} onClick={() => {
          localStorage.removeItem('token');
          onLogout();
        }}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '30px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

const btnStyle = {
  backgroundColor: '#444',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
};

export default Dashboard;
