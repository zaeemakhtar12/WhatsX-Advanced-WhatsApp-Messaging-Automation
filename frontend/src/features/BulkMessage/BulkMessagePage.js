// src/features/BulkMessage/BulkMessagePage.js
import React, { useState, useEffect } from 'react';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';
import { getTemplates, sendBulkMessage } from '../../api';

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: '#25D366',
      color: '#fff',
      padding: '16px 28px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(37, 211, 102, 0.3)',
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 16,
      minWidth: 180,
      textAlign: 'center'
    }}>
      {message}
      <button onClick={onClose} style={{
        marginLeft: 18,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: 18,
        cursor: 'pointer'
      }}>×</button>
    </div>
  );
}

function BulkMessagePage() {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [messageMode, setMessageMode] = useState('manual'); // 'manual' or 'template'

  const token = localStorage.getItem('token');

  const showNotification = (message) => {
    setNotification(message);
  };

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      if (response && response.templates) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    if (template) {
      // Copy template content to message state so it's editable
      setMessage(template.content);
      
      // Extract variables from template content
      const variables = {};
      const matches = template.content.match(/\{\{(\w+)\}\}/g);
      if (matches) {
        matches.forEach(match => {
          const varName = match.replace(/[{}]/g, '');
          variables[varName] = '';
        });
      }
      setTemplateVariables(variables);
    } else {
      setMessage('');
      setTemplateVariables({});
    }
  };

  const handleVariableChange = (varName, value) => {
    setTemplateVariables(prev => ({
      ...prev,
      [varName]: value
    }));
    
    // Update the message with the new variable value
    if (selectedTemplate) {
      let updatedMessage = selectedTemplate.content;
      const currentVariables = { ...templateVariables, [varName]: value };
      
      Object.entries(currentVariables).forEach(([key, val]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        updatedMessage = updatedMessage.replace(regex, val || `{{${key}}}`);
      });
      
      setMessage(updatedMessage);
    }
  };

  const getPreviewMessage = () => {
    // Since message is now editable, just return the current message state
    return message;
  };

  const handleSendMessages = async () => {
    if (contacts.length === 0) {
      showNotification('Please add contacts first');
      return;
    }

    if (!message.trim() && messageMode === 'manual') {
      showNotification('Please enter a message');
      return;
    }

    if (messageMode === 'template' && !selectedTemplate) {
      showNotification('Please select a template');
      return;
    }

    try {
      const messageToSend = messageMode === 'template' ? getPreviewMessage() : message;
      const templateId = messageMode === 'template' ? selectedTemplate._id : null;

      const response = await sendBulkMessage(contacts, messageToSend, templateId);

      if (response && response.totalSent !== undefined) {
        showNotification(`Messages sent! ${response.totalSent} successful, ${response.totalErrors} failed`);
        
        // Clear form after successful send
        setContacts([]);
        setMessage('');
        setSelectedTemplate(null);
        setTemplateVariables({});
        setMessageMode('manual');
      } else {
        showNotification('Failed to send messages. Please try again.');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      showNotification('Failed to send messages.');
    }
  };

  return (
    <div style={{ padding: '24px 24px 24px 48px', fontFamily: 'Arial, sans-serif', background: '#F0F2F5' }}>
      <Notification message={notification} onClose={() => setNotification('')} />
      
      <h2 style={{ color: '#1F2937', marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Bulk Messaging</h2>

      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: '2px solid #E4E6EA' }}>
        <div style={{ padding: 32 }}>
          {/* Message Mode Selection */}
          <div style={{ marginBottom: 32, padding: 24, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA' }}>
            <h3 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Message Type</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => {
                  setMessageMode('manual');
                  setSelectedTemplate(null);
                  setTemplateVariables({});
                }}
                style={{
                  padding: '12px 24px',
                  border: messageMode === 'manual' ? '2px solid #25D366' : '2px solid #E4E6EA',
                  background: messageMode === 'manual' ? '#25D366' : '#fff',
                  color: messageMode === 'manual' ? '#fff' : '#1F2937',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Manual Message
              </button>
              <button
                onClick={() => setMessageMode('template')}
                style={{
                  padding: '12px 24px',
                  border: messageMode === 'template' ? '2px solid #25D366' : '2px solid #E4E6EA',
                  background: messageMode === 'template' ? '#25D366' : '#fff',
                  color: messageMode === 'template' ? '#fff' : '#1F2937',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Use Template
              </button>
            </div>
          </div>

          {/* Template Selection */}
          {messageMode === 'template' && (
            <div style={{ marginBottom: 32, padding: 24, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA' }}>
              <h3 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Select Template</h3>
              <select
                value={selectedTemplate?._id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t._id === e.target.value);
                  handleTemplateSelect(template);
                }}
                style={{ width: '100%', padding: 12, border: '2px solid #E4E6EA', borderRadius: 8, fontSize: 14 }}
              >
                <option value="">Choose a template...</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name} - {template.category}
                  </option>
                ))}
              </select>

              {/* Template Variables */}
              {selectedTemplate && Object.keys(templateVariables).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ color: '#1F2937', marginBottom: 12, fontWeight: 600 }}>Template Variables:</h4>
                  {Object.entries(templateVariables).map(([varName, value]) => (
                    <div key={varName} style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#374151' }}>
                        {varName}:
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        placeholder={`Enter ${varName}`}
                        style={{ width: '100%', padding: 10, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div style={{ marginBottom: 32, padding: 24, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA' }}>
            <h3 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Message Content</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: 16,
                border: '2px solid #E4E6EA',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                background: '#fff'
              }}
              placeholder={messageMode === 'manual' ? "Enter your message here... This will be sent to all contacts." : "Select a template and customize the message content..."}
            />
          </div>

          {/* Contact Management */}
          <div style={{ marginBottom: 32 }}>
            <ContactEntryForm onAdd={(contact) => {
              // Check for duplicates
              const isDuplicate = contacts.some(existingContact => existingContact.number === contact.number);
              if (isDuplicate) {
                showNotification('This contact already exists');
                return;
              }
              setContacts(prev => [...prev, contact]);
              showNotification('Contact added successfully');
            }} />
            <ContactCSVUpload contacts={contacts} setContacts={setContacts} />
          </div>

          {/* Contact List */}
          {contacts.length > 0 && (
            <div style={{ marginBottom: 32, padding: 24, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA' }}>
              <h3 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Contact List ({contacts.length})</h3>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {contacts.map((contact, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px', 
                    background: '#fff', 
                    borderRadius: 6, 
                    marginBottom: 8,
                    border: '1px solid #E4E6EA'
                  }}>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>{contact.name}</span>
                    <span style={{ color: '#6B7280', fontSize: 14 }}>{contact.number || contact.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSendMessages}
              disabled={contacts.length === 0 || (!message.trim() && messageMode === 'manual') || (messageMode === 'template' && !selectedTemplate)}
              style={{
                padding: '16px 32px',
                background: contacts.length === 0 || (!message.trim() && messageMode === 'manual') || (messageMode === 'template' && !selectedTemplate) 
                  ? '#D1D5DB' : '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: contacts.length === 0 || (!message.trim() && messageMode === 'manual') || (messageMode === 'template' && !selectedTemplate) 
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
            >
              Send Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkMessagePage;
