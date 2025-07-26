import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function UnifiedAuthPage({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-blue-50 dark:from-dark-bg dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-whatsapp-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
              <path d="M8 9h8M8 13h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            WhatsApp Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
          {isLogin && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Choose your role to access the appropriate dashboard
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              isLogin
                ? 'bg-white dark:bg-gray-700 text-whatsapp-600 dark:text-whatsapp-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              !isLogin
                ? 'bg-white dark:bg-gray-700 text-whatsapp-600 dark:text-whatsapp-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
          {isLogin ? (
            <LoginForm onLogin={onLogin} />
          ) : (
            <RegisterForm role="user" onRegister={onRegister} />
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Want to become an admin?{' '}
            <Link
              to="/admin-request"
              className="text-whatsapp-500 hover:text-whatsapp-600 font-medium"
            >
              Request admin access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UnifiedAuthPage; 