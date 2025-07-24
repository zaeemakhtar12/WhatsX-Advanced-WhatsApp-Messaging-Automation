import React, { useState, useEffect } from 'react';
import { getMessages, deleteMessage } from '../api';

// Icons
const MessageIcon = ({ size = 20, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={color}/>
    <path d="M8 9h8M8 13h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronLeftIcon = ({ size = 16, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="15,18 9,12 15,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = ({ size = 16, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="9,18 15,12 9,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatusIcon = ({ status, size = 12 }) => {
  const colors = {
    sent: '#10B981',
    delivered: '#3B82F6', 
    failed: '#DC2626',
    pending: '#F59E0B'
  };
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: colors[status] || colors.pending
    }} />
  );
};

function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div className="animate-slideIn" style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: type === 'success' ? '#25D366' : type === 'error' ? '#DC2626' : '#3B82F6',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: 12,
      boxShadow: `0 4px 20px ${type === 'success' ? 'rgba(37, 211, 102, 0.3)' : type === 'error' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 14,
      minWidth: 200,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {type === 'success' && '✅'}
      {type === 'error' && '❌'}
      {type === 'info' && 'ℹ️'}
      {message}
      <button onClick={onClose} style={{
        marginLeft: 8,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        opacity: 0.8
      }}>×</button>
    </div>
  );
}

function MessageLog() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const messagesPerPage = 10;

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
  };

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
      showNotification('Failed to fetch messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMessage(messageId);
      showNotification('Message deleted successfully');
      fetchMessages(); // Refresh the list
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('Failed to delete message', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMessages();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getMessageTypeIcon = (type) => {
    const styles = {
      regular: { bg: '#DCFCE7', color: '#166534', text: 'MSG' },
      bulk: { bg: '#DBEAFE', color: '#1E40AF', text: 'BULK' },
      template: { bg: '#F3E8FF', color: '#7C3AED', text: 'TMPL' },
      scheduled: { bg: '#FEF3C7', color: '#92400E', text: 'SCHD' }
    };
    
    const style = styles[type] || styles.regular;
    
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 6px',
        borderRadius: 4,
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {style.text}
      </span>
    );
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
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return '#10B981';
      case 'delivered': return '#3B82F6';
      case 'failed': return '#DC2626';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        padding: isMobile ? '16px' : '24px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: isMobile ? '20px' : '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #10B981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6B7280' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
      padding: isMobile ? '16px' : '24px'
    }}>
      <Notification 
        message={notification} 
        type={notificationType}
        onClose={() => setNotification('')} 
      />

      {/* Header */}
      <div className="animate-slideIn" style={{
        background: '#fff',
        borderRadius: 16,
        padding: isMobile ? '20px' : '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            padding: '12px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageIcon size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 700,
              color: '#1F2937',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Message Log
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6B7280',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              View and manage your message history
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            border: '1px solid #86EFAC',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#166534',
              marginBottom: '4px'
            }}>
              {pagination.total || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#166534',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Total Messages
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            border: '1px solid #93C5FD',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#1E40AF',
              marginBottom: '4px'
            }}>
              {pagination.page || 1}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#1E40AF',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Current Page
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #FCD34D',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#92400E',
              marginBottom: '4px'
            }}>
              {pagination.totalPages || 1}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#92400E',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Total Pages
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <form onSubmit={handleSearch} style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by recipient, message content, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                border: '2px solid #E5E7EB',
                borderRadius: 12,
                fontSize: '14px',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10B981'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <SearchIcon />
            </div>
          </div>

          {/* Message Type Filter */}
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #E5E7EB',
              borderRadius: 12,
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="bulk">Bulk</option>
            <option value="template">Template</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-ripple"
            style={{
              background: '#10B981',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: isMobile ? '100%' : 'auto'
            }}
          >
            <SearchIcon size={16} color="#fff" />
            {!isMobile && 'Search'}
          </button>
        </form>

        {/* Clear Filters */}
        {(searchTerm || messageType) && (
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setMessageType('');
                setCurrentPage(1);
              }}
              style={{
                background: '#F3F4F6',
                color: '#6B7280',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Messages List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6B7280'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E5E7EB',
              borderTop: '3px solid #10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <MessageIcon size={48} color="#D1D5DB" />
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', fontWeight: 500 }}>
              {searchTerm || messageType ? 'No messages match your search criteria' : 'No messages found'}
            </p>
            {(searchTerm || messageType) && (
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map(message => {
              const { date, time } = formatDate(message.sentAt || message.createdAt);
              
              return (
                <div
                  key={message._id}
                  className="hover-lift"
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '4px'
                      }}>
                        {message.recipientName || 'Unknown'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6B7280'
                      }}>
                        {message.recipient}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(message._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: 4
                      }}
                      title="Delete Message"
                    >
                      <DeleteIcon />
                    </button>
                  </div>

                  {/* Message Content */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: 1.4,
                    maxHeight: '80px',
                    overflowY: 'auto'
                  }}>
                    {message.message}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getMessageTypeIcon(message.messageType)}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <StatusIcon status={message.status} />
                        <span style={{
                          fontSize: '12px',
                          color: getStatusColor(message.status),
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      textAlign: 'right'
                    }}>
                      <div>{date}</div>
                      <div>{time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop Table View
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr 120px 80px',
              gap: '16px',
              padding: '16px 20px',
              background: '#F9FAFB',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div>Recipient</div>
              <div>Phone</div>
              <div>Message</div>
              <div>Type</div>
              <div>Status</div>
              <div>Date/Time</div>
              <div style={{ textAlign: 'center' }}>Action</div>
            </div>

            {/* Table Body */}
            {messages.map((message, index) => {
              const { date, time } = formatDate(message.sentAt || message.createdAt);
              
              return (
                <div
                  key={message._id}
                  className="hover-lift"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr 120px 80px',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: index < messages.length - 1 ? '1px solid #F3F4F6' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {/* Recipient Name */}
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1F2937'
                    }}>
                      {message.recipientName || 'Unknown'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{
                    fontSize: '13px',
                    color: '#6B7280'
                  }}>
                    {message.recipient}
                  </div>

                  {/* Message */}
                  <div style={{
                    fontSize: '13px',
                    color: '#374151',
                    maxHeight: '40px',
                    overflowY: 'auto',
                    lineHeight: 1.4
                  }}>
                    {message.message}
                  </div>

                  {/* Type */}
                  <div>
                    {getMessageTypeIcon(message.messageType)}
                  </div>

                  {/* Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <StatusIcon status={message.status} />
                    <span style={{
                      fontSize: '12px',
                      color: getStatusColor(message.status),
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {message.status}
                    </span>
                  </div>

                  {/* Date/Time */}
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    <div style={{ fontWeight: 600 }}>{date}</div>
                    <div>{time}</div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleDelete(message._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 4
                      }}
                      title="Delete Message"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px',
            padding: '20px 0'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                background: currentPage === 1 ? '#F3F4F6' : '#fff',
                color: currentPage === 1 ? '#9CA3AF' : '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <ChevronLeftIcon />
              Previous
            </button>

            {/* Page Numbers */}
            <div style={{
              display: 'flex',
              gap: '4px'
            }}>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      background: isActive ? '#10B981' : '#fff',
                      color: isActive ? '#fff' : '#374151',
                      border: `1px solid ${isActive ? '#10B981' : '#E5E7EB'}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              style={{
                background: currentPage === pagination.totalPages ? '#F3F4F6' : '#fff',
                color: currentPage === pagination.totalPages ? '#9CA3AF' : '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Next
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageLog; 