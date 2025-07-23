# WhatsX - WhatsApp Bulk Messaging Platform

## 📱 Overview
WhatsX is a comprehensive WhatsApp bulk messaging platform that allows businesses to send personalized messages, manage templates, schedule campaigns, and track message delivery through an intuitive web interface.

## ✨ Features

### 🔐 **Authentication & Role Management**
- Secure JWT-based authentication
- Role-based access control (Admin/User)
- User registration and login system

### 📧 **Messaging Capabilities**
- Send individual WhatsApp messages
- Bulk messaging with CSV import
- Template-based messaging with variables
- Twilio WhatsApp API integration

### 📊 **Admin Features**
- User management (CRUD operations)
- Template creation and management
- Message logs and analytics
- Template usage statistics

### ⏰ **Scheduling & Automation**
- Schedule messages for future delivery
- Recurring message campaigns
- Message execution tracking

### 📋 **Template Management**
- Create reusable message templates
- Dynamic variable support
- Category-based organization
- Usage tracking and analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Twilio** - WhatsApp API
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **CSS3** - Styling (no external UI library)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Twilio Account with WhatsApp API access

### 1. Clone Repository
```bash
git clone <repository-url>
cd WhatsX
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Database
MONGO_URI=mongodb://localhost:27017/whatsx

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+your-twilio-number

# Server
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev  # Development with nodemon
# OR
npm start    # Production
```

### Start Frontend
```bash
cd frontend
npm start
```

Access the application at: `http://localhost:3000`

## 🔧 Configuration

### Twilio WhatsApp Setup
1. Create a Twilio account
2. Set up WhatsApp Sandbox or get approved sender
3. Configure webhook URLs (if needed)
4. Add your Twilio credentials to `.env`

### MongoDB Setup
- Local MongoDB: `mongodb://localhost:27017/whatsx`
- MongoDB Atlas: Use your connection string
- Ensure proper network access configuration

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Message Endpoints
- `POST /api/whatsapp/message` - Send single message
- `POST /api/whatsapp/bulk-template` - Send bulk template messages
- `GET /api/messages` - Get message logs

### Admin Endpoints (Requires Admin Role)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Template Endpoints
- `GET /api/templates` - Get templates
- `POST /api/templates` - Create template (Admin)
- `PUT /api/templates/:id` - Update template (Admin)
- `DELETE /api/templates/:id` - Delete template (Admin)

## 🏗️ Project Structure

```
WhatsX/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Main application file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature-specific components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main React component
│   ├── package.json
│   └── .env
└── README.md
```

## 🔒 Security Features

- Input validation and sanitization
- JWT token authentication
- Role-based access control
- Environment variable validation
- Error handling with secure error messages

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for MongoDB Atlas

2. **Twilio Authentication Error**
   - Verify Twilio credentials in `.env`
   - Check Twilio account status
   - Ensure WhatsApp number is properly configured

3. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check React version compatibility
   - Verify all environment variables

## 📈 Future Enhancements

- [ ] Message delivery status tracking
- [ ] Advanced analytics dashboard
- [ ] Multi-language template support
- [ ] File attachment support
- [ ] API rate limiting
- [ ] Webhook integration
- [ ] Export functionality for reports

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

---

Built with ❤️ for efficient WhatsApp business communication 