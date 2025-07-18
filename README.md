# 📱 WhatsX – Advanced WhatsApp Messaging Automation Platform

WhatsX is a powerful full-stack application that enables businesses and marketers to automate and manage WhatsApp messaging workflows at scale. Designed with modularity, security, and usability in mind, it supports user authentication, role-based dashboards, template management, scheduling, and more.

---

## 📌 Key Highlights

- ✅ User and Admin authentication (JWT-based)
- 📤 Send bulk and scheduled WhatsApp messages
- 🗂️ Template management system (create, update, delete)
- 📅 Message scheduling system (single, recurring, delayed)
- 📄 Message logs with filters (date, user, client)
- 👥 Role-based dashboards with permission control
- 💡 Modular folder structure (frontend & backend)
- 🔐 Secure API endpoints
- 📊 Admin analytics (message count, active users)
- 🔧 Easily configurable via `.env` files

---

## 🧩 Features in Detail

### 🔐 User & Admin Authentication
- Register/Login pages for both roles
- JWT token-based authentication
- Password encryption (bcrypt)
- Role field in database to distinguish users

---

### 🧑‍💼 Admin Panel
- Manage users: view, delete, filter
- Manage templates: create, edit, delete, categorize
- View message logs from all users
- See analytics like total messages, success/failure rate

---

### 👤 User Dashboard
- Upload contacts via CSV
- Select message templates
- Schedule single or multiple messages
- View personal message logs
- Create and manage their own templates (if allowed)

---

### 📤 Messaging Module
- Send messages instantly or schedule by time
- Select from saved templates or write new message
- Attach media or links (TBD)
- Backend handles queuing and sending (via WhatsApp Business API or a 3rd-party like Twilio/360dialog)

---

### 📄 Logs & History
- View all sent messages
- Filter by:
  - Client
  - Date range
  - Template used
  - Message status (sent, failed, queued)
- Export logs (TBD)

---

### 🗂️ Template Management
- Admin can:
  - Create global templates
  - Assign templates to specific users or groups
- Users can:
  - Create and use their own templates
- Categories supported (e.g., Promotions, Reminders, OTP)

---

### 🕰️ Scheduling Engine
- Send now / send later options
- Supports daily, weekly, or one-time schedules
- Backend cron-based logic or job queue (e.g., Bull.js or Firebase Functions)

---
