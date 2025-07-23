import React, { useState, useEffect, useCallback } from 'react';
import { createScheduledMessage, getScheduledMessages, deleteScheduledMessage } from '../api';
import ContactEntryForm from '../features/BulkMessage/ContactEntryForm';
import ContactCSVUpload from '../features/BulkMessage/ContactCSVUpload';

function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: type === 'success' ? '#00b86b' : '#f44336',
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

function ScheduleMessage() {
  const [currentView, setCurrentView] = useState('create'); // 'create' or 'manage'
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Create message state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Manage messages state
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchScheduledMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getScheduledMessages(statusFilter);
      if (response.scheduledMessages) {
        setScheduledMessages(response.scheduledMessages);
      }
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      showNotification('Error loading scheduled messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (currentView === 'manage') {
      fetchScheduledMessages();
    }
  }, [currentView, fetchScheduledMessages]);

  const showNotification = (msg, type = 'success') => {
    setNotification(msg);
    setNotificationType(type);
  };

  const handleManualAdd = (newContact) => {
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

  const handleScheduleMessage = async () => {
    if (!title.trim() || !message.trim() || contacts.length === 0 || !scheduledDate || !scheduledTime) {
      showNotification('Please fill in all fields and add contacts', 'error');
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      showNotification('Scheduled time must be in the future', 'error');
      return;
    }

    try {
      const scheduledMessageData = {
        title,
        message,
        recipients: contacts,
        scheduledDate: scheduledDateTime.toISOString(),
        messageType: 'whatsapp_message'
      };

      const response = await createScheduledMessage(scheduledMessageData);
      
      if (response.scheduledMessage) {
        showNotification('Message scheduled successfully!');
        // Reset form
        setTitle('');
        setMessage('');
        setContacts([]);
        setScheduledDate('');
        setScheduledTime('');
      } else {
        showNotification(response.error || 'Error scheduling message', 'error');
      }
    } catch (error) {
      console.error('Error scheduling message:', error);
      showNotification('Error scheduling message', 'error');
    }
  };

  const handleCancelMessage = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled message?')) {
      return;
    }

    try {
      const response = await deleteScheduledMessage(id);
      if (response.message) {
        showNotification('Scheduled message cancelled successfully!');
        fetchScheduledMessages(); // Refresh list
      } else {
        showNotification(response.error || 'Error cancelling message', 'error');
      }
    } catch (error) {
      console.error('Error cancelling message:', error);
      showNotification('Error cancelling message', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#2196F3';
      case 'sent': return '#4CAF50';
      case 'failed': return '#f44336';
      case 'cancelled': return '#666';
      default: return '#666';
    }
  };



  return (
    <>
      <Notification message={notification} type={notificationType} onClose={() => setNotification('')} />
      
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#222', margin: 0 }}>Schedule Messages</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentView('create')}
              style={{
                ...tabButtonStyle,
                backgroundColor: currentView === 'create' ? '#00b86b' : '#f5f5f5',
                color: currentView === 'create' ? '#fff' : '#666'
              }}
            >
              Create Schedule
            </button>
            <button
              onClick={() => setCurrentView('manage')}
              style={{
                ...tabButtonStyle,
                backgroundColor: currentView === 'manage' ? '#00b86b' : '#f5f5f5',
                color: currentView === 'manage' ? '#fff' : '#666'
              }}
            >
              Manage Scheduled
            </button>
          </div>
        </div>

        {currentView === 'create' ? (
          // Create Schedule View
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              
              {/* Title Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Message Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this scheduled message..."
                  style={inputStyle}
                />
              </div>

              {/* Contact Management */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Recipients</label>
                <ContactEntryForm onAdd={handleManualAdd} />
                <ContactCSVUpload onImport={handleCSVImport} />
                
                {contacts.length > 0 && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <strong>Selected Contacts ({contacts.length}):</strong>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '10px' }}>
                      {contacts.map((contact, idx) => (
                        <div key={idx} style={{ fontSize: '14px', marginBottom: '5px', padding: '5px', background: '#fff', borderRadius: '4px' }}>
                          <strong>{contact.name}</strong> - {contact.number}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows="4"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              {/* Date and Time */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Scheduled Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Schedule Button */}
              <button
                onClick={handleScheduleMessage}
                disabled={!title.trim() || !message.trim() || contacts.length === 0 || !scheduledDate || !scheduledTime}
                style={{
                  ...primaryButtonStyle,
                  opacity: (!title.trim() || !message.trim() || contacts.length === 0 || !scheduledDate || !scheduledTime) ? 0.5 : 1,
                  cursor: (!title.trim() || !message.trim() || contacts.length === 0 || !scheduledDate || !scheduledTime) ? 'not-allowed' : 'pointer'
                }}
              >
                Schedule Message
              </button>
            </div>
          </div>
        ) : (
          // Manage Scheduled Messages View
          <div>
            {/* Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...labelStyle, marginRight: '10px' }}>Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Scheduled Messages List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : scheduledMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No scheduled messages found.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {scheduledMessages.map((msg) => (
                  <div key={msg._id} style={{
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: '#333' }}>{msg.title}</h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: getStatusColor(msg.status)
                      }}>
                        {msg.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p style={{ color: '#666', marginBottom: '10px' }}>{msg.message}</p>
                    
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
                      <div><strong>Recipients:</strong> {msg.recipients.length} contacts</div>
                      <div><strong>Scheduled for:</strong> {formatDate(msg.scheduledDate)}</div>
                      {msg.sentAt && <div><strong>Sent at:</strong> {formatDate(msg.sentAt)}</div>}
                    </div>

                    {msg.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelMessage(msg._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancel Message
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Styles
const labelStyle = {
  display: 'block',
  fontWeight: '600',
  color: '#333',
  marginBottom: '5px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '2px solid #e0e0e0',
  borderRadius: '6px',
  fontSize: '16px',
  fontFamily: 'inherit'
};

const primaryButtonStyle = {
  backgroundColor: '#00b86b',
  color: '#fff',
  border: 'none',
  padding: '12px 30px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'block',
  margin: '0 auto'
};

const tabButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px'
};

export default ScheduleMessage; 