// src/components/BulkMessage/ContactCSVUpload.js
import React, { useState } from 'react';

function ContactCSVUpload({ onContactsLoaded }) {
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const lines = evt.target.result.split('\n');
        const contacts = lines
          .slice(1) // Skip header line
          .map((line, index) => {
            const [name, phone] = line.trim().split(',');
            return name && phone ? { 
              id: Date.now() + index,
              name: name.trim(), 
              phone: phone.trim() 
            } : null;
          })
          .filter(Boolean);

        onContactsLoaded(contacts);
        alert(`Successfully imported ${contacts.length} contacts!`);
      } catch (error) {
        alert('Error reading CSV file. Please check the format.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="card p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import from CSV</h4>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            CSV format: name,phone (with headers)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Example: John Doe,+1234567890
          </p>
        </div>
        
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
            </div>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSV} 
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
        
        {fileName && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300">
              {isUploading ? 'Processing...' : `File uploaded: ${fileName}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactCSVUpload;
