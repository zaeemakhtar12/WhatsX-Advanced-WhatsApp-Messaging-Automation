const ScheduledMessage = require('../models/scheduledMessageModel');
const Message = require('../models/messageModel');

// Create a scheduled message
const createScheduledMessage = async (req, res) => {
  try {
    const { 
      recipients, 
      message, 
      scheduledDate, 
      messageType, 
      templateId, 
      isRecurring, 
      recurringPattern 
    } = req.body;
    
    const userId = req.user?.id; // Changed from userId to id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient is required' });
    }

    if (!message || !scheduledDate) {
      return res.status(400).json({ error: 'Message and scheduled date are required' });
    }

    // Parse the scheduled date
    const scheduleDateTime = new Date(scheduledDate);
    const scheduledTime = scheduleDateTime.toTimeString().slice(0, 5); // Extract HH:MM format

    const scheduledMessages = [];

    // Create a scheduled message for each recipient
    for (const recipient of recipients) {
      const scheduledMessage = new ScheduledMessage({
        userId,
        recipient: recipient.phone,
        recipientName: recipient.name,
        message,
        scheduledDate: scheduleDateTime,
        scheduledTime: scheduledTime,
        messageType: messageType || 'regular',
        templateId: templateId || null,
        isRecurring: isRecurring || false,
        recurringPattern: isRecurring ? recurringPattern : undefined
      });

      await scheduledMessage.save();
      scheduledMessages.push(scheduledMessage);
    }
    
    res.status(201).json({
      message: `Successfully scheduled ${scheduledMessages.length} message(s)!`,
      scheduledMessages
    });
  } catch (error) {
    console.error('Error creating scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get scheduled messages for a user
const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user?.id; // Changed from userId to id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const scheduledMessages = await ScheduledMessage.find({ 
      userId,
      isExecuted: false // Only show pending (not executed) scheduled messages
    })
      .populate('templateId', 'name')
      .sort({ scheduledDate: 1 });
    
    res.status(200).json(scheduledMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a scheduled message
const updateScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipients, message, scheduledDate, templateId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find the existing scheduled message
    const existingMessage = await ScheduledMessage.findOne({ 
      _id: id, 
      userId 
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    // Update the message with new data
    existingMessage.message = message;
    existingMessage.scheduledDate = new Date(scheduledDate);
    existingMessage.scheduledTime = new Date(scheduledDate).toTimeString().slice(0, 5);
    existingMessage.templateId = templateId || null;

    // If recipients are provided, update recipient info
    if (recipients && recipients.length > 0) {
      const recipient = recipients[0]; // For single recipient updates
      existingMessage.recipient = recipient.phone;
      existingMessage.recipientName = recipient.name;
    }

    await existingMessage.save();
    
    res.status(200).json({
      message: 'Scheduled message updated successfully',
      scheduledMessage: existingMessage
    });
  } catch (error) {
    console.error('Error updating scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a scheduled message
const deleteScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Changed from userId to id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const deletedMessage = await ScheduledMessage.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!deletedMessage) {
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
    console.log(`🔍 Checking for scheduled messages at ${now.toISOString()}`);

    const dueMessages = await ScheduledMessage.find({
      scheduledDate: { $lte: now },
      isExecuted: false
    }).populate('templateId');

    console.log(`📋 Found ${dueMessages.length} due scheduled messages`);

    for (const scheduledMsg of dueMessages) {
      try {
        console.log(`📤 Executing scheduled message for ${scheduledMsg.recipientName} (${scheduledMsg.recipient})`);
        
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
        console.log(`✅ Created message record: ${message._id}`);

        // Mark as executed
        scheduledMsg.isExecuted = true;
        scheduledMsg.executedAt = now;
        await scheduledMsg.save();
        console.log(`✅ Marked scheduled message as executed: ${scheduledMsg._id}`);

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
          console.log(`🔄 Created recurring message for ${nextDate.toISOString()}`);
        }
      } catch (error) {
        console.error(`❌ Failed to execute scheduled message ${scheduledMsg._id}:`, error);
      }
    }

    return { executed: dueMessages.length };
  } catch (error) {
    console.error('❌ Error executing scheduled messages:', error);
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