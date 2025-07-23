import React, { useState } from 'react';
import { login } from '../api';

function LoginForm({ onLogin, role = 'user' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password, role });
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.role) {
          localStorage.setItem('role', response.role);
        }
        alert(`${response.role ? response.role.toUpperCase() : role.toUpperCase()} logged in successfully`);
        onLogin && onLogin(response.role || role);
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error during login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>Login</button>
    </form>
  );
}

const inputStyle = {
  display: 'block',
  margin: '10px auto',
  padding: '10px',
  width: '200px'
};

const buttonStyle = {
  padding: '8px 16px',
  marginTop: '10px',
  backgroundColor: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
};

export default LoginForm;