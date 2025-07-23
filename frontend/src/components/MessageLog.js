import React, { useState, useEffect } from 'react';

function MessageLog() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/logs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Message logs response:', data);
      
      if (data.messages) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load message logs');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || msg.messageType === filterType;
    const matchesStatus = filterStatus === '' || msg.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return '#4CAF50';
      case 'delivered': return '#2196F3';
      case 'failed': return '#f44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getTypeIcon = (messageType) => {
    switch (messageType) {
      case 'whatsapp_message': return '📱';
      case 'whatsapp_template': return '📋';
      case 'bulk_whatsapp_template': return '📊';
      case 'regular': return '💬';
      default: return '📧';
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading message logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: '#f44336', fontSize: '16px' }}>{error}</div>
        <button onClick={fetchMessages} style={buttonStyle}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#222', margin: 0 }}>Message Logs</h2>
        <button onClick={fetchMessages} style={buttonStyle}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {/* Search */}
        <div>
          <label style={labelStyle}>Search Messages</label>
          <input
            type="text"
            placeholder="Search by message or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Message Type Filter */}
        <div>
          <label style={labelStyle}>Message Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle}>
            <option value="">All Types</option>
            <option value="whatsapp_message">WhatsApp Message</option>
            <option value="whatsapp_template">WhatsApp Template</option>
            <option value="bulk_whatsapp_template">Bulk Template</option>
            <option value="regular">Regular</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={labelStyle}>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle}>
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button onClick={clearFilters} style={{ ...buttonStyle, backgroundColor: '#666' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: '15px', color: '#666' }}>
        Showing {currentMessages.length} of {filteredMessages.length} messages
        {filteredMessages.length !== messages.length && ` (filtered from ${messages.length} total)`}
      </div>

      {/* Messages Table */}
      {currentMessages.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          color: '#666' 
        }}>
          {messages.length === 0 ? 'No messages found.' : 'No messages match your filters.'}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Recipient</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Details</th>
                </tr>
              </thead>
              <tbody>
                {currentMessages.map((msg) => (
                  <tr key={msg._id} style={rowStyle}>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '14px' }}>{formatDate(msg.timestamp)}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{getTypeIcon(msg.messageType)}</span>
                        <span style={{ fontSize: '12px' }}>
                          {msg.messageType === 'whatsapp_message' ? 'WhatsApp' :
                           msg.messageType === 'whatsapp_template' ? 'Template' :
                           msg.messageType === 'bulk_whatsapp_template' ? 'Bulk Template' :
                           'Regular'}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500' }}>{msg.recipient}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ 
                        maxWidth: '200px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontSize: '14px'
                      }}>
                        {msg.message}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: getStatusColor(msg.status)
                      }}>
                        {(msg.status || 'sent').toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {msg.twilioSid && (
                          <div>SID: {msg.twilioSid.substring(0, 10)}...</div>
                        )}
                        {msg.templateName && (
                          <div>Template: {msg.templateName}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: '20px',
              gap: '10px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...buttonStyle,
                  backgroundColor: currentPage === 1 ? '#ccc' : '#00b86b',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: currentPage === pageNum ? '#00b86b' : '#f5f5f5',
                      color: currentPage === pageNum ? '#fff' : '#333',
                      minWidth: '35px',
                      padding: '6px 8px'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...buttonStyle,
                  backgroundColor: currentPage === totalPages ? '#ccc' : '#00b86b',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Styles
const labelStyle = {
  display: 'block',
  fontWeight: '600',
  color: '#333',
  marginBottom: '5px',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'inherit'
};

const buttonStyle = {
  backgroundColor: '#00b86b',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#333',
  borderBottom: '2px solid #e0e0e0',
  fontSize: '14px'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
  color: '#555'
};

const rowStyle = {
  '&:hover': {
    backgroundColor: '#f9f9f9'
  }
};

export default MessageLog; 