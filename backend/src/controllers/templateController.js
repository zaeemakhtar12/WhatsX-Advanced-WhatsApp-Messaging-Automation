const Template = require('../models/templateModel');

// Create a new template
const createTemplate = async (req, res) => {
  try {
    const { name, category, content, description, variables, isPublic } = req.body;
    const createdBy = req.user?.id;

    if (!name || !content) {
      return res.status(400).json({ error: 'Template name and content are required' });
    }

    if (!createdBy) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if template with same name already exists
    const existingTemplate = await Template.findOne({ title: name.trim() });
    if (existingTemplate) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }

    // Map frontend category to backend enum values
    const categoryMap = {
      'Marketing': 'marketing',
      'Appointment': 'appointment',
      'Notifications': 'notification',
      'Greeting': 'greeting',
      'Reminders': 'reminder',
      'Support': 'other',
      'Customer Service': 'other',
      'Other': 'other'
    };
    const validCategory = categoryMap[category] || 'other';

    const template = new Template({
      title: name.trim(),
      category: validCategory,
      content: content.trim(),
      description: description?.trim() || '',
      variables: Array.isArray(variables) ? variables : [],
      isPublic: isPublic !== false,
      createdBy
    });

    const savedTemplate = await template.save();
    res.status(201).json({
      message: 'Template created successfully',
      template: {
        ...savedTemplate.toObject(),
        name: savedTemplate.title
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all templates (filtered by access permissions)
const getTemplates = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Convert string userId to ObjectId for proper MongoDB querying
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build filter
    const filter = {
      $or: [
        { isPublic: true },
        { createdBy: userObjectId }
      ]
    };

    if (category && category !== 'All') {
      // Map frontend category to backend category
      const categoryMap = {
        'Marketing': 'marketing',
        'Appointment': 'appointment', 
        'Notifications': 'notification',
        'Greeting': 'greeting',
        'Reminders': 'reminder',
        'Support': 'other',
        'Customer Service': 'other',
        'Other': 'other'
      };
      filter.category = categoryMap[category] || category.toLowerCase();
    }

    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const templates = await Template.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    // Add permission info and map fields for frontend compatibility
    const templatesWithPermissions = templates.map(template => {
      const createdByObj = template.createdBy || { _id: null, username: 'Unknown User', email: 'unknown@example.com' };
      const createdById = createdByObj && createdByObj._id ? createdByObj._id.toString() : null;
      const canEdit = createdById ? createdById === userId.toString() : false;
      const canDelete = createdById ? createdById === userId.toString() : false;

      const usageCount = template.usage?.totalUsed || 0;

      return {
        ...template,
        name: template.title,
        usageCount,
        createdBy: createdByObj,
        canEdit,
        canDelete,
      };
    });

    res.status(200).json(templatesWithPermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get template by ID
const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let filter = { _id: id };
    
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
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find template
    let filter = { _id: id };
    
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

    // Check if user can edit (admin or creator)
    if (userRole !== 'admin' && template.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this template' });
    }

    const { name, category, content, description, isPublic, isActive } = req.body;

    // Check if new name conflicts with existing templates (using title field)
    if (name && name !== template.title) {
      const existingTemplate = await Template.findOne({ 
        title: name.trim(),
        _id: { $ne: id } 
      });
      if (existingTemplate) {
        return res.status(400).json({ error: 'Template with this name already exists' });
      }
    }

    // Map frontend category to valid model category
    let validCategory = category;
    if (category) {
      const categoryMap = {
        'Marketing': 'marketing',
        'Appointment': 'appointment', 
        'Notifications': 'notification',
        'Greeting': 'greeting',
        'Reminders': 'reminder',
        'Support': 'other',
        'Customer Service': 'other',
        'Other': 'other'
      };
      validCategory = categoryMap[category] || category.toLowerCase();
    }

    // Extract variables from content if content is being updated
    let variables = template.variables;
    if (content && content !== template.content) {
      variables = [];
      const matches = content.match(/\{\{(\w+)\}\}/g);
      if (matches) {
        const uniqueVars = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
        variables = uniqueVars.map(varName => ({
          name: varName,
          placeholder: `{${varName}}`,
          description: `Variable for ${varName}`
        }));
      }
    }

    // Update template (map name to title)
    const updateData = {
      ...(name && { title: name.trim() }),
      ...(validCategory && { category: validCategory }),
      ...(content && { content, variables }),
      ...(description !== undefined && { description: description.trim() }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isActive !== undefined && { isActive })
    };

    const updatedTemplate = await Template.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    // Map response for frontend compatibility
    const responseTemplate = {
      ...updatedTemplate.toObject(),
      name: updatedTemplate.title // Map title back to name
    };

    res.status(200).json({ 
      message: 'Template updated successfully', 
      template: responseTemplate 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete template (Admin only)
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
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

    // Hard delete - completely remove from database
    await Template.findByIdAndDelete(id);

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
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find template
    let filter = { _id: id };
    
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
      $inc: { 'usage.totalUsed': 1 },
      $set: { 'usage.lastUsed': new Date() }
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
        name: template.title,
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const categories = await Template.distinct('category');
    res.status(200).json({ categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get template statistics (Admin only)
const getTemplateStats = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get template counts
    const totalTemplates = await Template.countDocuments();

    // Get templates by category
    const categoryStats = await Template.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalUsage: { $sum: "$usageCount" }
        }
      }
    ]);

    // Get most used templates
    const topTemplates = await Template.find()
      .sort({ 'usage.totalUsed': -1 })
      .limit(5)
      .select('title usage category')
      .lean();

    // Get recent templates (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTemplates = await Template.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Total usage across all templates
    const totalUsageAgg = await Template.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: "$usage.totalUsed" }
        }
      }
    ]);

    res.status(200).json({
      totalTemplates,
      activeTemplates: null,
      inactiveTemplates: null,
      recentTemplates,
      categoryStats,
      topTemplates: topTemplates.map(t => ({
        name: t.title,
        usageCount: t.usage?.totalUsed || 0,
        category: t.category
      })),
      totalUsage: totalUsageAgg[0]?.totalUsage || 0
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