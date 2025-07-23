const Template = require('../models/templateModel');

// Create a new template (Admin only)
const createTemplate = async (req, res) => {
  try {
    const { name, category, content, description } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) return res.status(401).json({ error: 'Unauthorized' });

    // Validate required fields
    if (!name || !category || !content) {
      return res.status(400).json({ error: 'Name, category, and content are required' });
    }

    // Check if template with same name exists
    const existingTemplate = await Template.findOne({ name: name.trim() });
    if (existingTemplate) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }

    // Extract variables from content
    const variables = [];
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      const uniqueVars = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
      variables.push(...uniqueVars);
    }

    const template = new Template({
      name: name.trim(),
      category,
      content,
      description: description?.trim() || '',
      variables,
      createdBy,
      isActive: true,
      usageCount: 0
    });

    await template.save();
    res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all templates (Admin gets all, Users get public ones)
const getTemplates = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { category, search, page = 1, limit = 20 } = req.query;
    
    // Build filter based on user role
    let filter = { isActive: true };
    
    // If not admin, only show public templates or own templates
    if (userRole !== 'admin') {
      filter.$or = [
        { isPublic: true },
        { createdBy: userId }
      ];
    }
    
    if (category) filter.category = category;
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (page - 1) * limit;
    const templates = await Template.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Template.countDocuments(filter);

    res.status(200).json({
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: templates.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get template by ID
const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let filter = { _id: id, isActive: true };
    
    // If not admin, only show public templates or own templates
    if (userRole !== 'admin') {
      filter.$or = [
        { isPublic: true },
        { createdBy: userId }
      ];
    }

    const template = await Template.findOne(filter)
      .populate('createdBy', 'username');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update template (Admin only)
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find template and check permissions
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if user can edit (admin or creator)
    if (userRole !== 'admin' && template.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this template' });
    }

    const { name, category, content, description, isPublic, isActive } = req.body;

    // Check if new name conflicts with existing templates
    if (name && name !== template.name) {
      const existingTemplate = await Template.findOne({ 
        name: name.trim(), 
        _id: { $ne: id } 
      });
      if (existingTemplate) {
        return res.status(400).json({ error: 'Template with this name already exists' });
      }
    }

    // Extract variables from content if content is being updated
    let variables = template.variables;
    if (content && content !== template.content) {
      variables = [];
      const matches = content.match(/\{\{(\w+)\}\}/g);
      if (matches) {
        const uniqueVars = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
        variables.push(...uniqueVars);
      }
    }

    // Update template
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(category && { category }),
      ...(content && { content, variables }),
      ...(description !== undefined && { description: description.trim() }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    };

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username');

    res.status(200).json({ message: 'Template updated successfully', template: updatedTemplate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete template (Admin only)
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find template and check permissions
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if user can delete (admin or creator)
    if (userRole !== 'admin' && template.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this template' });
    }

    // Soft delete by setting isActive to false
    await Template.findByIdAndUpdate(id, { 
      isActive: false, 
      deletedAt: new Date() 
    });

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Use template (increment usage counter)
const useTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find template
    let filter = { _id: id, isActive: true };
    
    // If not admin, only allow public templates or own templates
    if (userRole !== 'admin') {
      filter.$or = [
        { isPublic: true },
        { createdBy: userId }
      ];
    }

    const template = await Template.findOne(filter);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Increment usage counter
    await Template.findByIdAndUpdate(id, { 
      $inc: { usageCount: 1 },
      lastUsedAt: new Date()
    });

    // Replace variables in content
    let processedContent = template.content;
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(regex, value || '');
      });
    }

    res.status(200).json({ 
      message: 'Template processed successfully',
      content: processedContent,
      template: {
        id: template._id,
        name: template.name,
        category: template.category,
        variables: template.variables
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get template categories
const getTemplateCategories = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const categories = await Template.distinct('category', { isActive: true });
    res.status(200).json({ categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get template statistics (Admin only)
const getTemplateStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Build filter based on user role
    let filter = { isActive: true };
    if (userRole !== 'admin') {
      filter.$or = [
        { isPublic: true },
        { createdBy: userId }
      ];
    }

    const totalTemplates = await Template.countDocuments(filter);
    const totalUsage = await Template.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);

    const categoryStats = await Template.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } },
      { $sort: { count: -1 } }
    ]);

    const mostUsed = await Template.find(filter)
      .sort({ usageCount: -1 })
      .limit(5)
      .select('name category usageCount');

    res.status(200).json({
      total: totalTemplates,
      totalUsage: totalUsage[0]?.total || 0,
      byCategory: categoryStats,
      mostUsed
    });
  } catch (error) {
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
  getTemplateCategories,
  getTemplateStats
}; 