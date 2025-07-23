import React, { useState, useMemo } from 'react';
import BulkMessagePage from '../features/BulkMessage/BulkMessagePage';
import UserList from '../components/UserList';
import ScheduleMessage from '../components/ScheduleMessage';
import MessageLog from '../components/MessageLog';
import TemplateManagement from '../components/TemplateManagement';

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Profile Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          border: '2px solid #E4E6EA',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: '#1F2937',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#25D366';
          e.target.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#E4E6EA';
          e.target.style.boxShadow = 'none';
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700
        }}>
          {getInitials(user.username)}
        </div>
        
        {/* User Name */}
        <span>{user.username}</span>
        
        {/* Dropdown Arrow */}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="currentColor"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '2px solid #E4E6EA',
            minWidth: 280,
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {/* User Info Header */}
            <div style={{
              padding: '16px 20px',
              background: '#F7F8FA',
              borderBottom: '2px solid #E4E6EA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#25D366',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  {getInitials(user.username)}
                </div>
                <div>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 700, 
                    color: '#1F2937',
                    marginBottom: 2
                  }}>
                    {user.username}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#6B7280' 
                  }}>
                    {user.email}
                  </div>
                </div>
              </div>
              
              {/* Role Badge */}
              <div style={{
                display: 'inline-block',
                background: user.role === 'admin' ? '#DC2626' : '#25D366',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {user.role}
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              {/* Profile Info (non-clickable) */}
              <div style={{
                padding: '12px 20px',
                fontSize: 14,
                color: '#6B7280',
                borderBottom: '1px solid #F0F0F0'
              }}>
                <div style={{ marginBottom: 4 }}>
                  <strong style={{ color: '#374151' }}>Email:</strong> {user.email}
                </div>
                <div>
                  <strong style={{ color: '#374151' }}>Role:</strong> {user.role}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 14,
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [selectedPage, setSelectedPage] = useState('home');

  // Decode user info from token
  const user = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { username: 'User', email: 'user@example.com', role: 'user' };
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return {
        username: decoded.username || 'User',
        email: decoded.email || 'user@example.com',
        role: decoded.role || 'user'
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return { username: 'User', email: 'user@example.com', role: 'user' };
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
          <div style={{ 
            padding: '40px',
            textAlign: 'center',
            background: '#F0F2F5',
            borderRadius: 16,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ 
              background: '#fff',
              padding: '32px',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '2px solid #E4E6EA',
              maxWidth: '500px'
            }}>
              <h1 style={{ 
                color: '#1F2937',
                marginBottom: '16px',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                Welcome to WhatsX
              </h1>
              <div style={{
                display: 'inline-block',
                background: '#25D366',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                {user.role} Dashboard
              </div>
              <p style={{ 
                color: '#6B7280',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: 0
              }}>
                Select an option from the sidebar to begin managing your messages.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: '#F0F2F5'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
        color: '#fff',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          marginBottom: 16,
          padding: '8px 0'
        }}>
          <img 
            src={process.env.PUBLIC_URL + '/logo192.png'} 
            alt="Logo" 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 6,
              background: '#fff',
              padding: 3
            }} 
          />
          <h2 style={{ 
            color: '#25D366', 
            margin: 0, 
            fontWeight: 700, 
            fontSize: 20, 
            letterSpacing: 0.5 
          }}>
            WhatsX
          </h2>
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          flex: 1
        }}>
          <SidebarButton 
            onClick={() => setSelectedPage('bulk')}
            active={selectedPage === 'bulk'}
          >
            Bulk Messaging
          </SidebarButton>
          <SidebarButton 
            onClick={() => setSelectedPage('schedule')}
            active={selectedPage === 'schedule'}
          >
            Schedule Message
          </SidebarButton>
          <SidebarButton 
            onClick={() => setSelectedPage('log')}
            active={selectedPage === 'log'}
          >
            Message Log
          </SidebarButton>
          {user.role === 'admin' && (
            <SidebarButton 
              onClick={() => setSelectedPage('users')}
              active={selectedPage === 'users'}
            >
              User Management
            </SidebarButton>
          )}
          {user.role === 'admin' && (
            <SidebarButton 
              onClick={() => setSelectedPage('templates')}
              active={selectedPage === 'templates'}
            >
              Template Management
            </SidebarButton>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '260px',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Top Bar with Profile */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: '#F0F2F5',
          padding: '16px 24px',
          borderBottom: '2px solid #E4E6EA',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 500
        }}>
          <ProfileDropdown user={user} onLogout={onLogout} />
        </div>

        {/* Page Content */}
        {selectedPage === 'home' ? (
          renderContent()
        ) : (
          <div style={{ background: '#F0F2F5' }}>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarButton({ children, onClick, active }) {
  const [hover, setHover] = React.useState(false);
  
  return (
    <button
      style={{
        background: active ? '#25D366' : 
                   hover ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
        color: active ? '#fff' : hover ? '#25D366' : '#E5E7EB',
        border: active ? '1px solid #25D366' : '1px solid transparent',
        padding: '10px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        textAlign: 'left',
        fontWeight: active ? 600 : 500,
        fontSize: 13,
        transition: 'all 0.2s ease',
        width: '100%'
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
