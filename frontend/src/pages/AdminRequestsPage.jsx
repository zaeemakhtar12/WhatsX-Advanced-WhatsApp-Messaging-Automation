import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';

function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get('/admin-requests');
      setRequests(data);
    } catch (err) {
      setError('Failed to load admin requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setError('');
    try {
      await apiClient.post(`/admin-requests/${id}/${action}`);
      await fetchRequests();
    } catch (err) {
      setError('Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="card p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Access Requests</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center">No admin requests found.</p>
            ) : (
              requests.map(req => (
                <div key={req._id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50 dark:bg-dark-surface">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{req.name} ({req.email})</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{req.message}</div>
                    <div className="text-xs text-gray-400">Requested: {new Date(req.createdAt).toLocaleString()}</div>
                    <div className="text-xs mt-1">
                      Status: <span className={
                        req.status === 'pending' ? 'text-yellow-600' :
                        req.status === 'approved' ? 'text-green-600' : 'text-red-600'
                      }>{req.status}</span>
                    </div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        className="btn-primary"
                        disabled={actionLoading}
                        onClick={() => handleAction(req._id, 'approve')}
                      >
                        {actionLoading === req._id + 'approve' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        className="btn-danger"
                        disabled={actionLoading}
                        onClick={() => handleAction(req._id, 'reject')}
                      >
                        {actionLoading === req._id + 'reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRequestsPage; 