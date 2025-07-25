import React, { useState, useEffect } from 'react';
import { createScheduledMessage, getScheduledMessages, updateScheduledMessage, deleteScheduledMessage, getTemplates } from '../api';

// Icons using Tailwind classes
const ClockIcon = ({ className = "w-5 h-5 text-amber-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5 text-blue-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = ({ className = "w-5 h-5 text-purple-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = ({ className = "w-4 h-4 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
  </svg>
);

const EditIcon = ({ className = "w-4 h-4 text-blue-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4 text-red-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContactIcon = ({ className = "w-5 h-5 text-blue-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5 text-indigo-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7,10 12,5 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Modern Notification Component
function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'i'
  };

  return (
    <div className={`fixed top-6 right-6 ${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 min-w-[250px] animate-slide-in`}>
      <span className="font-bold">{icons[type]}</span>
      <span className="font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-auto text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function ScheduleMessage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [entryMethod, setEntryMethod] = useState('manual');

  useEffect(() => {
    fetchScheduledMessages();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  const fetchScheduledMessages = async () => {
    try {
      const response = await getScheduledMessages();
      setScheduledMessages(response || []);
    } catch (error) {
      showNotification('Error loading scheduled messages', 'error');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response || []);
    } catch (error) {
      showNotification('Error loading templates', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleAddRecipient = () => {
    setRecipients([...recipients, { phone: '', name: '' }]);
  };

  const handleRemoveRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (index, field, value) => {
    const updated = recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setRecipients(updated);
  };

  const handleCSVUpload = (csvData) => {
    const newRecipients = csvData.map(row => ({
      phone: row.phone || row.Phone || '',
      name: row.name || row.Name || ''
    }));
    setRecipients([...recipients, ...newRecipients]);
    showNotification(`Added ${newRecipients.length} contacts from CSV`, 'success');
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessage(template.content);
  };

  const handleScheduleMessage = async () => {
    if (!message.trim() || recipients.length === 0 || !scheduledDate || !scheduledTime) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
      
      for (const recipient of recipients) {
        if (recipient.phone && recipient.name) {
          const messageData = {
            recipient: recipient.phone,
            recipientName: recipient.name,
            message,
            scheduledDate: scheduledFor.toISOString(),
            templateId: selectedTemplate?._id
          };
          
          await createScheduledMessage(messageData);
        }
      }
      
      showNotification('Messages scheduled successfully!', 'success');
      setRecipients([]);
      setMessage('');
      setScheduledDate('');
      setScheduledTime('');
      setSelectedTemplate(null);
      fetchScheduledMessages();
    } catch (error) {
      showNotification('Error scheduling messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMessage = async (id, updates) => {
    try {
      await updateScheduledMessage(id, updates);
      showNotification('Message updated successfully!', 'success');
      setEditingMessage(null);
      fetchScheduledMessages();
    } catch (error) {
      showNotification('Error updating message', 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled message?')) {
      try {
        await deleteScheduledMessage(id);
        showNotification('Message deleted successfully!', 'success');
        fetchScheduledMessages();
      } catch (error) {
        showNotification('Error deleting message', 'error');
      }
    }
  };

  const renderScheduleForm = () => (
    <div className="space-y-6">
      {/* Entry Method Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ContactIcon />
          Contact Entry Method
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setEntryMethod('manual')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              entryMethod === 'manual'
                ? 'bg-whatsapp-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setEntryMethod('csv')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              entryMethod === 'csv'
                ? 'bg-whatsapp-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            CSV Upload
          </button>
        </div>
      </div>

      {/* Recipients Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ContactIcon />
            Recipients ({recipients.length})
          </h3>
          {entryMethod === 'manual' && (
            <button
              onClick={handleAddRecipient}
              className="btn-primary flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span>
              Add Contact
            </button>
          )}
        </div>

        {entryMethod === 'csv' ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload CSV File</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              CSV should have columns: phone, name
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Simple CSV parsing - in production, use a proper CSV parser
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const csv = event.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    const data = lines.slice(1).map(line => {
                      const values = line.split(',').map(v => v.trim());
                      const obj = {};
                      headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                      });
                      return obj;
                    }).filter(obj => obj.phone || obj.Phone);
                    handleCSVUpload(data);
                  };
                  reader.readAsText(file);
                }
              }}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="btn-primary cursor-pointer inline-flex items-center gap-2"
            >
              <UploadIcon className="w-4 h-4" />
              Choose File
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={recipient.phone}
                  onChange={(e) => handleRecipientChange(index, 'phone', e.target.value)}
                  className="input-field flex-1"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={recipient.name}
                  onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={() => handleRemoveRecipient(index)}
                  className="btn-danger px-3"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
            {recipients.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recipients added yet. Click "Add Contact" to start.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Template (Optional)
        </h3>
        <div className="grid gap-3 max-h-48 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template._id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedTemplate?._id === template._id
                  ? 'border-whatsapp-500 bg-whatsapp-50 dark:bg-whatsapp-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-whatsapp-300'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{template.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{template.content}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Message Content */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Message Content
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={6}
          className="input-field resize-none"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Use variables like {'{'}name{'}'} for personalization
        </p>
      </div>

      {/* Schedule Date & Time */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon />
          Schedule Date & Time
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Schedule Button */}
      <div className="flex justify-center">
        <button
          onClick={handleScheduleMessage}
          disabled={loading || !message.trim() || recipients.length === 0 || !scheduledDate || !scheduledTime}
          className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Scheduling...
            </>
          ) : (
            <>
              <SendIcon />
              Schedule Messages
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderScheduledMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ListIcon />
          Scheduled Messages ({scheduledMessages.length})
        </h3>
        <button
          onClick={fetchScheduledMessages}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {scheduledMessages.length === 0 ? (
        <div className="card p-12 text-center">
          <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Scheduled Messages</h4>
          <p className="text-gray-500 dark:text-gray-400">
            Messages you schedule will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scheduledMessages.map((msg) => (
            <div key={msg._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ContactIcon className="w-4 h-4" />
                      <span className="font-medium">{msg.recipientName}</span>
                      <span>•</span>
                      <span>{msg.recipient}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(msg.scheduledDate).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {editingMessage === msg._id ? (
                    <div className="space-y-3">
                      <textarea
                        defaultValue={msg.message}
                        rows={3}
                        className="input-field resize-none"
                        id={`edit-message-${msg._id}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newMessage = document.getElementById(`edit-message-${msg._id}`).value;
                            handleUpdateMessage(msg._id, { message: newMessage });
                          }}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessage(null)}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {msg.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingMessage(editingMessage === msg._id ? null : msg._id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    title="Edit message"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    title="Delete message"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 pl-12 space-y-6">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ClockIcon className="w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Messages</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'schedule'
                ? 'border-whatsapp-500 text-whatsapp-600 dark:text-whatsapp-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Schedule New Message
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'scheduled'
                ? 'border-whatsapp-500 text-whatsapp-600 dark:text-whatsapp-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ListIcon className="w-4 h-4" />
              View Scheduled Messages
              {scheduledMessages.length > 0 && (
                <span className="bg-whatsapp-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                  {scheduledMessages.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'schedule' ? renderScheduleForm() : renderScheduledMessages()}
      </div>
    </div>
  );
}

export default ScheduleMessage; 