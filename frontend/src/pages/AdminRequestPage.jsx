import React, { useState } from 'react';
import apiClient from '../utils/apiClient';

function AdminRequestPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    reasonForAdminAccess: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await apiClient.post('/admin-request', formData);
      setSuccess(true);
      setFormData({
        username: '',
        email: '',
        password: '',
        businessName: '',
        businessType: '',
        reasonForAdminAccess: '',
        contactNumber: ''
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit admin request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Request Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your admin access request has been submitted successfully. Our team will review your request and send you an email notification once it's processed.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="btn-primary"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Request Admin Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill out the form below to request admin access to WhatsX. Our team will review your request and contact you via email.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Create a secure password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business/Organization Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select business type</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Marketing Agency">Marketing Agency</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Restaurant/Food">Restaurant/Food</option>
                <option value="Technology">Technology</option>
                <option value="Non-profit">Non-profit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter your contact number"
            />
          </div>

          <div>
            <label htmlFor="reasonForAdminAccess" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Admin Access *
            </label>
            <textarea
              id="reasonForAdminAccess"
              name="reasonForAdminAccess"
              value={formData.reasonForAdminAccess}
              onChange={handleChange}
              required
              rows={5}
              className="input-field"
              placeholder="Please explain why you need admin access, how you plan to use the platform, and any relevant experience you have..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 10 characters required. Be specific about your use case.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Your request will be reviewed by our admin team</li>
              <li>• You'll receive an email notification within 24-48 hours</li>
              <li>• If approved, you'll get login credentials and admin access</li>
              <li>• If more information is needed, we'll contact you directly</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting Request...</span>
              </>
            ) : (
              <span>Submit Admin Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRequestPage; 