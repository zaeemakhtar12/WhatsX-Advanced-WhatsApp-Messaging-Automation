// src/components/BulkMessage/ContactEntryForm.js
import React, { useState } from 'react';
import { useNotification } from '../../components/NotificationSystem';

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ContactEntryForm({ onAdd }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { showSuccess, showError } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showError('Both name and phone number are required');
      return;
    }
    onAdd({ name: name.trim(), phone: phone.trim() });
    setName('');
    setPhone('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Add Contact</h4>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 text-sm transition-all duration-200"
              required
            />
          </div>

          {/* Phone Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 text-sm transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Add Button */}
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Contact
        </button>
      </form>

      {/* Quick Tips */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-2">
        <p>💡 Tip: You can add multiple contacts one by one or use CSV upload for bulk import</p>
      </div>
    </div>
  );
}

export default ContactEntryForm;
