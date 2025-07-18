// src/components/BulkMessage/ContactCSVUpload.js
import React from 'react';

function ContactCSVUpload({ onImport }) {
  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split('\n');
      const contacts = lines
        .map(line => {
          const [name, number] = line.trim().split(',');
          return name && number ? { name, number } : null;
        })
        .filter(Boolean);

      onImport(contacts);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h4>Import from CSV</h4>
      <input type="file" accept=".csv" onChange={handleCSV} />
    </div>
  );
}

export default ContactCSVUpload;
