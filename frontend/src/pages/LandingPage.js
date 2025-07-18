import React from 'react';

function LandingPage({ onSelect }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h2>Welcome to WhatsX</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px' }}>
        <div
          style={{ border: '1px solid #ccc', padding: '20px', width: '150px', cursor: 'pointer' }}
          onClick={() => onSelect('user')}
        >
          <h3>User</h3>
        </div>
        <div
          style={{ border: '1px solid #ccc', padding: '20px', width: '150px', cursor: 'pointer' }}
          onClick={() => onSelect('admin')}
        >
          <h3>Admin</h3>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
