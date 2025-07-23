const ScheduledMessage = require('../models/scheduledMessageModel');
const Message = require('../models/messageModel');

// Create a new scheduled message
const createScheduledMessage = async (req, res) => {
  try {
    const { 
      recipient, 
      recipientName, 
      message, 
      messageType, 
      templateId, 
      scheduledDate, 
      scheduledTime, 
      isRecurring, 
      recurringPattern 
    } = req.body;
    
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = new ScheduledMessage({
      userId,
      recipient,
      recipientName,
      message,
      messageType: messageType || 'regular',
      templateId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : undefined
    });

    await scheduledMessage.save();
    res.status(201).json({ 
      message: 'Scheduled message created successfully', 
      scheduledMessage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all scheduled messages for a user
const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessages = await ScheduledMessage.find({ userId })
      .populate('templateId', 'name')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ scheduledMessages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a scheduled message
const updateScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = await ScheduledMessage.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    ).populate('templateId', 'name');

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    res.status(200).json({ 
      message: 'Scheduled message updated successfully', 
      scheduledMessage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a scheduled message
const deleteScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessage = await ScheduledMessage.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    res.status(200).json({ message: 'Scheduled message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Execute due scheduled messages (this would typically be called by a cron job)
const executeScheduledMessages = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD format

    const dueMessages = await ScheduledMessage.find({
      scheduledDate: { $lte: new Date(currentDate) },
      scheduledTime: { $lte: currentTime },
      isExecuted: false
    }).populate('templateId');

    for (const scheduledMsg of dueMessages) {
      try {
        // Create and save the message
        const message = new Message({
          senderId: scheduledMsg.userId,
          recipient: scheduledMsg.recipient,
          recipientName: scheduledMsg.recipientName,
          message: scheduledMsg.message,
          messageType: 'scheduled',
          templateId: scheduledMsg.templateId?._id,
          status: 'sent'
        });

        await message.save();

        // Mark as executed
        scheduledMsg.isExecuted = true;
        scheduledMsg.executedAt = now;
        await scheduledMsg.save();

        // If recurring, create next instance
        if (scheduledMsg.isRecurring) {
          const nextDate = new Date(scheduledMsg.scheduledDate);
          
          switch (scheduledMsg.recurringPattern) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
          }

          const newScheduledMessage = new ScheduledMessage({
            ...scheduledMsg.toObject(),
            _id: undefined,
            scheduledDate: nextDate,
            isExecuted: false,
            executedAt: undefined,
            createdAt: now
          });

          await newScheduledMessage.save();
        }

        console.log(`Executed scheduled message: ${scheduledMsg._id}`);
      } catch (error) {
        console.error(`Failed to execute scheduled message ${scheduledMsg._id}:`, error);
      }
    }

    return { executed: dueMessages.length };
  } catch (error) {
    console.error('Error executing scheduled messages:', error);
    throw error;
  }
};

module.exports = {
  createScheduledMessage,
  getScheduledMessages,
  updateScheduledMessage,
  deleteScheduledMessage,
  executeScheduledMessages
}; 