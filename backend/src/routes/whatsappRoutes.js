const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  startWhatsAppSession,
  getWhatsAppStatus,
  stopWhatsAppSession,
  sendWhatsAppMessage
} = require('../controllers/whatsappController');

const router = express.Router();

// WhatsApp Web session management
router.post('/whatsapp/start-session', verifyToken, startWhatsAppSession);
router.get('/whatsapp/status', verifyToken, getWhatsAppStatus);
router.post('/whatsapp/stop-session', verifyToken, stopWhatsAppSession);

// Send messages via WhatsApp Web
router.post('/whatsapp/send', verifyToken, sendWhatsAppMessage);

module.exports = router;
