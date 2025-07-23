const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['marketing', 'appointment', 'notification', 'greeting', 'reminder', 'other'],
    default: 'other'
  },
  variables: [{
    name: { type: String, required: true },
    placeholder: { type: String, required: true },
    description: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usage: {
    totalUsed: { type: Number, default: 0 },
    lastUsed: { type: Date }
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true // If true, all users can use this template
  }
}, {
  timestamps: true
});

// Index for efficient searching
templateSchema.index({ title: 'text', content: 'text', description: 'text' });
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ createdBy: 1 });

// Method to increment usage count
templateSchema.methods.incrementUsage = function() {
  this.usage.totalUsed += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Method to replace variables in template content
templateSchema.methods.replaceVariables = function(variables = {}) {
  let content = this.content;
  
  this.variables.forEach(variable => {
    const placeholder = `{{${variable.name}}}`;
    const value = variables[variable.name] || variable.placeholder;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return content;
};

module.exports = mongoose.model('Template', templateSchema); 