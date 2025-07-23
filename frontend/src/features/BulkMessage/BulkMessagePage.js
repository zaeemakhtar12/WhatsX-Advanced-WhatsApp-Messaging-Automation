// src/features/BulkMessage/BulkMessagePage.js
import React, { useState, useEffect } from 'react';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';
import { getTemplates } from '../../api';

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: '#00b86b',
      color: '#fff',
      padding: '16px 28px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,184,107,0.15)',
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      if (response.templates) {
        // Filter only active and public templates for users
        const availableTemplates = response.templates.filter(t => t.isActive && t.isPublic);
        setTemplates(availableTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessage(template.content);
    
    // Initialize template variables
    const initialVariables = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        initialVariables[variable.name] = variable.placeholder || '';
      });
    }
    setTemplateVariables(initialVariables);
  };

  const handleVariableChange = (variableName, value) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variableName]: value
    }));

    // Update message with new variable values
    if (selectedTemplate) {
      let updatedMessage = selectedTemplate.content;
      Object.keys(templateVariables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        updatedMessage = updatedMessage.replace(regex, key === variableName ? value : templateVariables[key]);
      });
      setMessage(updatedMessage);
    }
  };

  const handleManualAdd = (newContact) => {
    // Normalize phone numbers for case-insensitive and formatting-insensitive comparison
    const normalize = num => num.replace(/\D/g, '').toLowerCase();
    if (!contacts.some(c => normalize(c.number) === normalize(newContact.number))) {
      setContacts(prev => [...prev, newContact]);
    }
  };

  const handleCSVImport = (importedContacts) => {
    const normalize = num => num.replace(/\D/g, '').toLowerCase();
    const uniqueContacts = importedContacts.filter(
      c => !contacts.some(existing => normalize(existing.number) === normalize(c.number))
    );
    setContacts(prev => [...prev, ...uniqueContacts]);
  };

  const handleSend = async () => {
    if (!message.trim() || contacts.length === 0) {
      setNotification('Please add contacts and enter a message.');
      return;
    }
    
    try {
      const results = [];
      const errors = [];

      // Track template usage if using a template
      if (selectedTemplate && messageMode === 'template') {
        try {
          const response = await fetch("http://localhost:5000/api/templates/" + selectedTemplate._id + "/use", {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ variables: templateVariables }),
          });
          if (!response.ok) {
            console.warn('Failed to track template usage');
          }
        } catch (error) {
          console.warn('Failed to track template usage:', error);
        }
      }

      for (const contact of contacts) {
        try {
          const response = await fetch("http://localhost:5000/api/whatsapp/message", {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: contact.number,
              message,
            }),
          });
          
          const result = await response.json();
          if (response.ok) {
            results.push({ contact: contact.name, number: contact.number, status: 'sent' });
          } else {
            errors.push({ contact: contact.name, number: contact.number, error: result.error || 'Failed to send' });
          }
        } catch (error) {
          errors.push({ contact: contact.name, number: contact.number, error: error.message });
        }
      }

      if (results.length > 0) {
        setNotification(`WhatsApp messages sent! ${results.length} successful, ${errors.length} failed`);
        setContacts([]);
        setMessage('');
        setSelectedTemplate(null);
        setTemplateVariables({});
      } else {
        setNotification('Failed to send WhatsApp messages. Please check your message content and try again.');
      }
    } catch (error) {
      console.error('Error sending WhatsApp messages:', error);
      setNotification('Failed to send WhatsApp messages.');
    }
  };

  const handleModeSwitch = (mode) => {
    setMessageMode(mode);
    if (mode === 'manual') {
      setSelectedTemplate(null);
      setTemplateVariables({});
      setMessage('');
    }
  };

  return (
    <>
      <Notification message={notification} onClose={() => setNotification('')} />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0ffe8 0%, #00ff90 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,255,144,0.10)', padding: '44px 38px', minWidth: 340, maxWidth: 720, width: '100%', border: '2px solid #00ff90' }}>
          <h2 style={{ color: '#00b86b', marginBottom: 24, fontWeight: 800, fontSize: 28, letterSpacing: 1, textAlign: 'center' }}>Bulk WhatsApp Messaging</h2>
          
          <div style={{ marginBottom: 24 }}>
            <ContactEntryForm onAdd={handleManualAdd} />
            <ContactCSVUpload onImport={handleCSVImport} />
          </div>

          {/* Message Mode Selection */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 12, color: '#00b86b', fontWeight: 700 }}>Message Type</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 15 }}>
              <button
                onClick={() => handleModeSwitch('manual')}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #00b86b',
                  borderRadius: '6px',
                  backgroundColor: messageMode === 'manual' ? '#00b86b' : '#fff',
                  color: messageMode === 'manual' ? '#fff' : '#00b86b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ✏️ Custom Message
              </button>
              <button
                onClick={() => handleModeSwitch('template')}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #00b86b',
                  borderRadius: '6px',
                  backgroundColor: messageMode === 'template' ? '#00b86b' : '#fff',
                  color: messageMode === 'template' ? '#fff' : '#00b86b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                📋 Use Template
              </button>
            </div>
          </div>

          {/* Template Selection */}
          {messageMode === 'template' && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 8, color: '#00b86b', fontWeight: 700 }}>Select Template</h4>
              {templates.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', padding: '10px', border: '1px dashed #ddd', borderRadius: '6px' }}>
                  No templates available. Contact your admin to create templates.
                </p>
              ) : (
                <select
                  value={selectedTemplate?._id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t._id === e.target.value);
                    if (template) {
                      handleTemplateSelect(template);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #00ff90',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: '#f6fff8',
                    marginBottom: '10px'
                  }}
                >
                  <option value="">-- Choose a template --</option>
                  {templates.map(template => (
                    <option key={template._id} value={template._id}>
                      {template.title} ({template.category})
                    </option>
                  ))}
                </select>
              )}

              {/* Template Variables */}
              {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div style={{ marginTop: 15, padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#f9f9f9' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Template Variables</h5>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.name} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '4px', fontSize: '13px' }}>
                        {`{{${variable.name}}}`} 
                        {variable.description && <span style={{ fontWeight: 'normal', color: '#666' }}> - {variable.description}</span>}
                      </label>
                      <input
                        type="text"
                        value={templateVariables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={variable.placeholder || `Enter ${variable.name}`}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div style={{ margin: '20px 0' }}>
            <h4 style={{ marginBottom: 8, color: '#00b86b', fontWeight: 700 }}>
              {messageMode === 'template' ? 'Template Preview' : 'Your Message'}
            </h4>
            <textarea
              rows="5"
              value={message}
              onChange={e => messageMode === 'manual' ? setMessage(e.target.value) : null}
              readOnly={messageMode === 'template'}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #00ff90', 
                fontSize: '16px', 
                marginBottom: '12px', 
                resize: 'vertical', 
                background: messageMode === 'template' ? '#f5f5f5' : '#f6fff8',
                fontFamily: 'inherit',
                cursor: messageMode === 'template' ? 'default' : 'text'
              }}
              placeholder={messageMode === 'manual' ? "Enter your message here... This will be sent to all contacts via WhatsApp." : "Select a template to see the preview here..."}
            />
            <small style={{ color: '#666', fontSize: '14px' }}>
              💡 Tip: {messageMode === 'template' ? 'Fill in the template variables above to customize your message.' : 'Make sure your message is clear and professional. It will be sent to all contacts in your list.'}
            </small>
          </div>

          {/* Send Button */}
          <button 
            onClick={handleSend} 
            disabled={contacts.length === 0 || !message.trim()}
            style={{ 
              display: 'block', 
              margin: '20px auto 0', 
              backgroundColor: (contacts.length === 0 || !message.trim()) ? '#ccc' : '#00b86b', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '14px 32px', 
              fontWeight: 700, 
              cursor: (contacts.length === 0 || !message.trim()) ? 'not-allowed' : 'pointer', 
              fontSize: '18px', 
              boxShadow: '0 2px 8px rgba(0,255,144,0.15)', 
              transition: 'all 0.2s',
              width: '200px'
            }}
          >
            Send to WhatsApp
          </button>

          {/* Contacts Preview */}
          <div style={{ marginTop: 24 }}>
            <h4 style={{ color: '#00b86b', fontWeight: 700 }}>Contacts ({contacts.length})</h4>
            {contacts.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No contacts added yet. Add contacts manually or upload a CSV file.</p>
            ) : (
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                border: '1px solid #e0e0e0', 
                borderRadius: '6px', 
                padding: '10px',
                background: '#f9f9f9'
              }}>
                {contacts.map((c, idx) => (
                  <div key={idx} style={{ 
                    fontSize: '14px', 
                    marginBottom: '6px', 
                    color: '#333',
                    padding: '4px 8px',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e8e8e8'
                  }}>
                    <strong>{c.name}</strong> - {c.number}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BulkMessagePage;
