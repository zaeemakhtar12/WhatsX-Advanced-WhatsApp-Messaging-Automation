const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Message routes
router.post('/send', verifyToken, messageController.sendMessage);
router.post('/bulk', verifyToken, messageController.sendBulkMessage);
router.get('/messages', verifyToken, messageController.getMessages);
router.get('/messages/stats', verifyToken, messageController.getMessageStats);
router.get('/dashboard/stats', verifyToken, messageController.getDashboardStats);
router.delete('/messages/:id', verifyToken, messageController.deleteMessage);

module.exports = router;
