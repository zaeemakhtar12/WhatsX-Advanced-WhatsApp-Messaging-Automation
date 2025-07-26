import React, { useState } from 'react';
import apiClient from '../utils/apiClient';

function AdminRequestPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiClient.post('/admin-request', { name, email, message });
      setSuccess('Request sent to Team WhatsX. Waiting for approval.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="card p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Access Request</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400 text-center">
          Fill out the form to request admin access. Your request will be reviewed by Team WhatsX.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason / Message</label>
            <textarea
              className="input-field"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Why do you need admin access?"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRequestPage; 