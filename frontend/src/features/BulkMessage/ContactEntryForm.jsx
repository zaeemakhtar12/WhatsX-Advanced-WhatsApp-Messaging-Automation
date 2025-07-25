// src/components/BulkMessage/ContactEntryForm.js
import React, { useState } from 'react';

function ContactEntryForm({ onAdd }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Both name and phone number are required');
      return;
    }
    onAdd({ name: name.trim(), phone: phone.trim() });
    setName('');
    setPhone('');
    alert('Contact added successfully!');
  };

  return (
    <div className="card p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manual Contact Entry</h4>
      
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="btn-primary mb-4"
      >
        {showForm ? 'Hide Contact Form' : 'Add Contact Manually'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit" 
              className="btn-primary w-full"
            >
              Add Contact
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ContactEntryForm;
