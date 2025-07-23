import React, { useState, useEffect, useCallback } from 'react';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  getTemplateCategories,
  getTemplateStats 
} from '../api';

function Notification({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: type === 'success' ? '#00b86b' : '#f44336',
      color: '#fff',
      padding: '16px 28px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,184,107,0.15)',
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
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'stats'
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Form state
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'other',
    variables: [],
    tags: [],
    isPublic: true,
    isActive: true
  });

  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTemplates(),
        fetchCategories(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates(filterCategory, searchTerm);
      if (response.templates) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getTemplateCategories();
      if (response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTemplateStats();
      setStats(response);
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
      title: '',
      content: '',
      description: '',
      category: 'other',
      variables: [],
      tags: [],
      isPublic: true,
      isActive: true
    });
    setEditingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Title and content are required', 'error');
      return;
    }

    try {
      const response = await createTemplate(formData);
      if (response.template) {
        showNotification('Template created successfully!');
        resetForm();
        setCurrentView('list');
        fetchTemplates();
        fetchStats();
      } else {
        showNotification(response.error || 'Error creating template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showNotification('Error creating template', 'error');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Title and content are required', 'error');
      return;
    }

    try {
      const response = await updateTemplate(editingTemplate._id, formData);
      if (response.template) {
        showNotification('Template updated successfully!');
        resetForm();
        setCurrentView('list');
        fetchTemplates();
      } else {
        showNotification(response.error || 'Error updating template', 'error');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showNotification('Error updating template', 'error');
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.title}"?`)) {
      return;
    }

    try {
      const response = await deleteTemplate(template._id);
      if (response.message) {
        showNotification('Template deleted successfully!');
        fetchTemplates();
        fetchStats();
      } else {
        showNotification(response.error || 'Error deleting template', 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification('Error deleting template', 'error');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      description: template.description || '',
      category: template.category,
      variables: template.variables || [],
      tags: template.tags || [],
      isPublic: template.isPublic,
      isActive: template.isActive
    });
    setCurrentView('edit');
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { name: '', placeholder: '', description: '' }]
    }));
  };

  const updateVariable = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };



  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading templates...</div>
      </div>
    );
  }

  return (
    <>
      <Notification message={notification} type={notificationType} onClose={() => setNotification('')} />
      
      <div style={{ padding: '20px' }}>
        {/* Header with Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#222', margin: 0 }}>Template Management</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentView('list')}
              style={{
                ...tabButtonStyle,
                backgroundColor: currentView === 'list' ? '#00b86b' : '#f5f5f5',
                color: currentView === 'list' ? '#fff' : '#666'
              }}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              style={{
                ...tabButtonStyle,
                backgroundColor: currentView === 'stats' ? '#00b86b' : '#f5f5f5',
                color: currentView === 'stats' ? '#fff' : '#666'
              }}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => { resetForm(); setCurrentView('create'); }}
              style={{
                ...tabButtonStyle,
                backgroundColor: currentView === 'create' ? '#00b86b' : '#2196F3',
                color: '#fff'
              }}
            >
              ➕ Create Template
            </button>
          </div>
        </div>

        {/* Templates List View */}
        {currentView === 'list' && (
          <div>
            {/* Filters */}
            <div style={{ 
              background: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              gap: '15px',
              alignItems: 'end'
            }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Search Templates</label>
                <input
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: '200px' }}>
                <label style={labelStyle}>Category</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)} 
                  style={inputStyle}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={fetchTemplates} 
                style={{ ...primaryButtonStyle, padding: '8px 16px' }}
              >
                🔍 Search
              </button>
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gap: '15px' }}>
              {templates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No templates found. Create your first template!
                </div>
              ) : (
                templates.map(template => (
                  <div key={template._id} style={templateCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#333' }}>{template.title}</h3>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          {template.category} • Used {template.usage?.totalUsed || 0} times
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          backgroundColor: template.isActive ? '#4CAF50' : '#f44336',
                          color: '#fff'
                        }}>
                          {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          backgroundColor: template.isPublic ? '#2196F3' : '#FF9800',
                          color: '#fff'
                        }}>
                          {template.isPublic ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                        {template.description}
                      </p>
                    )}
                    
                    <div style={{ 
                      background: '#f5f5f5', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      marginBottom: '10px',
                      fontSize: '14px',
                      maxHeight: '60px',
                      overflow: 'hidden'
                    }}>
                      {template.content}
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <small style={{ color: '#666' }}>Variables: </small>
                        {template.variables.map((variable, i) => (
                          <span key={i} style={{ 
                            background: '#e3f2fd', 
                            padding: '2px 6px', 
                            borderRadius: '3px', 
                            fontSize: '11px',
                            marginRight: '4px'
                          }}>
                            {`{{${variable.name}}}`}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        onClick={() => handleEditTemplate(template)}
                        style={editButtonStyle}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(template)}
                        style={deleteButtonStyle}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Template View */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>
                {currentView === 'create' ? 'Create New Template' : `Edit Template: ${editingTemplate?.title}`}
              </h3>

              {/* Basic Information */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Template Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter template title..."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={inputStyle}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Settings</label>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        style={{ marginRight: '5px' }}
                      />
                      Public
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        style={{ marginRight: '5px' }}
                      />
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this template..."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Template Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your template content here... Use {{variableName}} for dynamic content."
                  rows="6"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  💡 Use double curly braces for variables: {"{name}"}, {"{date}"}, {"{amount}"}
                </small>
              </div>

              {/* Variables Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={labelStyle}>Template Variables</label>
                  <button onClick={addVariable} style={{ ...primaryButtonStyle, padding: '6px 12px', fontSize: '12px' }}>
                    ➕ Add Variable
                  </button>
                </div>
                
                {formData.variables.map((variable, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '6px', 
                    padding: '15px', 
                    marginBottom: '10px',
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Variable Name</label>
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => updateVariable(index, 'name', e.target.value)}
                          placeholder="e.g., name, date, amount"
                          style={{ ...inputStyle, fontSize: '14px' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Default Value</label>
                        <input
                          type="text"
                          value={variable.placeholder}
                          onChange={(e) => updateVariable(index, 'placeholder', e.target.value)}
                          placeholder="Default value"
                          style={{ ...inputStyle, fontSize: '14px' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                        <input
                          type="text"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, 'description', e.target.value)}
                          placeholder="What this variable represents"
                          style={{ ...inputStyle, fontSize: '14px' }}
                        />
                      </div>
                      <button 
                        onClick={() => removeVariable(index)}
                        style={{ 
                          background: '#f44336', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '8px', 
                          cursor: 'pointer',
                          marginTop: '20px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => setCurrentView('list')}
                  style={{ ...secondaryButtonStyle }}
                >
                  Cancel
                </button>
                <button
                  onClick={currentView === 'create' ? handleCreateTemplate : handleUpdateTemplate}
                  style={{ ...primaryButtonStyle }}
                >
                  {currentView === 'create' ? 'Create Template' : 'Update Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics View */}
        {currentView === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={statCardStyle}>
                <h3 style={{ margin: 0, color: '#2196F3' }}>{stats.stats?.total || 0}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Templates</p>
              </div>
              <div style={statCardStyle}>
                <h3 style={{ margin: 0, color: '#4CAF50' }}>{stats.stats?.active || 0}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Active Templates</p>
              </div>
              <div style={statCardStyle}>
                <h3 style={{ margin: 0, color: '#FF9800' }}>{stats.stats?.public || 0}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Public Templates</p>
              </div>
              <div style={statCardStyle}>
                <h3 style={{ margin: 0, color: '#f44336' }}>{stats.stats?.inactive || 0}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Inactive Templates</p>
              </div>
            </div>

            {stats.mostUsed && stats.mostUsed.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Most Used Templates</h3>
                {stats.mostUsed.map((template, index) => (
                  <div key={template._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0', 
                    borderBottom: index < stats.mostUsed.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <span>{template.title}</span>
                    <span style={{ fontWeight: 'bold', color: '#00b86b' }}>{template.usage.totalUsed} uses</span>
                  </div>
                ))}
              </div>
            )}

            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e0e0e0' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Templates by Category</h3>
                {stats.categoryBreakdown.map((category, index) => (
                  <div key={category._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0', 
                    borderBottom: index < stats.categoryBreakdown.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{category._id}</span>
                    <span style={{ fontWeight: 'bold', color: '#2196F3' }}>{category.count} templates</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
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
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'inherit'
};

const primaryButtonStyle = {
  backgroundColor: '#00b86b',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const secondaryButtonStyle = {
  backgroundColor: '#666',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const tabButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px'
};

const templateCardStyle = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const editButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const statCardStyle = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

export default TemplateManagement; 