// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUserRole } from '../api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });
  const [notification, setNotification] = useState('');

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message) => {
    setNotification(message);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        showNotification('Error loading users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        showNotification('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user');
      }
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
      // Only update the role since we don't have updateUser function
      await updateUserRole(editingUser, editForm.role);
      showNotification('User role updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user');
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
      showNotification('Error updating role');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '24px 24px 24px 48px', 
        maxWidth: 1200, 
        margin: '0 auto', 
        background: '#F0F2F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #E4E6EA',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 18, color: '#6B7280' }}>Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px 24px 24px 48px', 
      maxWidth: 1200, 
      margin: '0 auto', 
      background: '#F0F2F5'
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: notification.includes('Error') ? '#DC2626' : '#25D366',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: notification.includes('Error') 
            ? '0 2px 10px rgba(220, 38, 38, 0.3)' 
            : '0 2px 10px rgba(37, 211, 102, 0.3)',
          zIndex: 1000
        }}>
          {notification}
          <button 
            onClick={() => setNotification('')}
            style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <h2 style={{ color: '#1F2937', marginBottom: 24, fontSize: 28, fontWeight: 700 }}>
        User Management
      </h2>
      
      {users.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          padding: 60, 
          borderRadius: 12, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '2px solid #E4E6EA',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#25D366' }}>👥</div>
          <h3 style={{ color: '#1F2937', marginBottom: 8 }}>No Users Found</h3>
          <p style={{ color: '#6B7280', margin: 0 }}>No users are currently registered in the system.</p>
        </div>
      ) : (
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '2px solid #E4E6EA'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={rowStyle}>
                    <td style={tdStyle}>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          style={inputStyle}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>{user.username}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          style={inputStyle}
                        />
                      ) : (
                        <span style={{ color: '#374151' }}>{user.email}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={selectStyle}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span style={{
                          ...roleStyle,
                          backgroundColor: user.role === 'admin' ? '#DC2626' : '#25D366'
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: '#6B7280', fontSize: 14 }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {editingUser === user._id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleSaveEdit} style={saveButtonStyle}>
                            Save
                          </button>
                          <button onClick={handleCancelEdit} style={cancelButtonStyle}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleEdit(user)} 
                            style={editButtonStyle}
                          >
                            Edit
                          </button>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            style={roleSelectStyle}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(user._id)} 
                            style={deleteButtonStyle}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated Styles with WhatsApp Theme
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff'
};

const headerRowStyle = {
  backgroundColor: '#F7F8FA'
};

const rowStyle = {
  borderBottom: '1px solid #E4E6EA'
};

const thStyle = {
  padding: '16px 20px',
  textAlign: 'left',
  fontWeight: 700,
  color: '#374151',
  borderBottom: '2px solid #E4E6EA',
  fontSize: 14
};

const tdStyle = {
  padding: '16px 20px',
  color: '#6B7280',
  fontSize: 14
};

const inputStyle = {
  padding: '8px 12px',
  border: '2px solid #E4E6EA',
  borderRadius: 6,
  width: '100%',
  fontSize: 14,
  fontFamily: 'inherit'
};

const selectStyle = {
  padding: '8px 12px',
  border: '2px solid #E4E6EA',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit'
};

const roleSelectStyle = {
  padding: '6px 10px',
  border: '2px solid #E4E6EA',
  borderRadius: 6,
  fontSize: 12,
  backgroundColor: '#fff',
  fontFamily: 'inherit'
};

const roleStyle = {
  padding: '4px 12px',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
  fontWeight: 600
};

const editButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#25D366',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600
};

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#DC2626',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600
};

const saveButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#25D366',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600
};

const cancelButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#6B7280',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600
};

export default UserList;
