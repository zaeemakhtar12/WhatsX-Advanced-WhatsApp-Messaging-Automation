const Template = require('../models/templateModel');

// ✅ Create a new template (Admin only)
const createTemplate = async (req, res) => {
  try {
    const { title, content, description, category, variables, tags, isPublic } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create templates' });
    }

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newTemplate = new Template({
      title,
      content,
      description,
      category: category || 'other',
      variables: variables || [],
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy
    });

    await newTemplate.save();

    res.status(201).json({ 
      message: 'Template created successfully!', 
      template: newTemplate 
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all templates (Admin gets all, Users get public ones)
const getTemplates = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Build filter based on user role
    const filter = { isActive: true };
    
    if (userRole !== 'admin') {
      filter.isPublic = true; // Users can only see public templates
    }

    if (category) filter.category = category;
    
    if (search) {
      filter.$text = { $search: search };
    }

    const templates = await Template.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Template.countDocuments(filter);

    res.json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get template by ID
const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const filter = { _id: id };
    
    // Users can only access public templates
    if (userRole !== 'admin') {
      filter.isPublic = true;
      filter.isActive = true;
    }

    const template = await Template.findOne(filter)
      .populate('createdBy', 'username email');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update template (Admin only)
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, description, category, variables, tags, isPublic, isActive } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update templates' });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update fields
    if (title) template.title = title;
    if (content) template.content = content;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (variables) template.variables = variables;
    if (tags) template.tags = tags;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.json({ 
      message: 'Template updated successfully!', 
      template 
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete template (Admin only)
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete templates' });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await Template.findByIdAndDelete(id);

    res.json({ message: 'Template deleted successfully!' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Use template (increment usage counter)
const useTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const template = await Template.findOne({ 
      _id: id, 
      isActive: true,
      ...(req.user?.role !== 'admin' && { isPublic: true })
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Replace variables in template content
    const processedContent = template.replaceVariables(variables);

    // Increment usage counter
    await template.incrementUsage();

    res.json({
      message: 'Template processed successfully!',
      processedContent,
      originalTemplate: template
    });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get template categories
const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'marketing', label: 'Marketing', description: 'Promotional and marketing messages' },
      { value: 'appointment', label: 'Appointment', description: 'Appointment reminders and confirmations' },
      { value: 'notification', label: 'Notification', description: 'System and service notifications' },
      { value: 'greeting', label: 'Greeting', description: 'Welcome and greeting messages' },
      { value: 'reminder', label: 'Reminder', description: 'General reminders and alerts' },
      { value: 'other', label: 'Other', description: 'Miscellaneous templates' }
    ];

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get template statistics (Admin only)
const getTemplateStats = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalTemplates = await Template.countDocuments();
    const activeTemplates = await Template.countDocuments({ isActive: true });
    const publicTemplates = await Template.countDocuments({ isPublic: true });
    
    const mostUsedTemplates = await Template.find()
      .sort({ 'usage.totalUsed': -1 })
      .limit(5)
      .select('title usage.totalUsed');

    const categoryStats = await Template.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: {
        total: totalTemplates,
        active: activeTemplates,
        public: publicTemplates,
        inactive: totalTemplates - activeTemplates
      },
      mostUsed: mostUsedTemplates,
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  getCategories,
  getTemplateStats
}; 