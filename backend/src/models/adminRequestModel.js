const mongoose = require('mongoose');

const adminRequestSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  reasonForAdminAccess: { type: String, required: true },
  contactNumber: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);

module.exports = AdminRequest; 