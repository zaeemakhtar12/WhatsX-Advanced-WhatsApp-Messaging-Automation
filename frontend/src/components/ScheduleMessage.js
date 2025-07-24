import React, { useState, useEffect } from 'react';
import { createScheduledMessage, getScheduledMessages, updateScheduledMessage, deleteScheduledMessage, getTemplates } from '../api';

// Icons
const ClockIcon = ({ size = 20, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ size = 20, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="8" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="3.01" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="12" x2="3.01" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="18" x2="3.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = ({ size = 16, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill={color}/>
  </svg>
);

const EditIcon = ({ size = 16, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RepeatIcon = ({ size = 16, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="17,1 21,5 17,9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7,23 3,19 7,15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContactIcon = ({ size = 20, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function ScheduleMessage() {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'view'
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('regular');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('daily');
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Contact management states
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
  };

  useEffect(() => {
    fetchScheduledMessages();
    fetchTemplates();
  }, []);

  const fetchScheduledMessages = async () => {
    try {
      const response = await getScheduledMessages();
      
      // Backend returns the array directly, not wrapped in an object
      if (Array.isArray(response)) {
        setScheduledMessages(response);
      } else if (response && response.scheduledMessages) {
        // Fallback in case the format changes
        setScheduledMessages(response.scheduledMessages);
      } else {
        setScheduledMessages([]);
      }
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      showNotification('Error loading scheduled messages', 'error');
    }
  };

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

  // Contact management functions
  const handleAddContact = () => {
    if (!contactName.trim() || !contactNumber.trim()) {
      showNotification('Please enter both name and phone number', 'error');
      return;
    }

    const newContact = {
      name: contactName.trim(),
      number: contactNumber.trim().replace(/\D/g, '')
    };

    if (newContact.number.length < 10) {
      showNotification('Please enter a valid phone number', 'error');
      return;
    }

    const isDuplicate = recipients.some(contact => contact.number === newContact.number);
    if (isDuplicate) {
      showNotification('This contact already exists', 'error');
      return;
    }

    setRecipients(prev => [...prev, newContact]);
    setContactName('');
    setContactNumber('');
    setShowContactForm(false);
    showNotification('Contact added successfully');
  };

  const handleRemoveContact = (index) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
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
          setRecipients(prev => [...prev, ...newContacts]);
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
    event.target.value = '';
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    setSelectedTemplate(templateId);
    if (template) {
      setMessage(template.content);
      showNotification(`Template "${template.name}" selected`, 'info');
    }
  };

  const handleScheduleMessage = async () => {
    if (!message.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }

    if (recipients.length === 0) {
      showNotification('Please add at least one recipient', 'error');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      showNotification('Please select date and time', 'error');
      return;
    }

    setLoading(true);
    try {
      const scheduleDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      if (scheduleDateTime <= new Date()) {
        showNotification('Please select a future date and time', 'error');
        setLoading(false);
        return;
      }

      // For now, take the first recipient (later we can loop for multiple)
      const firstRecipient = recipients[0];

      const scheduleData = {
        recipient: firstRecipient.phone || firstRecipient.number,
        recipientName: firstRecipient.name,
        message: message,
        scheduledDate: scheduleDateTime.toISOString(),
        messageType: messageType,
        templateId: selectedTemplate || null,
        isRecurring: isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null
      };

      const response = await createScheduledMessage(scheduleData);
      
      if (response.scheduledMessage || (response.message && response.message.toLowerCase().includes('success'))) {
        showNotification('Message scheduled successfully!', 'success');
        // Reset form
        setRecipients([]);
        setMessage('');
        setScheduledDate('');
        setScheduledTime('');
        setSelectedTemplate('');
        setIsRecurring(false);
        setRecurringPattern('daily');
        fetchScheduledMessages();
        setActiveTab('view');
      } else {
        showNotification(response.message || 'Failed to schedule message', 'error');
      }
    } catch (error) {
      console.error('Error scheduling message:', error);
      showNotification(error.message || 'Error scheduling message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScheduled = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled message?')) {
      return;
    }

    try {
      await deleteScheduledMessage(messageId);
      showNotification('Scheduled message deleted');
      fetchScheduledMessages();
    } catch (error) {
      console.error('Error deleting scheduled message:', error);
      showNotification('Error deleting message', 'error');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
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
        background: isActive ? '#F59E0B' : 'transparent',
        color: isActive ? '#fff' : '#6B7280',
        border: 'none',
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
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
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
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            padding: '12px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ClockIcon size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 700,
              color: '#1F2937',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Schedule Messages
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6B7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Plan and schedule your messages for future delivery
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '0',
          borderBottom: isMobile ? 'none' : '2px solid #E5E7EB',
          marginBottom: '20px'
        }}>
          <TabButton
            id="schedule"
            label="Schedule"
            icon={<CalendarIcon size={18} color={activeTab === 'schedule' ? '#fff' : '#6B7280'} />}
            isActive={activeTab === 'schedule'}
            onClick={() => setActiveTab('schedule')}
          />
          <TabButton
            id="view"
            label="Scheduled"
            icon={<ListIcon size={18} color={activeTab === 'view' ? '#fff' : '#6B7280'} />}
            isActive={activeTab === 'view'}
            onClick={() => setActiveTab('view')}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              gap: '24px'
            }}>
              {/* Main Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Recipients Section */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ContactIcon />
                    Recipients ({recipients.length})
                  </h3>

                  {/* Add Contact Form */}
                  {showContactForm ? (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
                        gap: '12px'
                      }}>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Contact name"
                          style={{
                            padding: '10px 12px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="tel"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="Phone number"
                          style={{
                            padding: '10px 12px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: '14px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleAddContact}
                            style={{
                              background: '#3B82F6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '10px 16px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setShowContactForm(false)}
                            style={{
                              background: '#6B7280',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '10px 16px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => setShowContactForm(true)}
                        style={{
                          background: '#3B82F6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        + Add Contact
                      </button>
                      
                      <label style={{
                        background: '#F59E0B',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        📁 Import CSV
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Recipients List */}
                  {recipients.length > 0 ? (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {recipients.map((contact, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: index < recipients.length - 1 ? '1px solid #F1F5F9' : 'none'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                              {contact.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748B' }}>
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
                              borderRadius: 4
                            }}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#64748B',
                      fontSize: '14px'
                    }}>
                      No recipients added yet
                    </div>
                  )}
                </div>

                {/* Message Section */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1E293B'
                  }}>
                    Message Content
                  </h3>

                  {/* Template Selection */}
                  {templates.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Use Template (Optional)
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      >
                        <option value="">Select a template...</option>
                        {templates.map(template => (
                          <option key={template._id} value={template._id}>
                            {template.name} ({template.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Message Textarea */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    style={{
                      width: '100%',
                      height: '150px',
                      padding: '16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: 8,
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Schedule Settings */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1E293B'
                  }}>
                    Schedule Settings
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>

                  {/* Recurring Options */}
                  <div style={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '16px'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      marginBottom: isRecurring ? '12px' : '0'
                    }}>
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <RepeatIcon size={16} />
                      Recurring Message
                    </label>

                    {isRecurring && (
                      <select
                        value={recurringPattern}
                        onChange={(e) => setRecurringPattern(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: 6,
                          fontSize: '14px',
                          background: '#F8FAFC'
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Panel */}
              <div>
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: 12,
                  padding: '20px',
                  position: 'sticky',
                  top: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#92400E'
                  }}>
                    📅 Schedule Summary
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#78350F', fontSize: '14px' }}>Recipients:</span>
                      <span style={{ fontWeight: 600, color: '#92400E' }}>{recipients.length}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#78350F', fontSize: '14px' }}>Message length:</span>
                      <span style={{ fontWeight: 600, color: '#92400E' }}>{message.length} chars</span>
                    </div>
                    {scheduledDate && scheduledTime && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: '#78350F', fontSize: '14px' }}>Scheduled for:</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: '#92400E', fontSize: '13px' }}>
                            {new Date(scheduledDate).toLocaleDateString()}
                          </div>
                          <div style={{ fontWeight: 600, color: '#92400E', fontSize: '13px' }}>
                            {scheduledTime}
                          </div>
                        </div>
                      </div>
                    )}
                    {isRecurring && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#78350F', fontSize: '14px' }}>Recurring:</span>
                        <span style={{ fontWeight: 600, color: '#92400E', fontSize: '13px' }}>
                          {recurringPattern}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleScheduleMessage}
                    disabled={loading || !message.trim() || recipients.length === 0 || !scheduledDate || !scheduledTime}
                    className="btn-ripple hover-lift"
                    style={{
                      width: '100%',
                      background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B, #D97706)',
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
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
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
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <ClockIcon size={16} color="#fff" />
                        Schedule Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Scheduled Tab */}
          {activeTab === 'view' && (
            <div>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ListIcon />
                Scheduled Messages ({scheduledMessages.length})
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {scheduledMessages.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#64748B'
                  }}>
                    <ClockIcon size={48} color="#CBD5E1" />
                    <p style={{ margin: '16px 0 0 0', fontSize: '16px', fontWeight: 500 }}>
                      No scheduled messages yet
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                      Schedule your first message to see it here
                    </p>
                  </div>
                ) : (
                  scheduledMessages.map(msg => {
                    const { date, time } = formatDateTime(msg.scheduledDate); // Changed from scheduledFor to scheduledDate
                    const isPast = new Date(msg.scheduledDate) < new Date(); // Changed from scheduledFor to scheduledDate
                    
                    return (
                      <div
                        key={msg._id}
                        className="hover-lift"
                        style={{
                          background: '#fff',
                          border: `2px solid ${isPast ? '#FCA5A5' : msg.status === 'sent' ? '#86EFAC' : '#FDE68A'}`,
                          borderRadius: 12,
                          padding: '20px',
                          marginBottom: '16px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#1E293B',
                              marginBottom: '4px'
                            }}>
                              {date} at {time}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: '#64748B'
                            }}>
                              {msg.recipients?.length || 0} recipient{(msg.recipients?.length || 0) !== 1 ? 's' : ''}
                              {msg.isRecurring && (
                                <span style={{
                                  marginLeft: '8px',
                                  background: '#DBEAFE',
                                  color: '#1E40AF',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}>
                                  {msg.recurringPattern}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <span style={{
                            background: 
                              msg.status === 'sent' ? '#DCFCE7' :
                              msg.status === 'failed' ? '#FEE2E2' :
                              isPast ? '#FEE2E2' : '#FEF3C7',
                            color: 
                              msg.status === 'sent' ? '#166534' :
                              msg.status === 'failed' ? '#DC2626' :
                              isPast ? '#DC2626' : '#92400E',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {msg.status === 'sent' ? 'Sent' :
                             msg.status === 'failed' ? 'Failed' :
                             isPast ? 'Expired' : 'Pending'}
                          </span>
                        </div>
                        
                        <div style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '12px',
                          marginBottom: '16px',
                          fontSize: '14px',
                          color: '#475569',
                          lineHeight: 1.4,
                          maxHeight: '80px',
                          overflowY: 'auto'
                        }}>
                          {msg.message}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748B'
                          }}>
                            Created: {new Date(msg.createdAt).toLocaleDateString()}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {msg.status === 'pending' && !isPast && (
                              <button
                                onClick={() => setEditingId(msg._id)}
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
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteScheduled(msg._id)}
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
                              title="Delete"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScheduleMessage; 