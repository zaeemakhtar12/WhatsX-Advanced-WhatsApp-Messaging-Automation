const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Existing routes
router.post('/send', verifyToken, messageController.sendMessage);
router.get('/logs', verifyToken, messageController.getMessageLogs);

// New WhatsApp routes
router.post('/whatsapp/template', verifyToken, messageController.sendWhatsAppTemplate);
router.post('/whatsapp/bulk-template', verifyToken, messageController.sendBulkWhatsAppTemplate);
router.post('/whatsapp/message', verifyToken, messageController.sendWhatsAppMessage);

module.exports = router;
