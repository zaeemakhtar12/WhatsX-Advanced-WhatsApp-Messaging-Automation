const Message = require('../models/messageModel');
const twilio = require('twilio');

// Function to initialize Twilio client when needed
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('❌ Twilio credentials not found in environment variables');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set ✅' : 'Missing ❌');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set ✅' : 'Missing ❌');
    console.log('TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM ? 'Set ✅' : 'Missing ❌');
    return null;
  }
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Twilio initialization error:', error.message);
    return null;
  }
};

// ✅ Send a regular message (existing functionality)
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

// ✅ Send WhatsApp template message
const sendWhatsAppTemplate = async (req, res) => {
  try {
    const { recipient, templateName, templateVariables } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    // Get Twilio client
    const client = getTwilioClient();
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp service not configured properly' });
    }

    // Format phone number for WhatsApp
    const whatsappNumber = `whatsapp:${recipient}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

    // Send WhatsApp template message via Twilio
    const message = await client.messages.create({
      from: fromNumber,
      to: whatsappNumber,
      contentSid: templateName, // Template content SID
      contentVariables: JSON.stringify(templateVariables || {})
    });

    // Save to database
    const newMsg = new Message({
      senderId,
      recipient,
      message: `Template: ${templateName}`,
      messageType: 'whatsapp_template',
      templateName,
      templateVariables,
      twilioSid: message.sid
    });
    await newMsg.save();

    res.status(200).json({ 
      message: 'WhatsApp template sent successfully!', 
      messageSid: message.sid 
    });
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Send bulk WhatsApp template messages
const sendBulkWhatsAppTemplate = async (req, res) => {
  try {
    const { contacts, templateName, templateVariables } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided' });
    }

    // Get Twilio client
    const client = getTwilioClient();
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp service not configured properly' });
    }

    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;
    const results = [];
    const errors = [];

    // Send to each contact
    for (const contact of contacts) {
      try {
        const whatsappNumber = `whatsapp:${contact.number}`;
        
        // Replace variables with contact-specific data if available
        const personalizedVariables = {
          ...templateVariables,
          name: contact.name || templateVariables.name,
          // Add more personalizations as needed
        };

        const message = await client.messages.create({
          from: fromNumber,
          to: whatsappNumber,
          contentSid: templateName,
          contentVariables: JSON.stringify(personalizedVariables)
        });

        // Save to database
        const newMsg = new Message({
          senderId,
          recipient: contact.number,
          message: `Bulk Template: ${templateName} to ${contact.name}`,
          messageType: 'bulk_whatsapp_template',
          templateName,
          templateVariables: personalizedVariables,
          twilioSid: message.sid
        });
        await newMsg.save();

        results.push({
          contact: contact.name,
          number: contact.number,
          status: 'sent',
          messageSid: message.sid
        });

      } catch (error) {
        console.error(`Error sending to ${contact.number}:`, error);
        errors.push({
          contact: contact.name,
          number: contact.number,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `Bulk WhatsApp templates sent! ${results.length} successful, ${errors.length} failed`,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk WhatsApp sending error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Send regular WhatsApp message (non-template)
const sendWhatsAppMessage = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    // Get Twilio client
    const client = getTwilioClient();
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp service not configured properly' });
    }

    // Validate input
    if (!recipient || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    // Format phone numbers properly for WhatsApp
    let formattedRecipient = recipient.toString().trim();
    
    // Remove any non-digit characters except +
    formattedRecipient = formattedRecipient.replace(/[^\d+]/g, '');
    
    // Add + if not present
    if (!formattedRecipient.startsWith('+')) {
      formattedRecipient = '+' + formattedRecipient;
    }

    const whatsappNumber = `whatsapp:${formattedRecipient}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

    console.log('📱 Sending WhatsApp message:');
    console.log('From:', fromNumber);
    console.log('To:', whatsappNumber);
    console.log('Message:', message);

    const twilioMessage = await client.messages.create({
      from: fromNumber,
      to: whatsappNumber,
      body: message
    });

    console.log('✅ WhatsApp message sent successfully:', twilioMessage.sid);

    // Save to database
    const newMsg = new Message({
      senderId,
      recipient: formattedRecipient,
      message,
      messageType: 'whatsapp_message',
      twilioSid: twilioMessage.sid
    });
    await newMsg.save();

    res.status(200).json({ 
      message: 'WhatsApp message sent successfully!', 
      messageSid: twilioMessage.sid 
    });
  } catch (error) {
    console.error('❌ WhatsApp message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get message logs (enhanced)
const getMessageLogs = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const messages = await Message.find({ senderId: userId })
      .sort({ timestamp: -1 })
      .populate('senderId', 'username email');
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  sendWhatsAppTemplate,
  sendBulkWhatsAppTemplate,
  sendWhatsAppMessage,
  getMessageLogs,
};