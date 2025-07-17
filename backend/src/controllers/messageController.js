const Message = require('../models/messageModel');

// ✅ Send a message
const sendMessage = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const newMsg = new Message({ senderId, recipient, message });
    await newMsg.save();

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get message logs
const getMessageLogs = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const messages = await Message.find({ senderId: userId }).sort({ timestamp: -1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Correct Export
module.exports = {
  sendMessage,
  getMessageLogs,
};
