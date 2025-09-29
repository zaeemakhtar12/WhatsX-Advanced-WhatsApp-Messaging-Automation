# 🚀 WhatsX Deployment Guide: Vercel + Render (Serverless SMTP for Emails)

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
4. **Environment Variables (Project → Settings → Environment Variables):**
   ```
   # Frontend
   VITE_API_URL=https://your-backend-url.onrender.com/api

   # SMTP (used by the Vercel Serverless email function)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password-or-app-password
   SMTP_FROM=Your App <no-reply@yourdomain.com>
   ```

### 3. Database Setup
1. **MongoDB Atlas** (free tier)
2. Create cluster → Get connection string
3. Add to Render environment variables

### 4. Email Setup (Serverless on Vercel)
To avoid Render free-tier network timeouts, email is sent via a Vercel Serverless Function:

1. Ensure file `frontend/api/send-email.js` exists (already included in repo)
2. Add SMTP env vars in Vercel as shown above
3. Deploy the project — Vercel will expose the function at:
   - `https://<your-vercel-domain>/api/send-email`
4. In Render backend, set env var:
   - `VERCEL_EMAIL_ENDPOINT=https://<your-vercel-domain>/api/send-email`
5. Backend will offload emails to Vercel; if `VERCEL_EMAIL_ENDPOINT` is not set, it will fall back to direct SMTP.

Notes:
- For Gmail, use an App Password and keep 2FA enabled.
- Alternatively, you can use any SMTP provider (Postmark, SendGrid SMTP, Resend SMTP, etc.).

## ✅ Test Your Deployment
1. Register new user
2. Check email verification
3. Connect WhatsApp
4. Send test message

**Your app will be live in 15 minutes! 🎉**
