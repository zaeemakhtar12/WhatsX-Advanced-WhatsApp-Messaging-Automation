import React, { useState, useEffect } from 'react';
import { createScheduledMessage, getTemplates, getScheduledMessages, updateScheduledMessage, deleteScheduledMessage } from '../api';
import { useNotification } from './NotificationSystem';

export default function ScheduleMessage() {
  const [tab, setTab] = useState('schedule');
  const [entryMethod, setEntryMethod] = useState('manual');
  const [recipients, setRecipients] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Track if we're editing an existing message
  const [editingMessageId, setEditingMessageId] = useState(null);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  useEffect(() => {
    fetchScheduled();
    
    // Auto-refresh scheduled messages every minute to show executed messages
    const interval = setInterval(fetchScheduled, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setMessage(selectedTemplate.content || '');
    }
  }, [selectedTemplate]);

  const fetchScheduled = async () => {
    try {
      const response = await getScheduledMessages();
      setScheduledMessages(response || []);
    } catch (error) {
      showError('Error loading scheduled messages.');
    }
  };

  const handleAddRecipient = () => {
    if (name && phone) {
      setRecipients([...recipients, { name, phone }]);
      setName('');
      setPhone('');
    }
  };

  const handleRemoveRecipient = (idx) => {
    setRecipients(recipients.filter((_, i) => i !== idx));
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newRecipients = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          })
          .filter(obj => obj.name && obj.phone)
          .map(obj => ({
            name: obj.name,
            phone: obj.phone
          }));

        setRecipients([...recipients, ...newRecipients]);
        showSuccess(`Added ${newRecipients.length} contacts from CSV`);
        event.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!recipients.length || !message || !date || !time) {
      showError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        // Update existing scheduled message
        await updateScheduledMessage(editingMessageId, {
          recipients,
          message,
          templateId: selectedTemplate?._id || null,
          scheduledDate: `${date}T${time}`,
        });
        showSuccess('Scheduled message updated successfully!');
        setIsEditing(false);
        setEditingMessageId(null);
      } else {
        // Create new scheduled message
        await createScheduledMessage({
          recipients,
          message,
          templateId: selectedTemplate?._id || null,
          scheduledDate: `${date}T${time}`,
        });
        showSuccess('Message scheduled successfully!');
      }
      
      // Reset form
      setRecipients([]);
      setMessage('');
      setSelectedTemplate(null);
      setDate('');
      setTime('');
      setName('');
      setPhone('');
      
      // Switch to view tab to show updated list
      setTab('view');
    } catch {
      showError('Failed to schedule message.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this scheduled message?')) return;
    setLoading(true);
    try {
      await deleteScheduledMessage(id);
      showSuccess('Scheduled message cancelled.');
      fetchScheduled();
    } catch {
      showError('Failed to cancel scheduled message.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (msg) => {
    // Pre-fill the form with the message data
    setRecipients([{ name: msg.recipientName, phone: msg.recipient }]);
    setMessage(msg.message);
    
    const scheduledDate = new Date(msg.scheduledDate);
    setDate(scheduledDate.toISOString().slice(0, 10));
    setTime(scheduledDate.toTimeString().slice(0, 5));
    
    // Set template if it exists
    if (msg.templateId) {
      const template = templates.find(t => t._id === msg.templateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
    
    // Set editing state
    setIsEditing(true);
    setEditingMessageId(msg._id);
    
    // Switch to schedule tab
    setTab('schedule');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMessageId(null);
    setRecipients([]);
    setMessage('');
    setSelectedTemplate(null);
    setDate('');
    setTime('');
    setName('');
    setPhone('');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Enhanced Main Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Schedule Messages
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage your scheduled message campaigns
        </p>
      </div>

      {/* Enhanced Primary Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            className={`flex-1 py-3 px-6 rounded-md text-sm font-semibold transition-all duration-200 ${
              tab === 'schedule' 
                ? 'bg-white dark:bg-gray-600 text-whatsapp-600 dark:text-whatsapp-400 shadow-md transform scale-105' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTab('schedule')}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule New Message
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-6 rounded-md text-sm font-semibold transition-all duration-200 ${
              tab === 'view' 
                ? 'bg-white dark:bg-gray-600 text-whatsapp-600 dark:text-whatsapp-400 shadow-md transform scale-105' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTab('view')}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Scheduled Messages
            </div>
          </button>
        </div>
      </div>

      {tab === 'schedule' && (
        <form onSubmit={handleSchedule} className="space-y-6">
          {/* Edit Mode Header */}
          {isEditing && (
            <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Editing Scheduled Message</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                >
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          {/* Contact Entry Method - Subtle Secondary Tabs */}
          <div className="card p-4">
            <div className="font-medium mb-4 text-gray-700 dark:text-gray-300">Contact Entry Method:</div>
            <div className="flex bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                  entryMethod === 'manual' 
                    ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={e => { e.preventDefault(); setEntryMethod('manual'); }}
                type="button"
              >
                Manual Entry
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                  entryMethod === 'csv' 
                    ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={e => { e.preventDefault(); setEntryMethod('csv'); }}
                type="button"
              >
                CSV Upload
              </button>
            </div>
          </div>

          {/* Recipients */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-medium">Recipients</span>
              <span className="text-xs text-gray-400">(Add at least one)</span>
            </div>
            {entryMethod === 'manual' ? (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="input-field flex-1"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone number"
                  className="input-field flex-1"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <button
                  className="btn btn-success px-4 py-2"
                  onClick={handleAddRecipient}
                  type="button"
                >
                  Add
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  CSV should have columns: name, phone
                </p>
              </div>
            )}
            <ul className="space-y-2">
              {recipients.map((r, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                  <span>{r.name} ({r.phone})</span>
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => handleRemoveRecipient(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Template Selection */}
          <div className="card p-4">
            <div className="font-medium mb-2">Choose Template (Optional)</div>
            <select
              className="input-field w-full"
              value={selectedTemplate?._id || ''}
              onChange={e => {
                const tmpl = templates.find(t => t._id === e.target.value);
                setSelectedTemplate(tmpl || null);
              }}
            >
              <option value="">-- No Template --</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                <div className="font-semibold">{selectedTemplate.name}</div>
                <div>{selectedTemplate.content}</div>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="card p-4">
            <div className="font-medium mb-2">Message Content <span className="text-red-500">*</span></div>
            <textarea
              className="input-field w-full min-h-[80px]"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>

          {/* Schedule Date & Time */}
          <div className="card p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="input-field w-full"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                className="input-field w-full"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule Button */}
          <div className="flex justify-end">
            <button
              className="btn btn-primary px-8 py-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Scheduling...') : (isEditing ? 'Update Message' : 'Schedule Message')}
            </button>
          </div>
        </form>
      )}

      {tab === 'view' && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scheduled Messages</h3>
            <button
              onClick={fetchScheduled}
              className="btn btn-secondary px-4 py-2 text-sm"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : scheduledMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No scheduled messages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recipient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Message</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scheduled For</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                  {scheduledMessages.map(msg => (
                    <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{msg.recipientName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{msg.recipient}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={msg.message}>
                          {msg.message}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(msg.scheduledDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(msg)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 