// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, deleteUser } from '../api';
import { useNotification } from './NotificationSystem';

// Icons using Tailwind classes
const UserIcon = ({ className = "w-5 h-5 text-blue-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AdminIcon = ({ className = "w-5 h-5 text-purple-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ className = "w-4 h-4 text-blue-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4 text-red-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5 text-gray-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5 text-gray-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6 text-gray-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Removed local Notification component in favor of global NotificationProvider

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Notifications handled globally via provider

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response || []);
    } catch (error) {
      showError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      await updateUserRole(editingUser._id, editingUser.role);
      showSuccess('User role updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      showError('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        showSuccess('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        showError('Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (role) {
      case 'admin':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}>
            <AdminIcon className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'user':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
            <UserIcon className="w-3 h-3 mr-1" />
            User
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>
            Unknown
          </span>
        );
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <AdminIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <UserIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Regular Users</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {users.filter(u => u.role === 'user').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>
    </div>
  );

  const renderUserCards = () => {
    if (loading) {
      return (
        <div className="card p-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-whatsapp-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="card p-12 text-center">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || roleFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Users will appear here once they register.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  {user.role === 'admin' ? (
                    <AdminIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                    {user.name || 'Unknown User'}
                  </h3>
                  {getRoleBadge(user.role)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                  title="Edit user"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  title="Delete user"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white break-all text-sm">{user.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingUser(null);
      }}
      title="Edit User Role"
    >
      {editingUser && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Email</p>
            <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {editingUser.email}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleUpdateRole}
              className="btn-primary flex-1"
            >
              Update Role
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="p-6 pl-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserIcon className="w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* User Cards */}
      {renderUserCards()}

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
}

export default UserList;
