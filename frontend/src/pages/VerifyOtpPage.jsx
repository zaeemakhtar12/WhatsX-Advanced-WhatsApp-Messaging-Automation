import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

function VerifyOtpPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiClient.post('/verify-otp', { email, otp });
      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="card p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400 text-center">
          Enter the verification code sent to your email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">OTP Code</label>
            <input
              type="text"
              className="input-field"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtpPage; 