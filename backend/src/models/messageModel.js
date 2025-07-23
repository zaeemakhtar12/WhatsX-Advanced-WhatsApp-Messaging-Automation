const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['regular', 'whatsapp_message', 'whatsapp_template', 'bulk_whatsapp_template'], 
    default: 'regular' 
  },
  templateName: { type: String }, // For template messages
  templateVariables: { type: Object }, // Variables used in template
  twilioSid: { type: String }, // Twilio message SID for tracking
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'failed', 'pending'], 
    default: 'sent' 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);