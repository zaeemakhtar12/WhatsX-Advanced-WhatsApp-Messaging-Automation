const express = require('express');
const router = express.Router();
const scheduledMessageController = require('../controllers/scheduledMessageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Scheduled message CRUD operations (authenticated)
router.post('/scheduled-messages', verifyToken, scheduledMessageController.createScheduledMessage);
router.get('/scheduled-messages', verifyToken, scheduledMessageController.getScheduledMessages);
router.put('/scheduled-messages/:id', verifyToken, scheduledMessageController.updateScheduledMessage);
router.delete('/scheduled-messages/:id', verifyToken, scheduledMessageController.deleteScheduledMessage);

// Execute scheduled messages (can be called manually or by cron job)
router.post('/scheduled-messages/execute', verifyToken, scheduledMessageController.executeScheduledMessages);

// Test route to manually trigger execution (for development)
router.post('/scheduled-messages/test-execute', verifyToken, async (req, res) => {
  try {
    const result = await scheduledMessageController.executeScheduledMessages();
    res.json({ 
      message: `Executed ${result.executed} scheduled message(s)`,
      executed: result.executed 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 