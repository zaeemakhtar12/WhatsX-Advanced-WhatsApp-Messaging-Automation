import React, { useState, useEffect } from 'react';
import { createScheduledMessage, getScheduledMessages, updateScheduledMessage, deleteScheduledMessage, getTemplates } from '../api';

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
  
  // Contact management states
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message) => {
    setNotification(message);
  };

  useEffect(() => {
    fetchScheduledMessages();
    fetchTemplates();
  }, []);

  const fetchScheduledMessages = async () => {
    try {
      const response = await getScheduledMessages();
      if (response && response.scheduledMessages) {
        setScheduledMessages(response.scheduledMessages);
      }
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
    }
  };

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

  // Contact management functions
  const handleAddContact = () => {
    if (!contactName.trim() || !contactNumber.trim()) {
      showNotification('Please enter both name and phone number');
      return;
    }

    const newContact = {
      name: contactName.trim(),
      number: contactNumber.trim()
    };

    // Check for duplicates
    const isDuplicate = recipients.some(
      contact => contact.number === newContact.number
    );

    if (isDuplicate) {
      showNotification('This contact already exists');
      return;
    }

    setRecipients(prev => [...prev, newContact]);
    setContactName('');
    setContactNumber('');
    showNotification('Contact added successfully');
  };

  const handleRemoveContact = (index) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        const newContacts = [];

        lines.forEach((line, index) => {
          if (index === 0) return; // Skip header row
          
          const [name, number] = line.split(',').map(item => item.trim().replace(/"/g, ''));
          
          if (name && number) {
            // Check for duplicates
            const isDuplicate = recipients.some(contact => contact.number === number) ||
                              newContacts.some(contact => contact.number === number);
            
            if (!isDuplicate) {
              newContacts.push({ name, number });
            }
          }
        });

        if (newContacts.length > 0) {
          setRecipients(prev => [...prev, ...newContacts]);
          showNotification(`${newContacts.length} contacts imported successfully`);
        } else {
          showNotification('No new contacts found in CSV');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        showNotification('Error reading CSV file');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (recipients.length === 0) {
      showNotification('Please add at least one recipient');
      return;
    }

    if (!message || !scheduledDate || !scheduledTime) {
      showNotification('Please fill in all required fields');
      return;
    }

    try {
      // Create a scheduled message for each recipient
      const promises = recipients.map(recipient => {
        const messageData = {
          recipient: recipient.number,
          recipientName: recipient.name,
          message,
          messageType: 'regular',
          templateId: selectedTemplate || undefined,
          scheduledDate,
          scheduledTime,
          isRecurring,
          recurringPattern: isRecurring ? recurringPattern : undefined
        };

        return editingId ? 
          updateScheduledMessage(editingId, messageData) : 
          createScheduledMessage(messageData);
      });

      await Promise.all(promises);
      
      showNotification(`${recipients.length} message(s) scheduled successfully!`);
      
      // Reset form
      setRecipients([]);
      setMessage('');
      setMessageType('regular');
      setSelectedTemplate('');
      setScheduledDate('');
      setScheduledTime('');
      setIsRecurring(false);
      setRecurringPattern('daily');
      setEditingId(null);
      
      fetchScheduledMessages();
      
      // Switch to view tab to see the result
      setActiveTab('view');
    } catch (error) {
      console.error('Error scheduling messages:', error);
      showNotification('Failed to schedule messages');
    }
  };

  const handleEdit = (scheduledMessage) => {
    setEditingId(scheduledMessage._id);
    setRecipients([{
      name: scheduledMessage.recipientName || 'Unknown',
      number: scheduledMessage.recipient
    }]);
    setMessage(scheduledMessage.message);
    setMessageType(scheduledMessage.messageType);
    setSelectedTemplate(scheduledMessage.templateId?._id || '');
    setScheduledDate(scheduledMessage.scheduledDate.split('T')[0]);
    setScheduledTime(scheduledMessage.scheduledTime);
    setIsRecurring(scheduledMessage.isRecurring);
    setRecurringPattern(scheduledMessage.recurringPattern || 'daily');
    
    // Switch to schedule tab for editing
    setActiveTab('schedule');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled message?')) {
      try {
        await deleteScheduledMessage(id);
        showNotification('Scheduled message deleted successfully!');
        fetchScheduledMessages();
      } catch (error) {
        console.error('Error deleting scheduled message:', error);
        showNotification('Failed to delete scheduled message');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setRecipients([]);
    setMessage('');
    setMessageType('regular');
    setSelectedTemplate('');
    setScheduledDate('');
    setScheduledTime('');
    setIsRecurring(false);
    setRecurringPattern('daily');
  };

  const renderScheduleTab = () => (
    <div style={{ 
      background: '#fff', 
      padding: 24, 
      borderRadius: 12, 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '2px solid #E4E6EA'
    }}>
      <h3 style={{ color: '#1F2937', marginBottom: 20, fontSize: 20 }}>
        {editingId ? 'Edit Scheduled Message' : 'Schedule New Message'}
      </h3>

      {/* Recipients Management */}
      <div style={{ marginBottom: 24, padding: 20, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA' }}>
        <h4 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Recipients</h4>
        
        {/* Contact Entry Form */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setShowContactForm(!showContactForm)}
            style={{
              padding: '8px 16px',
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            {showContactForm ? 'Hide Contact Form' : 'Add Contact Manually'}
          </button>

          {showContactForm && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: 10, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1234567890"
                  style={{ width: '100%', padding: 10, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                style={{
                  padding: '10px 16px',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* CSV Upload */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            style={{ 
              width: '100%', 
              padding: 10, 
              border: '2px dashed #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14,
              background: '#F9FAFB'
            }}
          />
          <small style={{ color: '#6B7280', fontSize: 12, display: 'block', marginTop: 4 }}>
            CSV format: Name, Phone Number (e.g., John Doe, +1234567890)
          </small>
        </div>

        {/* Recipients List */}
        {recipients.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h5 style={{ color: '#1F2937', marginBottom: 12, fontWeight: 600 }}>
              Added Recipients ({recipients.length})
            </h5>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #E4E6EA', borderRadius: 6, padding: 8 }}>
              {recipients.map((contact, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px', 
                  background: '#fff', 
                  borderRadius: 4, 
                  marginBottom: 4,
                  border: '1px solid #F0F0F0'
                }}>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>{contact.name}</span>
                  <span style={{ color: '#6B7280', fontSize: 14 }}>{contact.number}</span>
                  <button
                    onClick={() => handleRemoveContact(index)}
                    style={{
                      padding: '4px 8px',
                      background: '#DC2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
            >
              <option value="regular">Regular Message</option>
              <option value="template">Template Message</option>
            </select>
          </div>

          {messageType === 'template' && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{ width: '100%', padding: 12, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
              >
                <option value="">Choose a template...</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Message Content *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows={4}
            style={{ 
              width: '100%', 
              padding: 12, 
              border: '2px solid #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14,
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Scheduled Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: 12, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Scheduled Time *
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 600, color: '#374151' }}>Make this a recurring message</span>
          </label>
          
          {isRecurring && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                Recurring Pattern
              </label>
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                style={{ width: 200, padding: 12, border: '2px solid #E4E6EA', borderRadius: 6, fontSize: 14 }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={recipients.length === 0}
            style={{
              padding: '12px 24px',
              background: recipients.length === 0 ? '#D1D5DB' : '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: recipients.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {editingId ? 'Update Messages' : 'Schedule Messages'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                background: '#6B7280',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderViewTab = () => (
    <div style={{ 
      background: '#fff', 
      padding: 24, 
      borderRadius: 12, 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '2px solid #E4E6EA'
    }}>
      <h3 style={{ color: '#1F2937', marginBottom: 20, fontSize: 20 }}>Scheduled Messages</h3>
      
      {scheduledMessages.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6B7280'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#25D366' }}>📅</div>
          <h4 style={{ color: '#1F2937', marginBottom: 8 }}>No Scheduled Messages</h4>
          <p style={{ margin: 0 }}>
            You haven't scheduled any messages yet. 
            <button 
              onClick={() => setActiveTab('schedule')}
              style={{
                background: 'none',
                border: 'none',
                color: '#25D366',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: 4
              }}
            >
              Create your first one
            </button>
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {scheduledMessages.map((msg) => (
            <div 
              key={msg._id} 
              style={{ 
                padding: 20, 
                border: '2px solid #E4E6EA', 
                borderRadius: 8,
                background: msg.isExecuted ? '#F0FDF4' : '#F7F8FA'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ color: '#1F2937', margin: 0, marginBottom: 4 }}>
                    {msg.recipientName || 'Unknown'} ({msg.recipient})
                  </h4>
                  <span style={{ 
                    fontSize: 12, 
                    background: msg.isExecuted ? '#25D366' : '#3B82F6', 
                    color: '#fff', 
                    padding: '4px 8px', 
                    borderRadius: 4 
                  }}>
                    {msg.isExecuted ? 'Executed' : 'Pending'}
                  </span>
                </div>
                
                {!msg.isExecuted && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleEdit(msg)}
                      style={{
                        padding: '6px 12px',
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#DC2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <p style={{ color: '#6B7280', margin: '8px 0', fontSize: 14 }}>
                {msg.message.length > 100 ? `${msg.message.substring(0, 100)}...` : msg.message}
              </p>
              
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                <span>Date: {new Date(msg.scheduledDate).toLocaleDateString()}</span>
                <span style={{ marginLeft: 16 }}>Time: {msg.scheduledTime}</span>
                {msg.isRecurring && (
                  <span style={{ marginLeft: 16 }}>Recurring: {msg.recurringPattern}</span>
                )}
                {msg.executedAt && (
                  <span style={{ marginLeft: 16 }}>Executed: {new Date(msg.executedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', background: '#F0F2F5', minHeight: '100vh' }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#25D366',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(37, 211, 102, 0.3)',
          zIndex: 1000
        }}>
          {notification}
          <button 
            onClick={() => setNotification('')}
            style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <h2 style={{ color: '#1F2937', marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Schedule Messages</h2>

      {/* Tab Navigation */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px 12px 0 0', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '2px solid #E4E6EA',
        borderBottom: 'none',
        marginBottom: 0
      }}>
        <div style={{ display: 'flex', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
          <button
            onClick={() => setActiveTab('schedule')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'schedule' ? '#25D366' : '#F7F8FA',
              color: activeTab === 'schedule' ? '#fff' : '#6B7280',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRight: '1px solid #E4E6EA'
            }}
          >
            📝 Schedule New Message
          </button>
          <button
            onClick={() => setActiveTab('view')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'view' ? '#25D366' : '#F7F8FA',
              color: activeTab === 'view' ? '#fff' : '#6B7280',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📋 View Scheduled Messages ({scheduledMessages.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {activeTab === 'schedule' ? renderScheduleTab() : renderViewTab()}
      </div>
    </div>
  );
}

export default ScheduleMessage; 