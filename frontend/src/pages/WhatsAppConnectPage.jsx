import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startWhatsAppSession, getWhatsAppStatus, stopWhatsAppSession } from '../api';

export default function WhatsAppConnectPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('not_connected');
  const [qrCode, setQrCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastStatusRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const willRedirectRef = useRef(false);

  useEffect(() => {
    checkStatus();
    // Poll status every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    return () => {
      clearInterval(interval);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const checkStatus = async () => {
    try {
      const res = await getWhatsAppStatus();
      const data = res.data;
      setStatus(data.status);
      setQrCode(data.qrCode);
      setPhoneNumber(data.phoneNumber);

      // Only redirect after a fresh connection within this visit
      const prev = lastStatusRef.current;
      const isFreshTransition = prev && prev !== 'connected' && data.status === 'connected' && !!data.phoneNumber;
      if (isFreshTransition && !willRedirectRef.current) {
        willRedirectRef.current = true;
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      lastStatusRef.current = data.status;
    } catch (e) {
      console.error('Failed to check status:', e);
    }
  };

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError('');
      await startWhatsAppSession();
      await checkStatus();
    } catch (e) {
      setError(e.message || 'Failed to start WhatsApp session');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    try {
      setLoading(true);
      await stopWhatsAppSession();
      setStatus('not_connected');
      setQrCode(null);
      setPhoneNumber(null);
    } catch (e) {
      setError(e.message || 'Failed to stop WhatsApp session');
    } finally {
      setLoading(false);
    }
  };

  const renderQRCode = () => {
    if (!qrCode) return null;
    
    // Check if qrCode is a data URL (image) or text
    const isImage = qrCode.startsWith('data:image/');
    
    return (
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          {isImage ? (
            <img 
              src={qrCode} 
              alt="WhatsApp QR Code" 
              className="w-64 h-64 mx-auto"
            />
          ) : (
            <div 
              className="qr-code"
              dangerouslySetInnerHTML={{ 
                __html: qrCode.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;') 
              }}
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '8px', 
                lineHeight: '8px',
                whiteSpace: 'pre'
              }}
            />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Scan this QR code with your WhatsApp mobile app
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          <p>1. Open WhatsApp on your phone</p>
          <p>2. Tap Menu → Linked Devices</p>
          <p>3. Tap "Link a Device"</p>
          <p>4. Scan the QR code above</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Connect WhatsApp</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your personal WhatsApp to send messages from your own number.
        </p>
        
        {error && (
          <div className="text-red-600 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        {status === 'not_connected' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">WhatsApp Not Connected</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your personal WhatsApp to start sending messages.
            </p>
            <button 
              onClick={handleStartSession}
              disabled={loading}
              className="w-full py-3 px-6 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Starting...' : 'Connect WhatsApp'}
            </button>
          </div>
        )}

        {status === 'qr_ready' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use your WhatsApp mobile app to scan the QR code below.
              </p>
            </div>
            {renderQRCode()}
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleStopSession}
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={checkStatus}
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Check Status
              </button>
            </div>
          </div>
        )}

        {status === 'connected' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-600">WhatsApp Connected!</h3>
            {phoneNumber && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connected as: +{phoneNumber}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You can now send messages from your personal WhatsApp number.
            </p>
            {willRedirectRef.current && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  🎉 Success! Redirecting to dashboard in a moment...
                </p>
              </div>
            )}
            <button 
              onClick={handleStopSession}
              disabled={loading}
              className="w-full py-3 px-6 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
            </button>
          </div>
        )}

        {status === 'initializing' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Initializing...</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up WhatsApp connection...
            </p>
          </div>
        )}

        {status === 'auth_failed' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Authentication Failed</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Failed to authenticate with WhatsApp. Please try again.
            </p>
            <button 
              onClick={handleStartSession}
              disabled={loading}
              className="w-full py-3 px-6 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
