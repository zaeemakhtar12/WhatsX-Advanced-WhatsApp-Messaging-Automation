import apiClient from './utils/apiClient';

// User APIs
export const register = async (userData) => {
  return apiClient.post('/register', userData);
};

export const login = async (userData) => {
  return apiClient.post('/login', userData);
};

// User Management APIs (Admin only)
export const getUsers = async () => {
  return apiClient.get('/users');
};

export const updateUserRole = async (userId, role) => {
  return apiClient.patch(`/users/${userId}/role`, { role });
};

export const deleteUser = async (userId) => {
  return apiClient.delete(`/users/${userId}`);
};

// Message APIs
export const sendMessage = async (messageData) => {
  return apiClient.post('/send', messageData);
};

export const sendBulkMessage = async (contacts, message, templateId = null) => {
  return apiClient.post('/bulk', { contacts, message, templateId });
};

export const getMessages = async (page = 1, limit = 10, statusFilter = 'all', typeFilter = 'all', sortBy = 'createdAt', sortOrder = 'desc') => {
  const params = new URLSearchParams({ 
    page, 
    limit, 
    statusFilter, 
    typeFilter, 
    sortBy, 
    sortOrder 
  });
  return apiClient.get(`/messages?${params}`);
};

export const getMessageStats = async () => {
  return apiClient.get('/messages/stats');
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
  // Support both routes; prefer the new one
  try {
    return await apiClient.get('/templates/stats');
  } catch (e) {
    return apiClient.get('/templates-stats');
  }
};

// Dashboard Statistics APIs
export const getDashboardStats = async () => {
  return apiClient.get('/dashboard/stats');
};

export const getUserStats = async () => {
  return apiClient.get('/users/stats');
};

// Removed duplicate getTemplateStatsAPI in favor of getTemplateStats

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
