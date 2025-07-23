import React, { useState, useEffect } from 'react';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTemplateStats 
} from '../api';

function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: type === 'success' ? '#25D366' : '#DC2626',
      color: '#fff',
      padding: '16px 28px',
      borderRadius: 8,
      boxShadow: type === 'success' ? '0 2px 12px rgba(37, 211, 102, 0.3)' : '0 2px 12px rgba(220, 38, 38, 0.3)',
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 16,
      minWidth: 180,
      textAlign: 'center'
    }}>
      {message}
      <button onClick={onClose} style={{
        marginLeft: 18,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: 18,
        cursor: 'pointer'
      }}>×</button>
    </div>
  );
}

function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [categories] = useState([
    'Marketing', 'Customer Service', 'Notifications', 'Reminders', 
    'Welcome', 'Follow-up', 'Promotional', 'Support', 'General'
  ]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [stats, setStats] = useState({});
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [loading, setLoading] = useState(false);

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
    fetchTemplates();
  }, [filterCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getTemplates();
      if (response && response.templates) {
        let filteredTemplates = response.templates;
        
        // Filter by category
        if (filterCategory) {
          filteredTemplates = filteredTemplates.filter(t => t.category === filterCategory);
        }
        
        // Filter by search term
        if (searchTerm) {
          filteredTemplates = filteredTemplates.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setTemplates(filteredTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showNotification('Error fetching templates', 'error');
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
      console.error('Error fetching stats:', error);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification(msg);
    setNotificationType(type);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      content: '',
      description: ''
    });
    setEditingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      showNotification('Name and content are required', 'error');
      return;
    }

    try {
      const response = await createTemplate(formData);
      if (response && response.template) {
        showNotification('Template created successfully!');
        resetForm();
        setCurrentView('list');
        fetchTemplates();
        fetchStats();
      } else {
        showNotification(response?.error || 'Error creating template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showNotification('Error creating template', 'error');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      showNotification('Name and content are required', 'error');
      return;
    }

    try {
      const response = await updateTemplate(editingTemplate._id, formData);
      if (response && response.template) {
        showNotification('Template updated successfully!');
        resetForm();
        setCurrentView('list');
        fetchTemplates();
        fetchStats();
      } else {
        showNotification(response?.error || 'Error updating template', 'error');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showNotification('Error updating template', 'error');
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await deleteTemplate(template._id);
      if (response) {
        showNotification('Template deleted successfully!');
        fetchTemplates();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification('Error deleting template', 'error');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      description: template.description || ''
    });
    setCurrentView('edit');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render create/edit form
  const renderForm = () => (
    <div style={{ 
      background: '#fff', 
      padding: 24, 
      borderRadius: 12, 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
    }}>
      <h3 style={{ color: '#1F2937', marginBottom: 20, fontSize: 20 }}>
        {editingTemplate ? 'Edit Template' : 'Create New Template'}
      </h3>
      
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter template name"
            style={{ 
              width: '100%', 
              padding: 12, 
              border: '2px solid #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14 
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            style={{ 
              width: '100%', 
              padding: 12, 
              border: '2px solid #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14 
            }}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of the template"
            style={{ 
              width: '100%', 
              padding: 12, 
              border: '2px solid #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14 
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
            Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter template content. Use {{variable}} for dynamic content."
            rows={6}
            style={{ 
              width: '100%', 
              padding: 12, 
              border: '2px solid #E4E6EA', 
              borderRadius: 6, 
              fontSize: 14,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <small style={{ color: '#6B7280', fontSize: 12 }}>
            Use double curly braces for variables, e.g., {`{{name}}`}, {`{{date}}`}
          </small>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            style={{
              padding: '12px 24px',
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
          
          <button
            onClick={() => {
              resetForm();
              setCurrentView('list');
            }}
            style={{
              padding: '12px 24px',
              background: '#6B7280',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Render template list
  const renderList = () => (
    <>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #E4E6EA'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, color: '#25D366', fontWeight: 'bold' }}>Templates</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>
            {stats.total || 0}
          </div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>Total Templates</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 12, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #E4E6EA'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, color: '#25D366', fontWeight: 'bold' }}>Usage</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>
            {stats.totalUsage || 0}
          </div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>Total Usage</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 12, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: 24,
        border: '2px solid #E4E6EA'
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
              Search Templates
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, content, or description..."
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
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '2px solid #E4E6EA', 
                borderRadius: 6, 
                fontSize: 14 
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setCurrentView('create')}
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
            New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '2px solid #E4E6EA'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#25D366' }}>No Templates</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No templates found</div>
            <div style={{ fontSize: 14 }}>
              {searchTerm || filterCategory ? 'Try adjusting your search criteria' : 'Create your first template to get started!'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, padding: 20 }}>
            {templates.map((template) => (
              <div 
                key={template._id}
                style={{ 
                  padding: 20, 
                  border: '2px solid #E4E6EA', 
                  borderRadius: 8,
                  background: '#F7F8FA'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ color: '#1F2937', margin: 0, marginBottom: 4, fontSize: 18 }}>
                      {template.name}
                    </h4>
                    <span style={{ 
                      fontSize: 12, 
                      background: '#25D366', 
                      color: '#fff', 
                      padding: '4px 8px', 
                      borderRadius: 4 
                    }}>
                      {template.category}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      style={{
                        padding: '6px 12px',
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      style={{
                        padding: '6px 12px',
                        background: '#DC2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {template.description && (
                  <p style={{ color: '#6B7280', margin: '8px 0', fontSize: 14 }}>
                    {template.description}
                  </p>
                )}
                
                <div style={{ 
                  background: '#fff', 
                  padding: 12, 
                  borderRadius: 6, 
                  fontSize: 14, 
                  color: '#374151',
                  border: '1px solid #E4E6EA',
                  marginTop: 12
                }}>
                  {template.content.length > 150 ? 
                    `${template.content.substring(0, 150)}...` : 
                    template.content
                  }
                </div>
                
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                  <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                  {template.usageCount !== undefined && (
                    <span style={{ marginLeft: 16 }}>Used: {template.usageCount} times</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div style={{ padding: '24px 24px 24px 48px', maxWidth: 1200, margin: '0 auto', background: '#F0F2F5' }}>
      <Notification 
        message={notification} 
        type={notificationType}
        onClose={() => setNotification('')} 
      />

      <h2 style={{ color: '#1F2937', marginBottom: 24, fontSize: 28, fontWeight: 700 }}>
        Template Management
      </h2>

      {currentView === 'list' && renderList()}
      {(currentView === 'create' || currentView === 'edit') && renderForm()}
    </div>
  );
}

export default TemplateManagement; 