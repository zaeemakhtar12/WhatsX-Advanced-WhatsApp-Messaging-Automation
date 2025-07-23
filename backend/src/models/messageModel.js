const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: String, required: true },
  recipientName: { type: String },
  message: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['regular', 'bulk', 'template', 'scheduled'],
    default: 'regular'
  },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'failed', 'pending'],
    default: 'sent'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);