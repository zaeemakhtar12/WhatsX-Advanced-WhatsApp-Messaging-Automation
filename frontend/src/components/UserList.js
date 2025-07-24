// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUserRole } from '../api';

// Icons
const UsersIcon = ({ size = 20, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ size = 16, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = ({ size = 16, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CancelIcon = ({ size = 16, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = ({ size = 16, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = ({ size = 16, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div className="animate-slideIn" style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: type === 'success' ? '#25D366' : type === 'error' ? '#DC2626' : '#3B82F6',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: 12,
      boxShadow: `0 4px 20px ${type === 'success' ? 'rgba(37, 211, 102, 0.3)' : type === 'error' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 14,
      minWidth: 200,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {type === 'success' && '✅'}
      {type === 'error' && '❌'}
      {type === 'info' && 'ℹ️'}
      {message}
      <button onClick={onClose} style={{
        marginLeft: 8,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        opacity: 0.8
      }}>×</button>
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const filterUsers = () => {
    let filtered = users;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response && response.users) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.error('Invalid response format:', response);
        showNotification('Error loading users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      showNotification('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateUserRole(editingUser, editForm.role);
      showNotification('User role updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ username: '', email: '', role: '' });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      showNotification('Role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Error updating role', 'error');
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: '#FEE2E2', color: '#DC2626', icon: ShieldIcon },
      user: { bg: '#DCFCE7', color: '#16A34A', icon: UserIcon }
    };
    
    const style = styles[role] || styles.user;
    const IconComponent = style.icon;
    
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <IconComponent size={12} color={style.color} />
        {role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const roleStats = getRoleStats();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EDE9FE 0%, #C7D2FE 100%)',
      padding: isMobile ? '16px' : '24px'
    }}>
      <Notification 
        message={notification} 
        type={notificationType}
        onClose={() => setNotification('')} 
      />

      {/* Header */}
      <div className="animate-slideIn" style={{
        background: '#fff',
        borderRadius: 16,
        padding: isMobile ? '20px' : '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            padding: '12px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UsersIcon size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 700,
              color: '#1F2937',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              User Management
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6B7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            border: '1px solid #93C5FD',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#1E40AF',
              marginBottom: '4px'
            }}>
              {users.length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#1E40AF',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Total Users
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #FCD34D',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#92400E',
              marginBottom: '4px'
            }}>
              {roleStats.admin || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#92400E',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Admins
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
            border: '1px solid #86EFAC',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#166534',
              marginBottom: '4px'
            }}>
              {roleStats.user || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#166534',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Users
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                border: '2px solid #E5E7EB',
                borderRadius: 12,
                fontSize: '14px',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <SearchIcon />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #E5E7EB',
              borderRadius: 12,
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>

        {/* Users Table/Cards */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <UsersIcon size={48} color="#D1D5DB" />
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', fontWeight: 500 }}>
              {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                style={{
                  background: '#3B82F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredUsers.map(user => (
              <div
                key={user._id}
                className="hover-lift"
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {getInitials(user.username)}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingUser === user._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #E5E7EB',
                            borderRadius: 6,
                            fontSize: '13px'
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={handleSaveEdit}
                            style={{
                              background: '#10B981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <SaveIcon size={12} />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: '#6B7280',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CancelIcon size={12} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#1F2937',
                          marginBottom: '4px'
                        }}>
                          {user.username}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6B7280',
                          marginBottom: '8px'
                        }}>
                          {user.email}
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          {getRoleBadge(user.role)}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 4
                              }}
                              title="Edit Role"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 4
                              }}
                              title="Delete User"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid #F3F4F6',
                  fontSize: '12px',
                  color: '#9CA3AF'
                }}>
                  Joined: {formatDate(user.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 2fr 2fr 1fr 120px 100px',
              gap: '16px',
              padding: '16px 20px',
              background: '#F9FAFB',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div></div>
              <div>User</div>
              <div>Email</div>
              <div>Role</div>
              <div>Joined</div>
              <div style={{ textAlign: 'center' }}>Actions</div>
            </div>

            {/* Table Body */}
            {filteredUsers.map((user, index) => (
              <div
                key={user._id}
                className="hover-lift"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 2fr 2fr 1fr 120px 100px',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < filteredUsers.length - 1 ? '1px solid #F3F4F6' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700
                }}>
                  {getInitials(user.username)}
                </div>

                {/* Username */}
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1F2937'
                  }}>
                    {user.username}
                  </div>
                </div>

                {/* Email */}
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  {user.email}
                </div>

                {/* Role */}
                <div>
                  {editingUser === user._id ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        fontSize: '13px',
                        background: '#fff'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </div>

                {/* Joined Date */}
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280'
                }}>
                  {formatDate(user.createdAt)}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  {editingUser === user._id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 4
                        }}
                        title="Save Changes"
                      >
                        <SaveIcon />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 4
                        }}
                        title="Cancel"
                      >
                        <CancelIcon />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 4
                        }}
                        title="Edit Role"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 4
                        }}
                        title="Delete User"
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;
