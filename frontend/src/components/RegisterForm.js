import React, { useState } from 'react';
import { register } from '../api';

function RegisterForm({ role }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ username, email, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        alert(`${role.toUpperCase()} registered successfully`);
      } else {
        alert(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error during registration');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={inputStyle}
      />
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
      <button type="submit" style={buttonStyle}>Register</button>
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

export default RegisterForm;
