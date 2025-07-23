// src/components/BulkMessage/ContactEntryForm.js
import React, { useState } from 'react';

function ContactEntryForm({ onAdd }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !number.trim()) {
      alert('Both name and phone number are required');
      return;
    }
    onAdd({ name: name.trim(), number: number.trim() });
    setName('');
    setNumber('');
  };

  return (
    <div style={{ padding: 20, background: '#F7F8FA', borderRadius: 12, border: '2px solid #E4E6EA', marginBottom: 16 }}>
      <h4 style={{ color: '#1F2937', marginBottom: 16, fontWeight: 700 }}>Manual Contact Entry</h4>
      
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '8px 16px',
          background: '#25D366',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: showForm ? 16 : 0
        }}
      >
        {showForm ? 'Hide Contact Form' : 'Add Contact Manually'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                border: '2px solid #E4E6EA',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                border: '2px solid #E4E6EA',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button 
            type="submit" 
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
        </form>
      )}
    </div>
  );
}

export default ContactEntryForm;
