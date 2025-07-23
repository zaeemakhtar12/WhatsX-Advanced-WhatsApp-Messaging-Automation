// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUser, updateUserRole } from '../api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.error('Invalid response format:', response);
        alert('Error loading users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      if (response.message) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        alert(response.message || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
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

  const handleSave = async () => {
    try {
      const response = await updateUser(editingUser, editForm);
      if (response.message) {
        alert('User updated successfully');
        setEditingUser(null);
        fetchUsers(); // Refresh the list
      } else {
        alert(response.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({ username: '', email: '', role: '' });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.message) {
        alert('User role updated successfully');
        fetchUsers(); // Refresh the list
      } else {
        alert(response.message || 'Error updating role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#222', marginBottom: '20px' }}>User Management</h2>
      
      {users.length === 0 ? (
        <p style={{ color: '#666' }}>No users found.</p>
      ) : (
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
                      user.username
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
                      user.email
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
                        backgroundColor: user.role === 'admin' ? '#f44336' : '#4CAF50'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    {editingUser === user._id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={handleSave} style={saveButtonStyle}>
                          Save
                        </button>
                        <button onClick={handleCancel} style={cancelButtonStyle}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
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
                          onClick={() => handleDelete(user._id, user.username)} 
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
      )}
    </div>
  );
}

// Styles
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const headerRowStyle = {
  backgroundColor: '#f5f5f5'
};

const rowStyle = {
  borderBottom: '1px solid #eee'
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#333',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '12px',
  color: '#555'
};

const inputStyle = {
  padding: '6px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  width: '100%',
  fontSize: '14px'
};

const selectStyle = {
  padding: '6px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
};

const roleSelectStyle = {
  padding: '4px 6px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '12px',
  backgroundColor: '#fff'
};

const roleStyle = {
  padding: '4px 8px',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 'bold'
};

const editButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const deleteButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const saveButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const cancelButtonStyle = {
  padding: '4px 8px',
  backgroundColor: '#666',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

export default UserList;
