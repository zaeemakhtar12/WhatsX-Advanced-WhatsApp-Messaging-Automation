import React, { useState, useEffect } from 'react';
import { getMessages, deleteMessage } from '../api';

function MessageLog() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [notification, setNotification] = useState('');

  const messagesPerPage = 10;

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchMessages();
  }, [currentPage, searchTerm, messageType]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(currentPage, messagesPerPage, searchTerm, messageType);
      
      if (response && response.messages) {
        setMessages(response.messages);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setNotification('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        setNotification('Message deleted successfully');
        fetchMessages(); // Refresh the list
      } catch (error) {
        console.error('Error deleting message:', error);
        setNotification('Failed to delete message');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMessages();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total) {
      setCurrentPage(newPage);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'regular': return 'MSG';
      case 'bulk': return 'BULK';
      case 'template': return 'TMPL';
      case 'scheduled': return 'SCHD';
      default: return 'MSG';
    }
  };

  const getMessageTypeLabel = (type) => {
    switch (type) {
      case 'regular': return 'Regular';
      case 'bulk': return 'Bulk';
      case 'template': return 'Template';
      case 'scheduled': return 'Scheduled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

      if (loading && currentPage === 1) {
      return (
        <div style={{ padding: '24px 24px 24px 48px', textAlign: 'center', background: '#F0F2F5' }}>
          <div style={{ fontSize: 18, color: '#6B7280' }}>Loading messages...</div>
        </div>
      );
    }

  return (
    <div style={{ padding: '24px 24px 24px 48px', maxWidth: 1200, margin: '0 auto', background: '#F0F2F5' }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: notification.includes('Failed') ? '#DC2626' : '#25D366',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: notification.includes('Failed') 
            ? '0 2px 10px rgba(220, 38, 38, 0.3)' 
            : '0 2px 10px rgba(37, 211, 102, 0.3)',
          zIndex: 1000
        }}>
          {notification}
          <button 
            onClick={() => setNotification('')}
            style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <h2 style={{ color: '#1F2937', marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Message Log</h2>

      {/* Search and Filter */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 12, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: 24,
        border: '2px solid #E4E6EA'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Search Messages
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipient, message content, or name..."
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '2px solid #E4E6EA', 
                borderRadius: 6, 
                fontSize: 14 
              }}
            />
          </div>
          
          <div style={{ minWidth: 150 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '2px solid #E4E6EA', 
                borderRadius: 6, 
                fontSize: 14 
              }}
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="bulk">Bulk</option>
              <option value="template">Template</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setMessageType('');
              setCurrentPage(1);
              fetchMessages();
            }}
            style={{
              padding: '12px 24px',
              background: '#6B7280',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '2px solid #E4E6EA'
      }}>
        {messages.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#25D366' }}>No Messages</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No messages found</div>
            <div style={{ fontSize: 14 }}>
              {searchTerm || messageType ? 'Try adjusting your search criteria' : 'Send your first message to see it here!'}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '50px 1fr 150px 120px 100px 80px', 
              gap: 12,
              padding: '16px 20px',
              background: '#F7F8FA',
              borderBottom: '2px solid #E4E6EA',
              fontWeight: 600,
              fontSize: 14,
              color: '#374151'
            }}>
              <div>Type</div>
              <div>Message Details</div>
              <div>Recipient</div>
              <div>Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div 
                key={msg._id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '50px 1fr 150px 120px 100px 80px', 
                  gap: 12,
                  padding: '16px 20px',
                  borderBottom: '1px solid #E4E6EA',
                  alignItems: 'center',
                  fontSize: 14
                }}
              >
                <div style={{ 
                  fontSize: 10, 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  color: '#fff',
                  background: '#25D366',
                  padding: '4px',
                  borderRadius: 4
                }}>
                  {getMessageTypeIcon(msg.messageType)}
                </div>
                
                <div>
                  <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>
                    {msg.recipientName || 'Unknown'}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.4 }}>
                    {msg.message.length > 80 ? `${msg.message.substring(0, 80)}...` : msg.message}
                  </div>
                </div>
                
                <div style={{ color: '#374151', fontSize: 13 }}>
                  {msg.recipient}
                </div>
                
                <div style={{ color: '#6B7280', fontSize: 12 }}>
                  {formatDate(msg.createdAt)}
                </div>
                
                <div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: msg.status === 'sent' ? '#DCFCE7' : 
                               msg.status === 'delivered' ? '#DCFCE7' :
                               msg.status === 'failed' ? '#FEE2E2' : '#F3F4F6',
                    color: msg.status === 'sent' ? '#166534' : 
                           msg.status === 'delivered' ? '#166534' :
                           msg.status === 'failed' ? '#991B1B' : '#6B7280'
                  }}>
                    {getMessageTypeLabel(msg.messageType)}
                  </span>
                </div>
                
                <div>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    style={{
                      padding: '6px 8px',
                      background: '#DC2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    title="Delete message"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 12, 
          marginTop: 24,
          padding: 20
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: currentPage === 1 ? '#E5E7EB' : '#25D366',
              color: currentPage === 1 ? '#9CA3AF' : '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            Previous
          </button>
          
          <span style={{ color: '#6B7280', fontSize: 14 }}>
            Page {pagination.current || currentPage} of {pagination.total || 1}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.total}
            style={{
              padding: '8px 16px',
              background: currentPage === pagination.total ? '#E5E7EB' : '#25D366',
              color: currentPage === pagination.total ? '#9CA3AF' : '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: currentPage === pagination.total ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      {pagination.totalRecords > 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#6B7280', 
          fontSize: 14, 
          marginTop: 16 
        }}>
          Showing {pagination.count || 0} of {pagination.totalRecords || 0} messages
        </div>
      )}
    </div>
  );
}

export default MessageLog; 