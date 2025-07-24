import React, { useState, useEffect } from 'react';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTemplateStats 
} from '../api';

// Icons
const TemplateIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="10,9 9,9 8,9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = ({ size = 20, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ size = 16, color = '#3B82F6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = ({ size = 16, color = '#10B981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GridIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = ({ size = 20, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="8" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="3.01" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="12" x2="3.01" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="18" x2="3.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = ({ size = 16, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="19" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12,19 5,12 12,5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [categories] = useState([
    'Marketing', 'Customer Service', 'Notifications', 'Reminders', 
    'Welcome', 'Follow-up', 'Promotional', 'Support', 'General'
  ]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [stats, setStats] = useState({});
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    content: '',
    description: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchStats();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, filterCategory, searchTerm]);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getTemplates();
      
      // Backend returns templates directly as an array
      if (Array.isArray(response)) {
        setTemplates(response);
      } else if (response && response.templates) {
        // Fallback for different response format
        setTemplates(response.templates);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showNotification(error.message || 'Error loading templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTemplateStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;
    
    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim() || !formData.category) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingTemplate) {
        const response = await updateTemplate(editingTemplate._id, formData);
        showNotification('Template updated successfully');
      } else {
        const response = await createTemplate(formData);
        showNotification('Template created successfully');
      }
      
      setFormData({ name: '', category: '', content: '', description: '' });
      setCurrentView('list');
      setEditingTemplate(null);
      fetchTemplates();
      fetchStats();
    } catch (error) {
      console.error('Error saving template:', error);
      console.error('Error details:', error.message);
      showNotification(error.message || 'Error saving template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      description: template.description || ''
    });
    setCurrentView('edit');
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      showNotification('Template deleted successfully');
      fetchTemplates();
      fetchStats();
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification('Error deleting template', 'error');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Marketing': { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
      'Customer Service': { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
      'Notifications': { bg: '#FCE7F3', color: '#BE185D', border: '#F9A8D4' },
      'Reminders': { bg: '#FED7D7', color: '#C53030', border: '#FEB2B2' },
      'Welcome': { bg: '#C6F6D5', color: '#2F855A', border: '#9AE6B4' },
      'Follow-up': { bg: '#E9D8FD', color: '#6B46C1', border: '#C4B5FD' },
      'Promotional': { bg: '#FEEBC8', color: '#C05621', border: '#F6AD55' },
      'Support': { bg: '#BEE3F8', color: '#2C5282', border: '#90CDF4' },
      'General': { bg: '#F7FAFC', color: '#4A5568', border: '#CBD5E0' }
    };
    return colors[category] || colors['General'];
  };

  const getCategoryStats = () => {
    const categoryStats = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});
    return categoryStats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
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
          justifyContent: 'space-between',
          marginBottom: currentView === 'list' ? '24px' : '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentView !== 'list' && (
              <button
                onClick={() => {
                  setCurrentView('list');
                  setEditingTemplate(null);
                  setFormData({ name: '', category: '', content: '', description: '' });
                }}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BackIcon />
              </button>
            )}

            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              padding: '12px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TemplateIcon size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 700,
                color: '#1F2937',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {currentView === 'create' ? 'Create Template' : 
                 currentView === 'edit' ? 'Edit Template' : 'Template Management'}
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#6B7280',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                {currentView === 'list' 
                  ? 'Create and manage message templates'
                  : currentView === 'create' 
                    ? 'Create a new message template'
                    : 'Edit your message template'
                }
              </p>
            </div>
          </div>

          {currentView === 'list' && (
            <button
              onClick={() => setCurrentView('create')}
              className="btn-ripple hover-lift"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: isMobile ? '10px 16px' : '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <PlusIcon size={16} color="#fff" />
              {!isMobile && 'New Template'}
            </button>
          )}
        </div>

        {/* Stats Cards - Only show in list view */}
        {currentView === 'list' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
              border: '1px solid #C4B5FD',
              borderRadius: 12,
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: 700,
                color: '#7C3AED',
                marginBottom: '4px'
              }}>
                {templates.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#7C3AED',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Total Templates
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
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
                {stats.totalUsage || 0}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#166534',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Total Uses
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
                {Object.keys(categoryStats).length}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#92400E',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Categories
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Only show in list view */}
        {currentView === 'list' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search templates by name, content, or description..."
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
                onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
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

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #E5E7EB',
                borderRadius: 12,
                fontSize: '14px',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({categoryStats[category] || 0})
                </option>
              ))}
            </select>

            {/* View Toggle */}
            {!isMobile && (
              <div style={{
                display: 'flex',
                background: '#F3F4F6',
                borderRadius: 8,
                padding: '4px'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <GridIcon size={16} color={viewMode === 'grid' ? '#8B5CF6' : '#6B7280'} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ListIcon size={16} color={viewMode === 'list' ? '#8B5CF6' : '#6B7280'} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content based on current view */}
        <div className="animate-fadeIn">
          {/* Create/Edit Form */}
          {(currentView === 'create' || currentView === 'edit') && (
            <form onSubmit={handleSubmit} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              gap: '24px'
            }}>
              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Template Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter template name"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the template"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                {/* Content */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Template Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your message template here. Use {{variable}} for dynamic content."
                    required
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    Tip: Use variables like {'{{name}}'}, {'{{company}}'}, or {'{{date}}'} for personalization
                  </p>
                </div>
              </div>

              {/* Preview Panel */}
              <div>
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: '20px',
                  position: 'sticky',
                  top: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    📱 Preview
                  </h4>
                  
                  {formData.name && (
                    <div style={{
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1F2937'
                    }}>
                      {formData.name}
                    </div>
                  )}
                  
                  {formData.category && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        ...getCategoryColor(formData.category),
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {formData.category}
                      </span>
                    </div>
                  )}
                  
                  {formData.description && (
                    <div style={{
                      marginBottom: '12px',
                      fontSize: '13px',
                      color: '#6B7280',
                      fontStyle: 'italic'
                    }}>
                      {formData.description}
                    </div>
                  )}
                  
                  <div style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: 1.5,
                    minHeight: '100px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {formData.content || 'Your template content will appear here...'}
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 0 0 0',
                    borderTop: '1px solid #E5E7EB',
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    Character count: {formData.content.length}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim() || !formData.content.trim() || !formData.category}
                    className="btn-ripple hover-lift"
                    style={{
                      width: '100%',
                      background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '14px 24px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #fff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        {editingTemplate ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <SaveIcon size={16} color="#fff" />
                        {editingTemplate ? 'Update Template' : 'Create Template'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Templates List/Grid */}
          {currentView === 'list' && (
            <>
              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #E5E7EB',
                    borderTop: '4px solid #8B5CF6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }} />
                  <p>Loading templates...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280'
                }}>
                  <TemplateIcon size={48} color="#D1D5DB" />
                  <p style={{ margin: '16px 0 0 0', fontSize: '16px', fontWeight: 500 }}>
                    {searchTerm || filterCategory ? 'No templates match your filters' : 'No templates created yet'}
                  </p>
                  {(searchTerm || filterCategory) ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('');
                      }}
                      style={{
                        background: '#8B5CF6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView('create')}
                      style={{
                        background: '#8B5CF6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: '12px auto 0'
                      }}
                    >
                      <PlusIcon size={16} />
                      Create Your First Template
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 
                    viewMode === 'grid' 
                      ? isMobile 
                        ? '1fr' 
                        : 'repeat(auto-fill, minmax(320px, 1fr))'
                      : '1fr',
                  gap: '20px'
                }}>
                  {filteredTemplates.map(template => {
                    const categoryColor = getCategoryColor(template.category);
                    
                    return (
                      <div
                        key={template._id}
                        className="hover-lift"
                        style={{
                          background: '#fff',
                          border: '2px solid #E5E7EB',
                          borderRadius: 12,
                          padding: '20px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1F2937',
                            flex: 1,
                            marginRight: '12px'
                          }}>
                            {template.name}
                          </h4>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(template)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 4
                              }}
                              title="Edit Template"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(template._id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 4
                              }}
                              title="Delete Template"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            background: categoryColor.bg,
                            color: categoryColor.color,
                            border: `1px solid ${categoryColor.border}`,
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {template.category}
                          </span>

                          <div style={{
                            fontSize: '12px',
                            color: '#9CA3AF'
                          }}>
                            Used: {template.usageCount || 0} times
                          </div>
                        </div>
                        
                        {template.description && (
                          <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '13px',
                            color: '#6B7280',
                            fontStyle: 'italic'
                          }}>
                            {template.description}
                          </p>
                        )}
                        
                        <div style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '12px',
                          fontSize: '13px',
                          color: '#475569',
                          lineHeight: 1.4,
                          maxHeight: viewMode === 'grid' ? '100px' : '60px',
                          overflowY: 'auto',
                          marginBottom: '12px'
                        }}>
                          {template.content}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#9CA3AF'
                        }}>
                          <span>
                            Created: {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            {template.content.length} chars
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateManagement; 