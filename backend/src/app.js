const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables first
dotenv.config();

// Validate environment variables
const { validateEnvironment } = require('./config/validateEnv');
validateEnvironment();

const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const scheduledMessageRoutes = require('./routes/scheduledMessageRoutes');
const templateRoutes = require('./routes/templateRoutes');
const ValidationMiddleware = require('./middleware/validation');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(ValidationMiddleware.sanitizeInput);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', scheduledMessageRoutes);
app.use('/api', templateRoutes);

// DB Connection
const connectDB = async () => {
  try {
    // Use the actual MongoDB URI from environment
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    // Connect with supported options
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout (increased)
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      retryWrites: true,
      w: 'majority'
    });
    
    console.log("✅ MongoDB connected successfully");
    
    // Test the connection
    const db = mongoose.connection;
    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    db.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    
    // Provide specific troubleshooting based on error type
    if (err.message.includes('EREFUSED') || err.message.includes('querySrv')) {
      console.log('');
      console.log('🔧 MongoDB Atlas Connection Troubleshooting:');
      console.log('');
      console.log('1. ✅ Check Network Access in MongoDB Atlas:');
      console.log('   - Go to MongoDB Atlas Dashboard');
      console.log('   - Navigate to "Network Access"');
      console.log('   - Add your current IP address: ' + (process.env.MY_IP || 'Check whatismyipaddress.com'));
      console.log('   - Or temporarily allow access from anywhere (0.0.0.0/0)');
      console.log('');
      console.log('2. ✅ Verify Database User Credentials:');
      console.log('   - Username: mzaeemakhtar12');
      console.log('   - Ensure password is correct and has no special characters');
      console.log('   - Check if user has read/write permissions');
      console.log('');
      console.log('3. ✅ Alternative Connection Methods:');
      console.log('   - Try connecting from MongoDB Compass first');
      console.log('   - Use a direct connection instead of SRV');
      console.log('');
      console.log('4. 🌐 Network Issues:');
      console.log('   - Check if your ISP blocks MongoDB ports');
      console.log('   - Try using a VPN if connection fails');
      console.log('   - Ensure port 27017 is not blocked');
      console.log('');
      
      // Suggest alternative connection string
      console.log('📝 Alternative Connection String (if SRV fails):');
      console.log('Replace your MONGO_URI with:');
      console.log('mongodb://mzaeemakhtar12:MongoDBWhatsX@monitor-shard-00-00.sxo6nw2.mongodb.net:27017,monitor-shard-00-01.sxo6nw2.mongodb.net:27017,monitor-shard-00-02.sxo6nw2.mongodb.net:27017/WhatsX?ssl=true&replicaSet=atlas-replica-set&authSource=admin&retryWrites=true&w=majority');
      console.log('');
    }
    
    if (err.message.includes('authentication failed')) {
      console.log('🔐 Authentication Error:');
      console.log('- Check your username and password');
      console.log('- Ensure the database user exists in MongoDB Atlas');
      console.log('- Verify the user has proper permissions');
    }
    
    // Continue running the server even if DB connection fails (for development)
    console.log('⚠️  Server will continue running without database connection...');
    console.log('🚀 You can still test the frontend, but database features won\'t work');
    console.log('');
  }
};

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
