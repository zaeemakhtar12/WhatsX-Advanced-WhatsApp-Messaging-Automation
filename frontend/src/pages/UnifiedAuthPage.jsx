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
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                {/* WhatsApp logo shape */}
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="white"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhatsX</h1>
          </div>
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