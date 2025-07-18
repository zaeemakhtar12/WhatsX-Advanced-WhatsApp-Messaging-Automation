// src/features/BulkMessage/BulkMessagePage.js
import React, { useState } from 'react';
import axios from 'axios';
import ContactEntryForm from './ContactEntryForm';
import ContactCSVUpload from './ContactCSVUpload';

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: '#00b86b',
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

function BulkMessagePage() {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');

  const token = localStorage.getItem('token');

  const handleManualAdd = (newContact) => {
    // Normalize phone numbers for case-insensitive and formatting-insensitive comparison
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

  const handleSend = async () => {
    if (!message.trim() || contacts.length === 0) {
      setNotification('Please add contacts and a message.');
      return;
    }
    try {
      await Promise.all(
        contacts.map(contact =>
          axios.post(
            "http://localhost:5000/api/send",
            {
              recipient: {
                name: contact.name,
                phone: contact.number,
              },
              message,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )
        )
      );
      setNotification('Messages sent!');
      setContacts([]);
      setMessage('');
    } catch (error) {
      console.error('Error sending messages:', error);
      let errorMsg = 'Failed to send messages.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg += ` Server says: ${error.response.data.message}`;
      } else if (error.message) {
        errorMsg += ` Error: ${error.message}`;
      }
      setNotification(errorMsg);
    }
  };

  return (
    <>
      <Notification message={notification} onClose={() => setNotification('')} />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0ffe8 0%, #00ff90 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,255,144,0.10)', padding: '44px 38px', minWidth: 340, maxWidth: 520, width: '100%', border: '2px solid #00ff90' }}>
          <h2 style={{ color: '#00b86b', marginBottom: 24, fontWeight: 800, fontSize: 28, letterSpacing: 1, textAlign: 'center' }}>Bulk Messaging</h2>
          <div style={{ marginBottom: 24 }}>
            <ContactEntryForm onAdd={handleManualAdd} />
            <ContactCSVUpload onImport={handleCSVImport} />
          </div>
          <div style={{ margin: '20px 0' }}>
            <h4 style={{ marginBottom: 8, color: '#00b86b', fontWeight: 700 }}>Message</h4>
            <textarea
              rows="4"
              cols="50"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #00ff90', fontSize: '16px', marginBottom: '12px', resize: 'vertical', background: '#f6fff8' }}
            />
            <button onClick={handleSend} style={{ display: 'block', margin: '0 auto', backgroundColor: '#00b86b', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '17px', boxShadow: '0 2px 8px rgba(0,255,144,0.10)', transition: 'background 0.2s' }}>Send Message</button>
          </div>
          <div style={{ marginTop: 24 }}>
            <h4 style={{ color: '#00b86b', fontWeight: 700 }}>Contacts Preview ({contacts.length})</h4>
            <ul style={{ paddingLeft: 18 }}>
              {contacts.map((c, idx) => (
                <li key={idx} style={{ fontSize: '15px', marginBottom: '4px', color: '#222' }}>{c.name} - {c.number}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default BulkMessagePage;
