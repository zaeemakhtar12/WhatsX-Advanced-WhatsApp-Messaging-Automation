// src/features/BulkMessage/BulkMessagePage.js
import React, { useState, useEffect } from 'react';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';
import { getTemplates, sendBulkMessage } from '../../api';
import { useNotification } from '../../components/NotificationSystem';

// Enhanced Icons with better styling
const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContactIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.9999 15.6144 20.22 15.44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplateIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MessageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function BulkMessagePage() {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contactEntryMethod, setContactEntryMethod] = useState('manual');

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showError('Failed to load templates');
    }
  };

  const handleAddContact = (contact) => {
    // Check if phone number already exists
    const existingContact = contacts.find(c => c.phone === contact.phone);
    if (existingContact) {
      showError(`${contact.name} (${contact.phone}) is already in the recipients list`);
      return;
    }
    
    setContacts(prev => [...prev, { ...contact, id: Date.now() }]);
    showSuccess(`${contact.name} added to recipients`);
  };

  const handleCSVContacts = (csvContacts) => {
    let addedCount = 0;
    let duplicateCount = 0;
    const newContacts = [];
    
    csvContacts.forEach(contact => {
      const existingContact = contacts.find(c => c.phone === contact.phone);
      if (existingContact) {
        duplicateCount++;
      } else {
        newContacts.push({ ...contact, id: Date.now() + Math.random() });
        addedCount++;
      }
    });
    
    if (newContacts.length > 0) {
      setContacts(prev => [...prev, ...newContacts]);
    }
    
    if (addedCount > 0) {
      showSuccess(`${addedCount} contacts added from CSV`);
    }
    if (duplicateCount > 0) {
      showError(`${duplicateCount} duplicate contacts were skipped`);
    }
  };

  const handleRemoveContact = (id) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(contact => contact.id !== id));
    showSuccess(`${contact?.name} removed from recipients`);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessage(template.content);
    showSuccess(`Template "${template.name}" selected`);
  };

  const handleSendBulkMessage = async () => {
    if (!message.trim() || contacts.length === 0) {
      showError('Please enter a message and add at least one contact');
      return;
    }

    try {
      setLoading(true);
      const response = await sendBulkMessage(
        contacts,
        message,
        selectedTemplate?._id
      );

      if (response && response.message && response.message.includes('completed')) {
        showSuccess(`Successfully sent messages to ${contacts.length} recipients!`);
        setContacts([]);
        setMessage('');
        setSelectedTemplate(null);
      } else {
        throw new Error('Failed to send messages');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      showError('Failed to send bulk messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Bulk Message
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send messages to multiple contacts
          </p>
        </div>

        {/* Main Content - Compact Layout */}
        <div className="space-y-4">
          {/* Step 1: Add Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ContactIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Recipients</h3>
            </div>
            
            {/* Contact Entry Method Tabs */}
            <div className="mb-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${
                    contactEntryMethod === 'manual' 
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setContactEntryMethod('manual')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <ContactIcon className="w-3 h-3" />
                    Manual Entry
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 ${
                    contactEntryMethod === 'csv' 
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setContactEntryMethod('csv')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <UploadIcon className="w-3 h-3" />
                    CSV Upload
                  </div>
                </button>
              </div>
            </div>
            
            {/* Contact Entry Content */}
            <div className="mb-4">
              {contactEntryMethod === 'manual' ? (
                <ContactEntryForm onAdd={handleAddContact} />
              ) : (
                <ContactCSVUpload onContactsLoaded={handleCSVContacts} />
              )}
            </div>

            {/* Recipients Summary */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recipients ({contacts.length})</h4>
                {contacts.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                    {contacts.length} contacts
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {contacts.length === 0 ? (
                  <div className="col-span-full text-center py-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No contacts added yet
                    </p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs"
                      >
                        <DeleteIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Choose Template */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TemplateIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Template (Optional)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No templates available</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template._id}
                    className={`p-3 rounded border-2 transition-all duration-200 cursor-pointer ${
                      selectedTemplate?._id === template._id 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      {selectedTemplate?._id === template._id && (
                        <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {template.content}
                    </p>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step 3: Compose Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Message</h3>
            </div>
            
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none text-sm"
              />
            </div>
            
            {selectedTemplate && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Using template: <span className="font-medium">{selectedTemplate.name}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSendBulkMessage}
              disabled={loading || !message.trim() || contacts.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-8 rounded-md shadow-sm hover:shadow disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <SendIcon className="w-4 h-4" />
                  <span>Send to {contacts.length} Recipients</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkMessagePage;
