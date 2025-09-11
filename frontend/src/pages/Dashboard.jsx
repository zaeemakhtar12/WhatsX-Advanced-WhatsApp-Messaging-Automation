import React, { useState, createContext, useContext, useEffect } from 'react';
import BulkMessagePage from '../features/BulkMessage/BulkMessagePage';
import UserList from '../components/UserList';
import ScheduleMessage from '../components/ScheduleMessage';
import MessageLog from '../components/MessageLog';
import TemplateManagement from '../components/TemplateManagement';
import { getProfile, updateProfile, changePassword } from '../api';
import AdminRequestsPage from './AdminRequestsPage';

// Theme Context
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Dark Mode Toggle Component
function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
        </svg>
      )}
    </button>
  );
}

function stringToColor(str) {
  // Simple hash to color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function getInitials(name, email) {
  if (name && name.trim().length > 0) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }
  return '?';
}

function ProfileDropdown({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setEmail(data.email);
      setUsername(data.username);
    } catch (e) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    try {
      const res = await updateProfile({ email, username });
      setEmailSuccess('Profile updated successfully!');
      setProfile(res.user);
      setTimeout(() => setShowEmailModal(false), 1200);
    } catch (err) {
      setEmailError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!oldPassword || !newPassword) {
      setPasswordError('Both fields are required');
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1200);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 dark:bg-dark-border rounded-full animate-pulse" />
    );
  }

  const initials = getInitials(profile?.username, profile?.email);
  const avatarColor = stringToColor(profile?.email || profile?.username || 'user');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors duration-200"
        title={profile?.username || profile?.email || 'Profile'}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-base shadow"
          style={{ background: avatarColor }}
        >
          {initials}
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border z-50">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
                style={{ background: avatarColor }}
              >
                {initials}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{profile?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Role: <span className="font-semibold text-gray-700 dark:text-gray-200">{profile?.role}</span></p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setShowEmailModal(true); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors duration-200"
            >
              Change Email / Username
            </button>
            <button
              onClick={() => { setShowPasswordModal(true); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors duration-200"
            >
              Change Password
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
      {/* Change Email/Username Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Change Email / Username</h3>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  className="input-field"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
              {emailSuccess && <p className="text-green-600 text-sm">{emailSuccess}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Old Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Change</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ userRole, onLogout }) {
  const [currentPage, setCurrentPage] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only include admin features if userRole is admin
  const menuItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Dashboard analytics' 
    },
    { 
      id: 'bulk-message', 
      label: 'Bulk Message', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Send to multiple contacts' 
    },
    { 
      id: 'schedule-message', 
      label: 'Schedule Message', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Schedule future messages' 
    },
    ...(userRole === 'admin' ? [
      { 
        id: 'template-management', 
        label: 'Templates', 
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        description: 'Manage message templates' 
      },
      { 
        id: 'user-management', 
        label: 'User Management', 
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        description: 'Manage users' 
      },
      {
        id: 'admin-requests',
        label: 'Admin Requests',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
        description: 'Approve admin access'
      }
    ] : []),
    { 
      id: 'message-log', 
      label: 'Message Log', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'View sent messages' 
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="card p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to WhatsApp Bulk Messenger
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Streamline your communication with powerful bulk messaging capabilities, 
          scheduling features, and template management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {menuItems
          .filter(item =>
            userRole === 'admin' ? true : (item.id !== 'template-management' && item.id !== 'user-management' && item.id !== 'admin-requests')
          )
          .slice(1)
          .map((item) => (
            <div
              key={item.id}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              onClick={() => setCurrentPage(item.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-whatsapp-50 dark:bg-whatsapp-900/20 rounded-lg text-whatsapp-600 dark:text-whatsapp-400">
                  {item.icon}
                </div>
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="7,7 17,7 17,17" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18l18-9-18-9z" fill="currentColor"/>
            </svg>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage('bulk-message')}
              className="w-full text-left p-4 rounded-lg bg-whatsapp-50 dark:bg-whatsapp-900/20 border border-whatsapp-200 dark:border-whatsapp-700 hover:bg-whatsapp-100 dark:hover:bg-whatsapp-900/30 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-whatsapp-600" viewBox="0 0 24 24" fill="none">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Send Bulk Message</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send messages to multiple contacts instantly</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setCurrentPage('schedule-message')}
              className="w-full text-left p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Schedule Message</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan your messages for later delivery</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polygon points="10,8 16,12 10,16 10,8" fill="currentColor"/>
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { action: 'Bulk message sent', time: '2 minutes ago', type: 'success' },
              { action: 'Template created', time: '1 hour ago', type: 'info' },
              { action: 'Message scheduled', time: '3 hours ago', type: 'warning' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surfaceHover">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return renderOverview();
      case 'bulk-message':
        return <BulkMessagePage />;
      case 'schedule-message':
        return <ScheduleMessage />;
      case 'template-management':
        return <TemplateManagement />;
      case 'message-log':
        return <MessageLog />;
      case 'user-management':
        return userRole === 'admin' ? <UserList /> : renderOverview();
      case 'admin-requests':
        return userRole === 'admin' ? <AdminRequestsPage /> : renderOverview();
      default:
        return renderOverview();
    }
  };

  const Sidebar = () => (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-gray-800 transform transition-transform duration-300 ease-in-out
      ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    `}>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="white"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">WhatsX</h2>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                  ? 'bg-whatsapp-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-current">
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              window.location.href = '/whatsapp-connect';
            }}
            className="w-full text-left p-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-green-700 hover:text-white mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-current">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div className="font-medium">Connect WhatsApp</div>
                <div className="text-xs opacity-75">Connect your personal WhatsApp</div>
              </div>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="ml-72">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
            <div /> {/* Placeholder for left side */}
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <ProfileDropdown onLogout={onLogout} />
            </div>
          </header>
          {/* Page Content */}
          <main className="p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Dashboard;
