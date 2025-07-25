

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLogin }) {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-blue-50 dark:from-dark-bg dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            Logging in as {role === 'admin' ? 'Administrator' : 'User'}
          </p>
        </div>

        <LoginForm onLogin={onLogin} />

        <div className="text-center mt-6 space-y-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Wrong role? 
            <Link 
              to="/" 
              className="ml-1 text-whatsapp-500 hover:text-whatsapp-600 font-medium"
            >
              Go back to role selection
            </Link>
          </p>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account? 
            <Link 
              to="/register" 
              className="ml-1 text-whatsapp-500 hover:text-whatsapp-600 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;