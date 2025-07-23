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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Optional: gives Mongoose more time to connect
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
