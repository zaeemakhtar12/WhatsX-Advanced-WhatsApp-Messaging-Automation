// src/features/BulkMessage/BulkMessagePage.js
import React, { useState, useEffect } from 'react';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';
import { getTemplates, sendBulkMessage } from '../../api';

// Icons
const SendIcon = ({ size = 20, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill={color}/>
  </svg>
);

const ContactIcon = ({ size = 20, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplateIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MessageIcon = ({ size = 20, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={color}/>
    <path d="M8 9h8M8 13h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = ({ size = 20, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7,10 12,5 17,10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="5" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function BulkMessagePage() {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [messageMode, setMessageMode] = useState('manual'); // 'manual' or 'template'
  const [activeTab, setActiveTab] = useState('compose'); // 'compose', 'contacts', 'templates'
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
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
      
      // Backend returns templates directly as an array
      if (Array.isArray(response)) {
        setTemplates(response);
      } else if (response && response.templates) {
        // Fallback for different response format
        setTemplates(response.templates);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showNotification('Error loading templates', 'error');
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    if (template) {
      setMessage(template.content);
      setMessageMode('template');
      
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
      showNotification(`Template "${template.name}" selected`, 'info');
    } else {
      setMessage('');
      setTemplateVariables({});
      setMessageMode('manual');
    }
  };

  const handleAddContact = () => {
    if (!contactName.trim() || !contactNumber.trim()) {
      showNotification('Please enter both name and phone number', 'error');
      return;
    }

    const newContact = {
      name: contactName.trim(),
      number: contactNumber.trim().replace(/\D/g, '') // Remove non-digits
    };

    // Validate phone number (basic validation)
    if (newContact.number.length < 10) {
      showNotification('Please enter a valid phone number', 'error');
      return;
    }

    // Check for duplicates
    const isDuplicate = contacts.some(contact => contact.number === newContact.number);
    if (isDuplicate) {
      showNotification('This contact already exists', 'error');
      return;
    }

    setContacts(prev => [...prev, newContact]);
    setContactName('');
    setContactNumber('');
    showNotification('Contact added successfully');
  };

  const handleRemoveContact = (index) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
    showNotification('Contact removed');
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const newContacts = [];

        lines.forEach((line, index) => {
          if (index === 0) return; // Skip header
          const [name, number] = line.split(',').map(item => item.trim());
          
          if (name && number) {
            const cleanNumber = number.replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
              newContacts.push({ name, number: cleanNumber });
            }
          }
        });

        if (newContacts.length > 0) {
          setContacts(prev => [...prev, ...newContacts]);
          showNotification(`${newContacts.length} contacts imported successfully`);
        } else {
          showNotification('No valid contacts found in CSV', 'error');
        }
      } catch (error) {
        console.error('CSV parsing error:', error);
        showNotification('Error parsing CSV file', 'error');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const handleSendBulkMessage = async () => {
    if (!message.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }

    if (contacts.length === 0) {
      showNotification('Please add at least one contact', 'error');
      return;
    }

    setLoading(true);
    try {
      const messageContent = processMessageWithVariables(message, templateVariables);
      const response = await sendBulkMessage(contacts, messageContent, selectedTemplate?._id);
      
      // Check if the response indicates success (status 200 with message field)
      if (response.message && response.message.includes('completed')) {
        const successMessage = response.totalErrors > 0 
          ? `Message sent to ${response.totalSent} contacts. ${response.totalErrors} failed.`
          : `Message sent to ${response.totalSent} contacts successfully!`;
        
        showNotification(successMessage, 'success');
        
        // Reset form
        setMessage('');
        setContacts([]);
        setSelectedTemplate(null);
        setTemplateVariables({});
        setActiveTab('compose');
      } else {
        showNotification(response.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      showNotification(error.message || 'Error sending message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processMessageWithVariables = (messageContent, variables) => {
    let processedMessage = messageContent;
    Object.keys(variables).forEach(varName => {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
      processedMessage = processedMessage.replace(regex, variables[varName] || `{{${varName}}}`);
    });
    return processedMessage;
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className="btn-ripple"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '12px 16px' : '12px 20px',
        background: isActive ? '#25D366' : 'transparent',
        color: isActive ? '#fff' : '#6B7280',
        border: 'none',
        borderBottom: isActive ? 'none' : '2px solid transparent',
        borderRadius: isMobile ? '8px' : '8px 8px 0 0',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: isMobile ? 'auto' : '140px',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = '#F3F4F6';
          e.target.style.color = '#374151';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
          e.target.style.color = '#6B7280';
        }
      }}
    >
      {icon}
      {!isMobile && label}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            padding: '12px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SendIcon size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 700,
              color: '#1F2937',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Bulk Messaging
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6B7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Send personalized messages to multiple contacts at once
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '0',
          borderBottom: isMobile ? 'none' : '2px solid #E5E7EB',
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          <TabButton
            id="compose"
            label="Compose"
            icon={<MessageIcon size={18} color={activeTab === 'compose' ? '#fff' : '#6B7280'} />}
            isActive={activeTab === 'compose'}
            onClick={() => setActiveTab('compose')}
          />
          <TabButton
            id="contacts"
            label="Contacts"
            icon={<ContactIcon size={18} color={activeTab === 'contacts' ? '#fff' : '#6B7280'} />}
            isActive={activeTab === 'contacts'}
            onClick={() => setActiveTab('contacts')}
          />
          <TabButton
            id="templates"
            label="Templates"
            icon={<TemplateIcon size={18} color={activeTab === 'templates' ? '#fff' : '#6B7280'} />}
            isActive={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              gap: '24px'
            }}>
              {/* Message Composer */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '16px',
                    border: '2px solid #E5E7EB',
                    borderRadius: 12,
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#25D366'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
                
                {/* Template Variables */}
                {Object.keys(templateVariables).length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '12px'
                    }}>
                      Template Variables
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {Object.keys(templateVariables).map(varName => (
                        <div key={varName}>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#6B7280',
                            marginBottom: '4px'
                          }}>
                            {varName}
                          </label>
                          <input
                            type="text"
                            value={templateVariables[varName]}
                            onChange={(e) => setTemplateVariables(prev => ({
                              ...prev,
                              [varName]: e.target.value
                            }))}
                            placeholder={`Enter ${varName}`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #E5E7EB',
                              borderRadius: 6,
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Send Panel */}
              <div>
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    📊 Summary
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#6B7280', fontSize: '14px' }}>Contacts:</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{contacts.length}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#6B7280', fontSize: '14px' }}>Message length:</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{message.length} chars</span>
                    </div>
                    {selectedTemplate && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#6B7280', fontSize: '14px' }}>Template:</span>
                        <span style={{ fontWeight: 600, color: '#8B5CF6', fontSize: '13px' }}>
                          {selectedTemplate.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSendBulkMessage}
                    disabled={loading || !message.trim() || contacts.length === 0}
                    className="btn-ripple hover-lift"
                    style={{
                      width: '100%',
                      background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #25D366, #128C7E)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '14px 24px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #fff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendIcon size={16} color="#fff" />
                        Send to {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: '24px'
            }}>
              {/* Add Contacts */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ContactIcon />
                  Add Contacts
                </h3>

                {/* Manual Entry */}
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Manual Entry
                  </h4>
                  
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      marginBottom: '12px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Phone number"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <button
                    onClick={handleAddContact}
                    className="btn-ripple"
                    style={{
                      width: '100%',
                      background: '#3B82F6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    Add Contact
                  </button>
                </div>

                {/* CSV Upload */}
                <div style={{
                  background: '#FFF7ED',
                  border: '1px solid #FDBA74',
                  borderRadius: 12,
                  padding: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <UploadIcon size={16} />
                    CSV Upload
                  </h4>
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #FDBA74',
                      borderRadius: 8,
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                  
                  <p style={{
                    margin: '12px 0 0 0',
                    fontSize: '12px',
                    color: '#9A3412'
                  }}>
                    CSV format: name, phone_number
                  </p>
                </div>
              </div>

              {/* Contacts List */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Contacts ({contacts.length})
                  </h3>
                  
                  {contacts.length > 0 && (
                    <button
                      onClick={() => setContacts([])}
                      style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {contacts.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#9CA3AF'
                    }}>
                      <ContactIcon size={48} color="#E5E7EB" />
                      <p style={{ margin: '16px 0 0 0', fontSize: '14px' }}>
                        No contacts added yet
                      </p>
                    </div>
                  ) : (
                    contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="hover-lift"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom: index < contacts.length - 1 ? '1px solid #F3F4F6' : 'none',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#374151'
                          }}>
                            {contact.name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6B7280'
                          }}>
                            {contact.number}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveContact(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#FEE2E2'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TemplateIcon />
                Message Templates
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {/* No Template Option */}
                <div
                  className="hover-lift"
                  style={{
                    background: selectedTemplate === null ? '#E0F2FE' : '#fff',
                    border: selectedTemplate === null ? '2px solid #0EA5E9' : '2px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTemplateSelect(null)}
                >
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: selectedTemplate === null ? '#0369A1' : '#374151'
                  }}>
                    📝 Manual Message
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: selectedTemplate === null ? '#075985' : '#6B7280'
                  }}>
                    Write your own custom message without using a template
                  </p>
                </div>

                {/* Template Cards */}
                {templates.map(template => (
                  <div
                    key={template._id}
                    className="hover-lift"
                    style={{
                      background: selectedTemplate?._id === template._id ? '#F0FDF4' : '#fff',
                      border: selectedTemplate?._id === template._id ? '2px solid #25D366' : '2px solid #E5E7EB',
                      borderRadius: 12,
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 600,
                        color: selectedTemplate?._id === template._id ? '#166534' : '#374151'
                      }}>
                        {template.name}
                      </h4>
                      
                      <span style={{
                        background: template.category === 'Marketing' ? '#FEF3C7' :
                                   template.category === 'Support' ? '#DBEAFE' :
                                   template.category === 'Promotional' ? '#FCE7F3' : '#F3F4F6',
                        color: template.category === 'Marketing' ? '#92400E' :
                               template.category === 'Support' ? '#1E40AF' :
                               template.category === 'Promotional' ? '#BE185D' : '#374151',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {template.category}
                      </span>
                    </div>
                    
                    {template.description && (
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '13px',
                        color: selectedTemplate?._id === template._id ? '#16A34A' : '#6B7280',
                        fontStyle: 'italic'
                      }}>
                        {template.description}
                      </p>
                    )}
                    
                    <div style={{
                      background: selectedTemplate?._id === template._id ? '#DCFCE7' : '#F9FAFB',
                      border: '1px solid ' + (selectedTemplate?._id === template._id ? '#BBF7D0' : '#E5E7EB'),
                      borderRadius: 8,
                      padding: '12px',
                      fontSize: '13px',
                      color: selectedTemplate?._id === template._id ? '#166534' : '#4B5563',
                      fontFamily: 'monospace',
                      lineHeight: 1.4,
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}>
                      {template.content}
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#9CA3AF'
                  }}>
                    <TemplateIcon size={48} color="#E5E7EB" />
                    <p style={{ margin: '16px 0 0 0', fontSize: '14px' }}>
                      No templates available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkMessagePage;
