const express = require('express');
const router = express.Router();
const scheduledMessageController = require('../controllers/scheduledMessageController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Scheduled message CRUD operations
router.post('/scheduled-messages', scheduledMessageController.createScheduledMessage);
router.get('/scheduled-messages', scheduledMessageController.getScheduledMessages);
router.get('/scheduled-messages/:id', scheduledMessageController.getScheduledMessage);
router.put('/scheduled-messages/:id', scheduledMessageController.updateScheduledMessage);
router.delete('/scheduled-messages/:id', scheduledMessageController.deleteScheduledMessage);

// Execute scheduled messages (can be called manually or by cron job)
router.post('/scheduled-messages/execute', scheduledMessageController.executeScheduledMessages);

module.exports = router; 