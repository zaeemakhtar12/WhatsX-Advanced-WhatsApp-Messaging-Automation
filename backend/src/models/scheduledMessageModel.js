const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: String, 
    required: true 
  },
  recipientName: { 
    type: String 
  },
  message: { 
    type: String, 
    required: true 
  },
  messageType: {
    type: String,
    enum: ['regular', 'template'],
    default: 'regular'
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  scheduledTime: { 
    type: String, 
    required: true 
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  isExecuted: { 
    type: Boolean, 
    default: false 
  },
  executedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema); 