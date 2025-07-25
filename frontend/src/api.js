import apiClient from './utils/apiClient';

const API_URL = 'http://localhost:5000/api';

// User APIs
export const register = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const login = async (userData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  return data;
};

// User Management APIs (Admin only)
export const getUsers = async () => {
  return apiClient.get('/users');
};

export const updateUserRole = async (userId, role) => {
  return apiClient.put(`/users/${userId}/role`, { role });
};

export const deleteUser = async (userId) => {
  return apiClient.delete(`/users/${userId}`);
};

// Message APIs
export const sendMessage = async (messageData) => {
  const res = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(messageData),
  });
  return res.json();
};

export const sendBulkMessage = async (contacts, message, templateId = null) => {
  return apiClient.post('/bulk', { contacts, message, templateId });
};

export const getMessages = async (page = 1, limit = 10, search = '', messageType = '') => {
  const params = new URLSearchParams({ page, limit, search, messageType });
  return apiClient.get(`/messages?${params}`);
};

export const getMessageStats = async () => {
  const res = await fetch(`${API_URL}/messages/stats`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  return res.json();
};

export const deleteMessage = async (messageId) => {
  return apiClient.delete(`/messages/${messageId}`);
};

// Scheduled Message APIs
export const createScheduledMessage = async (messageData) => {
  return apiClient.post('/scheduled-messages', messageData);
};

export const getScheduledMessages = async () => {
  return apiClient.get('/scheduled-messages');
};

export const updateScheduledMessage = async (id, updates) => {
  return apiClient.put(`/scheduled-messages/${id}`, updates);
};

export const deleteScheduledMessage = async (id) => {
  return apiClient.delete(`/scheduled-messages/${id}`);
};

// Template APIs
export const getTemplates = async () => {
  return apiClient.get('/templates');
};

export const createTemplate = async (templateData) => {
  return apiClient.post('/templates', templateData);
};

export const updateTemplate = async (id, updates) => {
  return apiClient.put(`/templates/${id}`, updates);
};

export const deleteTemplate = async (id) => {
  return apiClient.delete(`/templates/${id}`);
};

export const getTemplateStats = async () => {
  return apiClient.get('/templates/stats');
};

// Dashboard Statistics APIs
export const getDashboardStats = async () => {
  return apiClient.get('/dashboard/stats');
};

export const getUserStats = async () => {
  return apiClient.get('/users/stats');
};

export const getTemplateStatsAPI = async () => {
  return apiClient.get('/templates-stats');
};

// User Profile APIs
export const getProfile = async () => {
  return apiClient.get('/profile');
};

export const updateProfile = async (updates) => {
  return apiClient.patch('/profile', updates);
};

export const changePassword = async (oldPassword, newPassword) => {
  return apiClient.patch('/profile/password', { oldPassword, newPassword });
};
