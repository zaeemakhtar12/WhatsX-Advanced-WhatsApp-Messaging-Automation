require('dotenv').config();
const mongoose = require('mongoose');
const ScheduledMessage = require('./src/models/scheduledMessageModel');

async function testScheduledMessage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test data similar to what frontend sends
    const testData = {
      userId: new mongoose.Types.ObjectId('688096bc9ac3a61da8524e94'), // Use the admin user ID from logs
      recipient: '1234567890',
      recipientName: 'Test User',
      message: 'Test scheduled message',
      scheduledDate: new Date('2025-07-25T10:30:00.000Z'),
      scheduledTime: '10:30',
      messageType: 'regular',
      templateId: null,
      isRecurring: false,
      recurringPattern: undefined
    };

    console.log('Creating scheduled message with data:', testData);

    const scheduledMessage = new ScheduledMessage(testData);
    await scheduledMessage.save();

    console.log('✅ Scheduled message created successfully:', scheduledMessage._id);
    console.log('Saved data:', scheduledMessage);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testScheduledMessage(); 