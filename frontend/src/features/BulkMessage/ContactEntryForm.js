// src/components/BulkMessage/ContactEntryForm.js
import React, { useState } from 'react';

function ContactEntryForm({ onAdd }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !number) return alert('Both fields required');
    onAdd({ name, number });
    setName('');
    setNumber('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h4>Manual Contact Entry</h4>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={styles.input}
      />
      <input
        placeholder="Phone Number"
        value={number}
        onChange={e => setNumber(e.target.value)}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>Add</button>
    </form>
  );
}

const styles = {
  form: { display: 'flex', gap: 10, alignItems: 'center' },
  input: { padding: 8, width: 150 },
  button: { padding: '8px 16px' }
};

export default ContactEntryForm;
