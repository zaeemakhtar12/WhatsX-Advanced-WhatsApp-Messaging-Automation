const Message = require('../models/messageModel');

// Send a regular message (existing functionality)
const sendMessage = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const senderId = req.user?.id; // Changed from userId to id

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const newMsg = new Message({ 
      senderId, 
      recipient, 
      message,
      messageType: 'regular'
    });
    await newMsg.save();

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send bulk messages (without WhatsApp)
const sendBulkMessage = async (req, res) => {
  try {
    const { contacts, message, templateId } = req.body;
    const senderId = req.user?.id; // Changed from userId to id

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided' });
    }

    const results = [];
    const errors = [];

    // Send to each contact
    for (const contact of contacts) {
      try {
        // Create message record in database
        const newMsg = new Message({
          senderId,
          recipient: contact.number || contact.phone,
          message: message || `Template message`,
          messageType: templateId ? 'template' : 'bulk',
          templateId: templateId || null,
          recipientName: contact.name,
          status: 'sent'
        });

        await newMsg.save();
        results.push({
          recipient: contact.number || contact.phone,
          status: 'success',
          messageId: newMsg._id
        });
      } catch (error) {
        errors.push({
          recipient: contact.number || contact.phone,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: 'Bulk message processing completed',
      totalSent: results.length,
      totalErrors: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Bulk message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all messages for a user (including executed scheduled messages)
const getMessages = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const { page = 1, limit = 10, search = '', messageType = '' } = req.query;
    
    // Build filter for regular messages
    const messageFilter = { senderId };
    if (search) {
      messageFilter.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } }
      ];
    }
    if (messageType) {
      messageFilter.messageType = messageType;
    }

    // Build filter for executed scheduled messages
    const scheduledFilter = { 
      userId: senderId,
      isExecuted: true // Only show executed scheduled messages
    };
    if (search) {
      scheduledFilter.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } }
      ];
    }
    if (messageType === 'scheduled') {
      // If filtering by scheduled type, only get scheduled messages
    } else if (messageType && messageType !== '') {
      scheduledFilter.messageType = messageType;
    }

    // Get both regular messages and executed scheduled messages
    const Message = require('../models/messageModel');
    const ScheduledMessage = require('../models/scheduledMessageModel');

    const [regularMessages, scheduledMessages] = await Promise.all([
      Message.find(messageFilter).populate('templateId', 'name'),
      ScheduledMessage.find(scheduledFilter).populate('templateId', 'name')
    ]);

    // Combine and format messages
    const allMessages = [
      ...regularMessages.map(msg => ({
        ...msg.toObject(),
        messageSource: 'regular',
        createdAt: msg.createdAt
      })),
      ...scheduledMessages.map(msg => ({
        ...msg.toObject(),
        _id: msg._id,
        senderId: msg.userId,
        messageSource: 'scheduled',
        messageType: 'scheduled',
        status: 'sent',
        createdAt: msg.executedAt || msg.createdAt
      }))
    ];

    // Sort by creation date (newest first)
    allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedMessages = allMessages.slice(skip, skip + parseInt(limit));

    const total = allMessages.length;

    res.status(200).json({
      messages: paginatedMessages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: paginatedMessages.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const senderId = req.user?.id; // Changed from userId to id
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const stats = await Message.aggregate([
      { $match: { senderId: req.user.id } },
      {
        $group: {
          _id: '$messageType',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Message.countDocuments({ senderId });
    
    res.status(200).json({
      total,
      byType: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message (both regular and executed scheduled messages)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user?.id;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const Message = require('../models/messageModel');
    const ScheduledMessage = require('../models/scheduledMessageModel');

    // Try to delete from Message collection first
    let deletedMessage = await Message.findOneAndDelete({ 
      _id: id, 
      senderId 
    });

    // If not found in Message collection, try ScheduledMessage collection
    if (!deletedMessage) {
      deletedMessage = await ScheduledMessage.findOneAndDelete({ 
        _id: id, 
        userId: senderId,
        isExecuted: true // Only allow deleting executed scheduled messages
      });
    }

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const senderId = req.user?.id; // Changed from userId to id
    const userRole = req.user?.role;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    let messageQuery = {};
    if (userRole !== 'admin') {
      messageQuery.senderId = senderId;
    }

    // Get message statistics
    const totalMessages = await Message.countDocuments(messageQuery);
    const sentMessages = await Message.countDocuments({ ...messageQuery, status: 'sent' });
    const failedMessages = await Message.countDocuments({ ...messageQuery, status: 'failed' });
    const pendingMessages = await Message.countDocuments({ ...messageQuery, status: 'pending' });

    // Get recent messages (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMessages = await Message.countDocuments({
      ...messageQuery,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get daily message counts for chart (last 7 days)
    const dailyStats = await Message.aggregate([
      {
        $match: {
          ...messageQuery,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Calculate success rate
    const successRate = totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0;

    res.status(200).json({
      totalMessages,
      sentMessages,
      failedMessages,
      pendingMessages,
      recentMessages,
      successRate,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  sendBulkMessage,
  getMessages,
  getMessageStats,
  deleteMessage,
  getDashboardStats
};