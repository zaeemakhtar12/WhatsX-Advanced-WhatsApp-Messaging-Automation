// src/components/Sidebar.js
import React from 'react';

function Sidebar({ role, onSelect }) {
  return (
    <div style={{ width: '200px', background: '#f4f4f4', padding: '20px' }}>
      <h3>Menu</h3>
      <button onClick={() => onSelect('messages')}>Bulk Message</button>
      <button onClick={() => onSelect('scheduled')}>Scheduled</button>
      {role === 'admin' && (
        <>
          <button onClick={() => onSelect('users')}>Manage Users</button>
          <button onClick={() => onSelect('templates')}>Manage Templates</button>
        </>
      )}
    </div>
  );
}

export default Sidebar;
