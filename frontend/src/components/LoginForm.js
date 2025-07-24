import React, { useState } from 'react';
import { login } from '../api';

function LoginForm({ onLogin, role = 'user' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, role });
      const response = await login({ email, password, role });
      console.log('Login response:', response);
      
      if (response.token) {
        console.log('Token received:', response.token.substring(0, 20) + '...');
        // Store token and role
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role || role);
        
        console.log('Token stored in localStorage');
        console.log('Stored token:', localStorage.getItem('token')?.substring(0, 20) + '...');
        console.log('Stored role:', localStorage.getItem('role'));
        
        // Call the onLogin callback with the role
        if (onLogin) {
          console.log('Calling onLogin with role:', response.role || role);
          onLogin(response.role || role);
        }
      } else {
        console.error('No token in response:', response);
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error during login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <div style={{
          color: '#DC2626',
          background: '#FEE2E2',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={loading}
        style={{
          ...inputStyle,
          opacity: loading ? 0.6 : 1
        }}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        disabled={loading}
        style={{
          ...inputStyle,
          opacity: loading ? 0.6 : 1
        }}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Logging in...' : `Login as ${role === 'admin' ? 'Admin' : 'User'}`}
      </button>
    </form>
  );
}

const inputStyle = {
  display: 'block',
  margin: '10px auto',
  padding: '12px',
  width: '100%',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '14px'
};

const buttonStyle = {
  padding: '12px 20px',
  marginTop: '15px',
  backgroundColor: '#25D366',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  fontSize: '16px',
  fontWeight: 600,
  transition: 'background-color 0.2s ease'
};

export default LoginForm;