const mongoose = require('mongoose');

const adminRequestSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);

module.exports = AdminRequest; 