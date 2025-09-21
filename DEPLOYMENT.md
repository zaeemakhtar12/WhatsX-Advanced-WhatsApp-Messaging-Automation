# 🚀 WhatsX Deployment Guide: Vercel + Render

## 📋 Quick Setup

### 1. Backend on Render
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. **New Web Service** → Connect WhatsX repository
3. **Settings:**
   - Name: `whatsx-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsx
   JWT_SECRET=your-super-secret-jwt-key-here
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_SENDER=your-verified-sender@example.com
   CLIENT_ORIGIN=https://your-frontend-url.vercel.app
   ```

### 2. Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **New Project** → Import WhatsX repository
3. **Settings:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

### 3. Database Setup
1. **MongoDB Atlas** (free tier)
2. Create cluster → Get connection string
3. Add to Render environment variables

### 4. Email Setup
1. **SendGrid** (free tier)
2. Create API key
3. Verify sender email
4. Add credentials to Render

## ✅ Test Your Deployment
1. Register new user
2. Check email verification
3. Connect WhatsApp
4. Send test message

**Your app will be live in 15 minutes! 🎉**
