const ScheduledMessage = require('../models/scheduledMessageModel');
const Message = require('../models/messageModel');

// ✅ Create a scheduled message
const createScheduledMessage = async (req, res) => {
  try {
    const { title, message, recipients, scheduledDate, messageType, templateName, templateVariables, recurring } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    // Validate required fields
    if (!title || !message || !recipients || !scheduledDate) {
      return res.status(400).json({ error: 'Title, message, recipients, and scheduled date are required' });
    }

    // Validate scheduled date is in the future
    const scheduleTime = new Date(scheduledDate);
    if (scheduleTime <= new Date()) {
      return res.status(400).json({ error: 'Scheduled date must be in the future' });
    }

    // Validate recipients format
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients must be a non-empty array' });
    }

    const newScheduledMessage = new ScheduledMessage({
      senderId,
      title,
      message,
      recipients,
      scheduledDate: scheduleTime,
      messageType: messageType || 'whatsapp_message',
      templateName,
      templateVariables,
      recurring: recurring || { enabled: false }
    });

    await newScheduledMessage.save();

    res.status(201).json({ 
      message: 'Message scheduled successfully!', 
      scheduledMessage: newScheduledMessage 
    });
  } catch (error) {
    console.error('Error creating scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all scheduled messages for a user
const getScheduledMessages = async (req, res) => {
  try {
    const senderId = req.user?.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { senderId };
    if (status) filter.status = status;

    const scheduledMessages = await ScheduledMessage.find(filter)
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('senderId', 'username email');

    const total = await ScheduledMessage.countDocuments(filter);

    res.json({
      scheduledMessages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a specific scheduled message
const getScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = await ScheduledMessage.findOne({ _id: id, senderId })
      .populate('senderId', 'username email');

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    res.json(scheduledMessage);
  } catch (error) {
    console.error('Error fetching scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a scheduled message
const updateScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, recipients, scheduledDate, messageType, templateName, templateVariables, recurring } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = await ScheduledMessage.findOne({ _id: id, senderId });

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    // Only allow updates if message hasn't been sent
    if (scheduledMessage.status === 'sent') {
      return res.status(400).json({ error: 'Cannot update a message that has already been sent' });
    }

    // Validate scheduled date if provided
    if (scheduledDate) {
      const scheduleTime = new Date(scheduledDate);
      if (scheduleTime <= new Date()) {
        return res.status(400).json({ error: 'Scheduled date must be in the future' });
      }
      scheduledMessage.scheduledDate = scheduleTime;
    }

    // Update fields
    if (title) scheduledMessage.title = title;
    if (message) scheduledMessage.message = message;
    if (recipients) scheduledMessage.recipients = recipients;
    if (messageType) scheduledMessage.messageType = messageType;
    if (templateName) scheduledMessage.templateName = templateName;
    if (templateVariables) scheduledMessage.templateVariables = templateVariables;
    if (recurring) scheduledMessage.recurring = recurring;

    await scheduledMessage.save();

    res.json({ 
      message: 'Scheduled message updated successfully!', 
      scheduledMessage 
    });
  } catch (error) {
    console.error('Error updating scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel/Delete a scheduled message
const deleteScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = await ScheduledMessage.findOne({ _id: id, senderId });

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    if (scheduledMessage.status === 'sent') {
      return res.status(400).json({ error: 'Cannot delete a message that has already been sent' });
    }

    // Mark as cancelled instead of deleting
    scheduledMessage.status = 'cancelled';
    await scheduledMessage.save();

    res.json({ message: 'Scheduled message cancelled successfully!' });
  } catch (error) {
    console.error('Error deleting scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Execute scheduled messages (called by cron job or manually)
const executeScheduledMessages = async (req, res) => {
  try {
    const now = new Date();
    
    // Find messages that are due to be sent
    const dueMessages = await ScheduledMessage.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    }).populate('senderId', 'username email');

    console.log(`Found ${dueMessages.length} messages due for sending`);

    const results = [];

    for (const scheduledMessage of dueMessages) {
      try {
        // Mark as processing
        scheduledMessage.status = 'sending';
        await scheduledMessage.save();

        const messageResults = [];

        // Send to each recipient
        for (const recipient of scheduledMessage.recipients) {
          try {
            // Save individual message to database
            const newMsg = new Message({
              senderId: scheduledMessage.senderId._id,
              recipient: recipient.number,
              message: scheduledMessage.message,
              messageType: scheduledMessage.messageType,
              templateName: scheduledMessage.templateName,
              templateVariables: scheduledMessage.templateVariables
            });
            await newMsg.save();

            messageResults.push({
              recipient: recipient.number,
              status: 'sent',
              messageId: newMsg._id
            });

          } catch (error) {
            console.error(`Error sending to ${recipient.number}:`, error);
            messageResults.push({
              recipient: recipient.number,
              status: 'failed',
              error: error.message
            });
          }
        }

        // Update scheduled message status
        scheduledMessage.status = 'sent';
        scheduledMessage.sentAt = new Date();
        scheduledMessage.results = messageResults;
        await scheduledMessage.save();

        results.push({
          scheduledMessageId: scheduledMessage._id,
          title: scheduledMessage.title,
          status: 'completed',
          results: messageResults
        });

        console.log(`✅ Scheduled message "${scheduledMessage.title}" sent successfully`);

      } catch (error) {
        console.error(`Error executing scheduled message ${scheduledMessage._id}:`, error);
        
        // Mark as failed
        scheduledMessage.status = 'failed';
        await scheduledMessage.save();

        results.push({
          scheduledMessageId: scheduledMessage._id,
          title: scheduledMessage.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    // If called via API, return results
    if (res) {
      res.json({
        message: `Processed ${dueMessages.length} scheduled messages`,
        results
      });
    }

    return results;
  } catch (error) {
    console.error('Error executing scheduled messages:', error);
    if (res) {
      res.status(500).json({ error: error.message });
    }
    throw error;
  }
};

module.exports = {
  createScheduledMessage,
  getScheduledMessages,
  getScheduledMessage,
  updateScheduledMessage,
  deleteScheduledMessage,
  executeScheduledMessages
}; 