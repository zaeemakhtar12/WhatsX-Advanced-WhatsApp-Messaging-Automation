const Message = require('../models/messageModel');

// Send a regular message (existing functionality)
const sendMessage = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const senderId = req.user?.userId;

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
    const senderId = req.user?.userId;

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
          contact: contact.number || contact.phone,
          status: 'success',
          messageId: newMsg._id
        });
      } catch (error) {
        errors.push({
          contact: contact.number || contact.phone,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: 'Bulk messages processed',
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

// Get all messages for a user
const getMessages = async (req, res) => {
  try {
    const senderId = req.user?.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const { page = 1, limit = 10, search = '', messageType = '' } = req.query;
    
    // Build filter
    const filter = { senderId };
    if (search) {
      filter.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } }
      ];
    }
    if (messageType) {
      filter.messageType = messageType;
    }

    // Get paginated results
    const skip = (page - 1) * limit;
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('templateId', 'name');

    const total = await Message.countDocuments(filter);

    res.status(200).json({
      messages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: messages.length,
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
    const senderId = req.user?.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const stats = await Message.aggregate([
      { $match: { senderId: req.user.userId } },
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

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const message = await Message.findOneAndDelete({ 
      _id: id, 
      senderId 
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  sendBulkMessage,
  getMessages,
  getMessageStats,
  deleteMessage
};