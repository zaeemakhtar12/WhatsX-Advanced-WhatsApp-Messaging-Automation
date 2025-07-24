import React, { useState, useMemo, createContext, useContext } from 'react';
import BulkMessagePage from '../features/BulkMessage/BulkMessagePage';
import UserList from '../components/UserList';
import ScheduleMessage from '../components/ScheduleMessage';
import MessageLog from '../components/MessageLog';
import TemplateManagement from '../components/TemplateManagement';
import { getDashboardStats, getUserStats, getTemplateStatsAPI } from '../api';

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
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      primary: '#25D366',
      background: isDark ? '#121212' : '#F0F2F5',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#1F2937',
      textSecondary: isDark ? '#B3B3B3' : '#6B7280',
      border: isDark ? '#333333' : '#E5E7EB',
      sidebarBg: isDark ? 'linear-gradient(180deg, #1F1F1F 0%, #121212 100%)' : 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
      cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
      hover: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
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
      style={{
        background: 'transparent',
        border: 'none',
        padding: '8px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        width: '36px',
        height: '36px'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'transparent';
      }}
    >
      {isDark ? (
        // Sun icon for light mode
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="#FFD700" strokeWidth="2"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="#FFD700" strokeWidth="2"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="#FFD700" strokeWidth="2"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#FFD700" strokeWidth="2"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#FFD700" strokeWidth="2"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="#FFD700" strokeWidth="2"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="#FFD700" strokeWidth="2"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#FFD700" strokeWidth="2"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#FFD700" strokeWidth="2"/>
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#6366F1"/>
        </svg>
      )}
    </button>
  );
}

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

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
          background: colors.surface,
          border: `2px solid ${colors.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: colors.text,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#25D366';
          e.target.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = colors.border;
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
            background: colors.surface,
            borderRadius: 8,
            padding: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${colors.border}`,
            minWidth: '200px',
            zIndex: 1000
          }}>
            {/* User Info */}
            <div style={{
              padding: '8px 0',
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: '8px'
            }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '14px',
                color: colors.text,
                marginBottom: '2px'
              }}>
                {user.username}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: colors.textSecondary,
                marginBottom: '4px'
              }}>
                {user.email}
              </div>
              <div style={{
                background: colors.isDark ? '#2A2A2A' : '#F3F4F6',
                color: '#25D366',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'inline-block'
              }}>
                {user.role}
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                onLogout();
              }}
              style={{
                width: '100%',
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#B91C1C'}
              onMouseLeave={(e) => e.target.style.background = '#DC2626'}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Dashboard Statistics Cards Component
function DashboardStats({ user }) {
  const [stats, setStats] = useState({
    messages: null,
    users: null,
    templates: null,
    loading: true
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // Fetch message stats (available to all users)
        const messageStats = await getDashboardStats();
        
        let userStats = null;
        let templateStats = null;
        
        // Fetch admin-only stats if user is admin
        if (user.role === 'admin') {
          try {
            userStats = await getUserStats();
            templateStats = await getTemplateStatsAPI();
          } catch (error) {
            console.log('Admin stats not available:', error);
          }
        }
        
        setStats({
          messages: messageStats,
          users: userStats,
          templates: templateStats,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user.role]);

  const StatCard = ({ title, value, subtitle, icon, color = '#25D366', isLoading = false }) => {
    const { colors } = useTheme();
    
    return (
      <div 
        className="hover-lift animate-slideIn"
        style={{
          background: colors.cardBg,
          borderRadius: 12,
          padding: isMobile ? '16px' : '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
          animationDelay: `${Math.random() * 0.2}s`
        }}
      >
        {/* Background gradient with enhanced animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: isMobile ? '60px' : '80px',
          height: isMobile ? '60px' : '80px',
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          borderRadius: '0 0 0 80px',
          zIndex: 1,
          transition: 'all 0.3s ease',
          transform: 'scale(1)'
        }} 
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.background = `linear-gradient(135deg, ${color}30, ${color}20)`;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.background = `linear-gradient(135deg, ${color}20, ${color}10)`;
        }} />
        
        {/* Icon with bounce animation */}
        <div 
          className="animate-bounceIn"
          style={{
            position: 'absolute',
            top: isMobile ? '8px' : '12px',
            right: isMobile ? '8px' : '12px',
            zIndex: 2,
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animationDelay: '0.2s'
          }}
        >
          {icon}
        </div>
        
        {/* Content with staggered animation */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h3 
            className="animate-slideInLeft"
            style={{
              margin: 0,
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 600,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              animationDelay: '0.1s'
            }}
          >
            {title}
          </h3>
          
          {isLoading ? (
            <div style={{
              width: '60px',
              height: isMobile ? '24px' : '28px',
              background: colors.border,
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          ) : (
            <div 
              className="animate-slideInLeft"
              style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: 700,
                color: colors.text,
                marginBottom: '4px',
                animationDelay: '0.2s'
              }}
            >
              {value}
            </div>
          )}
          
          {subtitle && (
            <p 
              className="animate-slideInLeft"
              style={{
                margin: 0,
                fontSize: isMobile ? '10px' : '12px',
                color: colors.textSecondary,
                fontWeight: 500,
                animationDelay: '0.3s'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : user.role === 'admin' 
            ? 'repeat(auto-fit, minmax(240px, 1fr))' 
            : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        {/* Message Statistics */}
        <StatCard
          title="Total Messages"
          value={stats.loading ? '...' : stats.messages?.totalMessages || 0}
          subtitle={stats.messages ? `${stats.messages.recentMessages || 0} this week` : ''}
          icon={<MessageIcon />}
          color="#25D366"
          isLoading={stats.loading}
        />
        
        <StatCard
          title="Success Rate"
          value={stats.loading ? '...' : `${stats.messages?.successRate || 0}%`}
          subtitle={stats.messages ? `${stats.messages.sentMessages || 0} delivered` : ''}
          icon={<SuccessIcon />}
          color="#10B981"
          isLoading={stats.loading}
        />
        
        {user.role === 'admin' && (
          <>
            <StatCard
              title="Total Users"
              value={stats.loading ? '...' : stats.users?.totalUsers || 0}
              subtitle={stats.users ? `${stats.users.recentUsers || 0} new this week` : ''}
              icon={<UsersIcon />}
              color="#3B82F6"
              isLoading={stats.loading}
            />
            
            <StatCard
              title="Templates"
              value={stats.loading ? '...' : stats.templates?.totalTemplates || 0}
              subtitle={stats.templates ? `${stats.templates.totalUsage || 0} total uses` : ''}
              icon={<TemplateIcon />}
              color="#8B5CF6"
              isLoading={stats.loading}
            />
          </>
        )}
        
        {user.role !== 'admin' && (
          <StatCard
            title="Pending Messages"
            value={stats.loading ? '...' : stats.messages?.pendingMessages || 0}
            subtitle="Scheduled messages"
            icon={<ClockIcon />}
            color="#F59E0B"
            isLoading={stats.loading}
          />
        )}
      </div>

      {/* Analytics Charts */}
      {!stats.loading && stats.messages?.dailyStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : user.role === 'admin' 
              ? 'repeat(auto-fit, minmax(400px, 1fr))' 
              : '1fr',
          gap: isMobile ? '16px' : '24px',
          marginBottom: isMobile ? '24px' : '32px'
        }}>
          <SimpleChart
            data={stats.messages.dailyStats}
            title="Message Activity (Last 7 Days)"
            color="#25D366"
          />
          
          {user.role === 'admin' && stats.users?.dailyRegistrations && (
            <SimpleChart
              data={stats.users.dailyRegistrations}
              title="User Registrations (Last 7 Days)"
              color="#3B82F6"
            />
          )}
        </div>
      )}
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [selectedPage, setSelectedPage] = useState('home');
  const [user, setUser] = useState({ username: '', role: '', email: '' });

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.username || 'User',
          role: payload.role || 'user',
          email: payload.email || 'user@example.com'
        });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <DashboardContent 
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        user={user}
        onLogout={onLogout}
      />
    </ThemeProvider>
  );
}

function DashboardContent({ selectedPage, setSelectedPage, user, onLogout }) {
  const { colors } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width <= 1024 && width > 768);
      
      // Close mobile menu on resize to desktop
      if (width > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main dashboard content when no specific page is selected
  const renderContent = () => {
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Quick Actions Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: 12,
          padding: isMobile ? '20px' : '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 700,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🚀 Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
            <ActionButton
              onClick={() => setSelectedPage('bulk')}
              icon={<SendIcon />}
              title="Send Bulk Message"
              description="Send messages to multiple contacts"
              color="#25D366"
            />
            <ActionButton
              onClick={() => setSelectedPage('schedule')}
              icon={<ScheduleIcon />}
              title="Schedule Message"
              description="Plan messages for later"
              color="#3B82F6"
            />
            {user.role === 'admin' && (
              <ActionButton
                onClick={() => setSelectedPage('templates')}
                icon={<SettingsIcon />}
                title="Manage Templates"
                description="Create and edit message templates"
                color="#8B5CF6"
              />
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: 12,
          padding: isMobile ? '20px' : '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 700,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📈 Platform Overview
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
            <OverviewItem
              icon={<MessageIcon />}
              label="Message System"
              value="Active"
              color="#25D366"
            />
            <OverviewItem
              icon={<UsersIcon />}
              label="User Management"
              value={user.role === 'admin' ? 'Full Access' : 'Limited'}
              color="#3B82F6"
            />
            <OverviewItem
              icon={<TemplateIcon />}
              label="Templates"
              value="Available"
              color="#8B5CF6"
            />
            <OverviewItem
              icon={<ClockIcon />}
              label="Scheduling"
              value="Enabled"
              color="#F59E0B"
            />
          </div>
        </div>

        {/* Welcome Card */}
        <div style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: 12,
          padding: isMobile ? '20px' : '24px',
          color: '#fff',
          gridColumn: isMobile ? '1' : user.role === 'admin' ? 'span 2' : 'span 1'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 700
          }}>
            Welcome back, {user.username}! 👋
          </h3>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '14px' : '16px',
            opacity: 0.9,
            lineHeight: 1.5
          }}>
            {user.role === 'admin' 
              ? 'Manage your WhatsApp messaging platform with full administrative controls.'
              : 'Send bulk messages and manage your communication efficiently.'
            }
          </p>
          <div style={{
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setSelectedPage('bulk')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: 6,
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Start Messaging
            </button>
            <button
              onClick={() => setSelectedPage('log')}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: 6,
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              View History
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper components for the card layout
  const ActionButton = ({ onClick, icon, title, description, color }) => {
    
    return (
      <button
        className="btn-ripple hover-lift animate-slideInRight"
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: colors.isDark ? '#2A2A2A' : '#F9FAFB',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '12px',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animationDelay: `${Math.random() * 0.3}s`,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = colors.isDark ? '#3A3A3A' : '#F3F4F6';
          e.target.style.borderColor = color;
          e.target.style.transform = 'translateX(2px)';
          e.target.style.boxShadow = `0 4px 12px ${color}20`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = colors.isDark ? '#2A2A2A' : '#F9FAFB';
          e.target.style.borderColor = colors.border;
          e.target.style.transform = 'translateX(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.text,
            marginBottom: '2px'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {description}
          </div>
        </div>
      </button>
    );
  };

  const OverviewItem = ({ icon, label, value, color }) => {
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
          <span style={{ fontSize: '14px', color: colors.textSecondary }}>{label}</span>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: color,
          background: `${color}15`,
          padding: '4px 8px',
          borderRadius: 4
        }}>
          {value}
        </span>
      </div>
    );
  };

  // Mobile Menu Toggle Component
  const MobileMenuToggle = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      style={{
        background: 'transparent',
        border: 'none',
        color: colors.text,
        fontSize: '24px',
        cursor: 'pointer',
        padding: '8px',
        display: isMobile ? 'block' : 'none'
      }}
    >
      ☰
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: colors.background,
      color: colors.text,
      transition: 'all 0.3s ease'
    }}>
      {/* Mobile Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '280px' : isTablet ? '240px' : '260px',
        background: colors.sidebarBg,
        color: '#fff',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: isMobile ? (isMobileMenuOpen ? '0' : '-280px') : '0',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
        transition: 'left 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 16,
          padding: '8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              fontSize: isMobile ? 18 : 20, 
              letterSpacing: 0.5 
            }}>
              WhatsX
            </h2>
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 6,
          flex: 1
        }}>
          <SidebarButton 
            onClick={() => {
              setSelectedPage('bulk');
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            active={selectedPage === 'bulk'}
            icon={<SendIcon size={18} color={selectedPage === 'bulk' ? '#fff' : '#9CA3AF'} />}
            animationDelay="0.1s"
          >
            Bulk Messaging
          </SidebarButton>
          <SidebarButton 
            onClick={() => {
              setSelectedPage('schedule');
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            active={selectedPage === 'schedule'}
            icon={<ScheduleIcon size={18} color={selectedPage === 'schedule' ? '#fff' : '#9CA3AF'} />}
            animationDelay="0.2s"
          >
            Schedule Message
          </SidebarButton>
          <SidebarButton 
            onClick={() => {
              setSelectedPage('log');
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            active={selectedPage === 'log'}
            icon={<MessageIcon size={18} color={selectedPage === 'log' ? '#fff' : '#9CA3AF'} />}
            animationDelay="0.3s"
          >
            Message Log
          </SidebarButton>
          {user.role === 'admin' && (
            <SidebarButton 
              onClick={() => {
                setSelectedPage('users');
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              active={selectedPage === 'users'}
              icon={<UsersIcon size={18} color={selectedPage === 'users' ? '#fff' : '#9CA3AF'} />}
              animationDelay="0.4s"
            >
              User Management
            </SidebarButton>
          )}
          {user.role === 'admin' && (
            <SidebarButton 
              onClick={() => {
                setSelectedPage('templates');
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              active={selectedPage === 'templates'}
              icon={<TemplateIcon size={18} color={selectedPage === 'templates' ? '#fff' : '#9CA3AF'} />}
              animationDelay="0.5s"
            >
              Template Management
            </SidebarButton>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : isTablet ? '240px' : '260px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: colors.surface,
          padding: isMobile ? '12px 16px' : '16px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MobileMenuToggle />
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: 700,
              color: colors.text
            }}>
              {selectedPage === 'home' ? 'Dashboard' : 
               selectedPage === 'bulk' ? 'Bulk Messaging' :
               selectedPage === 'schedule' ? 'Schedule Message' :
               selectedPage === 'log' ? 'Message Log' :
               selectedPage === 'users' ? 'User Management' :
               selectedPage === 'templates' ? 'Template Management' : 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            <DarkModeToggle />
            <ProfileDropdown user={user} onLogout={onLogout} />
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          flex: 1,
          padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
          overflowY: 'auto',
          background: colors.background
        }}>
          {selectedPage === 'home' ? (
            <>
              <DashboardStats user={user} />
              {renderContent()}
            </>
          ) : (
            <div style={{ background: colors.background }}>
              {selectedPage === 'bulk' && <BulkMessagePage />}
              {selectedPage === 'schedule' && <ScheduleMessage />}
              {selectedPage === 'log' && <MessageLog />}
              {selectedPage === 'users' && user.role === 'admin' && <UserList />}
              {selectedPage === 'templates' && user.role === 'admin' && <TemplateManagement />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarButton({ children, onClick, active, icon, animationDelay }) {
  const [hover, setHover] = React.useState(false);
  
  return (
    <button
      className="animate-slideInLeft"
      style={{
        background: active 
          ? '#25D366' 
          : hover 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'transparent',
        color: active || hover ? '#fff' : '#9CA3AF',
        border: 'none',
        padding: '12px 16px',
        borderRadius: 8,
        fontSize: 13,
        transition: 'all 0.2s ease',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animationDelay: animationDelay || '0s'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

// Icon components for better visuals
const MessageIcon = ({ size = 24, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={color}/>
    <path d="M8 9h8M8 13h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SuccessIcon = ({ size = 24, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={color}/>
    <path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = ({ size = 24, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplateIcon = ({ size = 24, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="10,9 9,9 8,9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = ({ size = 24, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = ({ size = 20, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill={color}/>
  </svg>
);

const ScheduleIcon = ({ size = 20, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2"/>
  </svg>
);

// Simple Chart Component for Analytics
function SimpleChart({ data, title, color = '#25D366' }) {
  const { colors } = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <div style={{
        background: colors.cardBg,
        borderRadius: 12,
        padding: '24px',
        border: `1px solid ${colors.border}`,
        textAlign: 'center'
      }}>
        <h3 style={{ 
          color: colors.text, 
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 700
        }}>
          {title}
        </h3>
        <p style={{ color: colors.textSecondary }}>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: 12,
      padding: '24px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        color: colors.text, 
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📈 {title}
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '8px',
        height: '120px',
        paddingBottom: '20px'
      }}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const date = new Date(item._id.year, item._id.month - 1, item._id.day);
          const dayName = dayNames[date.getDay()];
          
          return (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              gap: '8px'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: `${height}%`,
                minHeight: '4px',
                background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`;
                e.target.style.transform = 'scaleY(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`;
                e.target.style.transform = 'scaleY(1)';
              }}
              title={`${dayName}: ${item.count} messages`}
              >
                {/* Value label */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: colors.text,
                  opacity: height > 20 ? 1 : 0
                }}>
                  {item.count}
                </div>
              </div>
              
              {/* Day label */}
              <div style={{
                fontSize: '11px',
                color: colors.textSecondary,
                fontWeight: 500
              }}>
                {dayName}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: colors.isDark ? '#2A2A2A' : '#F9FAFB',
        borderRadius: 8,
        fontSize: '12px',
        color: colors.textSecondary
      }}>
        Total: {data.reduce((sum, item) => sum + item.count, 0)} messages over {data.length} days
      </div>
    </div>
  );
}

export default Dashboard;
