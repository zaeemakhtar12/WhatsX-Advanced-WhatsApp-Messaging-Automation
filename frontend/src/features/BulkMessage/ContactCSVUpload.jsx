// src/components/BulkMessage/ContactCSVUpload.js
import React, { useState } from 'react';
import { useNotification } from '../../components/NotificationSystem';

const UploadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ContactCSVUpload({ onContactsLoaded }) {
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { showSuccess, showError } = useNotification();

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
        showSuccess(`Successfully imported ${contacts.length} contacts!`);
      } catch (error) {
        showError('Error reading CSV file. Please check the format.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UploadIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Import from CSV</h4>
      </div>
      
      <div className="space-y-3">
        {/* File Upload Area */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200">
            <div className="flex flex-col items-center justify-center">
              <UploadIcon className="w-6 h-6 mb-2 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">CSV files only</p>
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
        
        {/* File Status */}
        {fileName && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
            <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300">
              {isUploading ? 'Processing...' : `Uploaded: ${fileName}`}
            </span>
          </div>
        )}

        {/* Format Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-2">
          <p className="font-medium mb-1">CSV Format:</p>
          <p>• First row: name,phone (headers)</p>
          <p>• Example: John Doe,+1234567890</p>
        </div>
      </div>
    </div>
  );
}

export default ContactCSVUpload;
