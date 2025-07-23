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
  return res.json();
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
  const res = await fetch(`${API_URL}/bulk`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ contacts, message, templateId }),
  });
  return res.json();
};

export const getMessages = async (page = 1, limit = 10, search = '', messageType = '') => {
  const params = new URLSearchParams({ page, limit, search, messageType });
  const res = await fetch(`${API_URL}/messages?${params}`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  return res.json();
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
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  return res.json();
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
