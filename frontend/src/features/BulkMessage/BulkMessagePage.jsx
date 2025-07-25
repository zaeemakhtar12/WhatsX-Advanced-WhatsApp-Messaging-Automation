// src/features/BulkMessage/BulkMessagePage.js
import React, { useState, useEffect } from 'react';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';
import { getTemplates, sendBulkMessage } from '../../api';

// Icons using Tailwind classes
const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
  </svg>
);

const ContactIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplateIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MessageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
    <path d="M8 9h8M8 13h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7,10 12,5 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function BulkMessagePage() {
  const [activeTab, setActiveTab] = useState('compose');
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleAddContact = (contact) => {
    setContacts(prev => [...prev, { ...contact, id: Date.now() }]);
  };

  const handleRemoveContact = (id) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessage(template.content);
  };

  const handleSendBulkMessage = async () => {
    if (!message.trim() || contacts.length === 0) {
      alert('Please enter a message and add at least one contact');
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
        alert('Bulk messages sent successfully!');
        setContacts([]);
        setMessage('');
        setSelectedTemplate(null);
      } else {
        throw new Error('Failed to send messages');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      alert('Failed to send bulk messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'compose', label: 'Compose', icon: MessageIcon },
    { id: 'contacts', label: 'Contacts', icon: ContactIcon },
    { id: 'templates', label: 'Templates', icon: TemplateIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pl-6">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bulk Message
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send messages to multiple contacts at once
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-whatsapp-500 text-whatsapp-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-slide-in">
          {activeTab === 'compose' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message Compose */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Compose Message
                </h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent dark:bg-dark-surface dark:text-white resize-none"
                />
                
                {selectedTemplate && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Using template: <strong>{selectedTemplate.name}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Contacts Summary */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recipients ({contacts.length})
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {contacts.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No contacts added yet
                    </p>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-border rounded"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {contact.name} - {contact.phone}
                        </span>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <button
                  onClick={handleSendBulkMessage}
                  disabled={loading || !message.trim() || contacts.length === 0}
                  className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5" />
                      <span>Send Messages</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <ContactEntryForm onAdd={handleAddContact} />
              <ContactCSVUpload onContactsLoaded={setContacts} />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No templates available</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template._id}
                    className="card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {template.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-1 rounded">
                        {template.category}
                      </span>
                      <span className="text-xs text-whatsapp-500">Click to use</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkMessagePage;
