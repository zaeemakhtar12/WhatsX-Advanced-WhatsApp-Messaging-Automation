const API_URL = "http://localhost:5000/api";

// const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password, role) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }), // send role
  });
  return res.json();
};


export const register = async (data) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Admin User Management APIs
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const getUserById = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const updateUser = async (id, userData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const updateUserRole = async (id, role) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role }),
  });
  return res.json();
};

// WhatsApp Template Messaging APIs
export const sendWhatsAppTemplate = async (recipient, templateName, templateVariables) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/whatsapp/template`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ recipient, templateName, templateVariables }),
  });
  return res.json();
};

export const sendBulkWhatsAppTemplate = async (contacts, templateName, templateVariables) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/whatsapp/bulk-template`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ contacts, templateName, templateVariables }),
  });
  return res.json();
};

export const sendWhatsAppMessage = async (recipient, message) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/whatsapp/message`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ recipient, message }),
  });
  return res.json();
};

// Template Management APIs
export const getTemplates = async (category = '', search = '', page = 1, limit = 20) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams();
  if (category) queryParams.append('category', category);
  if (search) queryParams.append('search', search);
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  
  const res = await fetch(`${API_URL}/templates?${queryParams}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const getTemplate = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const createTemplate = async (templateData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(templateData),
  });
  return res.json();
};

export const updateTemplate = async (id, templateData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(templateData),
  });
  return res.json();
};

export const deleteTemplate = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const useTemplate = async (id, variables) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates/${id}/use`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ variables }),
  });
  return res.json();
};

export const getTemplateCategories = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates/categories`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const getTemplateStats = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/templates-stats`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

// Scheduled Messages API
export const createScheduledMessage = async (scheduledMessageData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/scheduled-messages`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(scheduledMessageData),
  });
  return res.json();
};

export const getScheduledMessages = async (status = '', page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams();
  if (status) queryParams.append('status', status);
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  
  const res = await fetch(`${API_URL}/scheduled-messages?${queryParams}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const getScheduledMessage = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/scheduled-messages/${id}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const updateScheduledMessage = async (id, updateData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/scheduled-messages/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData),
  });
  return res.json();
};

export const deleteScheduledMessage = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/scheduled-messages/${id}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};

export const executeScheduledMessages = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/scheduled-messages/execute`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
};
