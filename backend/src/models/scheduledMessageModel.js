const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  message: { 
    type: String, 
    required: true 
  },
  recipients: [{
    name: { type: String, required: true },
    number: { type: String, required: true }
  }],
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'sent', 'failed', 'cancelled'], 
    default: 'scheduled' 
  },
  messageType: { 
    type: String, 
    enum: ['regular', 'whatsapp_message', 'whatsapp_template'], 
    default: 'whatsapp_message' 
  },
  templateName: { type: String }, // For template messages
  templateVariables: { type: Object }, // Variables for template messages
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  sentAt: { 
    type: Date 
  },
  results: [{
    recipient: String,
    status: String,
    error: String,
    messageSid: String
  }],
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'], 
      default: 'daily' 
    },
    nextRun: { type: Date }
  }
});

// Index for efficient querying of scheduled messages
scheduledMessageSchema.index({ scheduledDate: 1, status: 1 });
scheduledMessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema); 