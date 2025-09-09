// userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import your User model
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const AdminRequest = require('../models/adminRequestModel');

// Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Step 1: Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Step 2: Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Step 3: Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Step 4: Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || "user", // Always store a role, default to 'user'
            verified: false,
            otp,
            otpExpiry
        });

        // Step 5: Save the user to the database
        await newUser.save();

        // Step 6: Send OTP email
        await sendEmail({
            to: email,
            subject: 'Your WhatsApp Bulk Messenger Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `<p>Your verification code is: <b>${otp}</b></p>`
        });

        res.status(201).json({ message: 'User created successfully. Please check your email for the verification code.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body; // receive role

        // Step 1: Find user by email and role
        const user = await User.findOne({ email, role });

        if (!user) {
            return res.status(404).json({ message: 'User not found or role mismatch' });
        }

        // Block login if not verified
        if (!user.verified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        // Step 2: Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured!');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Step 3: Generate JWT token with consistent property names
        const token = jwt.sign(
            { 
                id: user._id.toString(), // Use 'id' instead of 'userId' for consistency
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extended to 24 hours for better UX
        );
        
        // Step 4: Send token and role in the response
        res.json({ message: 'Login successful', token, role: user.role });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password field
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, '-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;
        
        const user = await User.findByIdAndUpdate(
            id,
            { username, email, role },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update User Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get user counts by role
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get daily user registrations for chart (last 7 days)
    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    res.status(200).json({
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers,
      dailyRegistrations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user's profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update current user's profile (email, username)
const updateProfile = async (req, res) => {
    try {
        const { email, username } = req.body;
        const updates = {};
        if (email) updates.email = email;
        if (username) updates.username = username;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }
        // Check for unique email if changing
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change current user's password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new password are required' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.verified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        if (!user.otp || !user.otpExpiry || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Handle admin registration request
const adminRequest = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            businessName, 
            businessType, 
            reasonForAdminAccess, 
            contactNumber 
        } = req.body;
        
        // Validate required fields
        if (!username || !email || !password || !businessName || !businessType || !reasonForAdminAccess || !contactNumber) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate minimum length for reason
        if (reasonForAdminAccess.length < 10) {
            return res.status(400).json({ message: 'Reason for admin access must be at least 10 characters long.' });
        }

        // Prevent duplicate requests
        const existing = await AdminRequest.findOne({ email, status: 'pending' });
        if (existing) {
            return res.status(400).json({ message: 'A pending request already exists for this email.' });
        }

        // Hash password before storing request
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save request
        const request = new AdminRequest({ 
            username, 
            email, 
            password: hashedPassword, 
            businessName, 
            businessType, 
            reasonForAdminAccess, 
            contactNumber 
        });
        await request.save();

        // Try to send email notification (but don't fail if email fails)
        try {
            if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_SENDER) {
                await sendEmail({
                    to: process.env.SENDGRID_SENDER, // Team email
                    subject: 'New Admin Access Request - WhatsX',
                    text: `
New Admin Access Request

Full Name: ${username}
Email: ${email}
Business Name: ${businessName}
Business Type: ${businessType}
Contact Number: ${contactNumber}
Reason for Admin Access: ${reasonForAdminAccess}

Request submitted at: ${new Date().toLocaleString()}
                    `,
                    html: `
                        <h2>New Admin Access Request - WhatsX</h2>
                        <p><strong>Full Name:</strong> ${username}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Business Name:</strong> ${businessName}</p>
                        <p><strong>Business Type:</strong> ${businessType}</p>
                        <p><strong>Contact Number:</strong> ${contactNumber}</p>
                        <p><strong>Reason for Admin Access:</strong></p>
                        <p>${reasonForAdminAccess}</p>
                        <hr>
                        <p><em>Request submitted at: ${new Date().toLocaleString()}</em></p>
                    `
                });
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({ message: 'Request submitted successfully. Our team will review your request and contact you within 24-48 hours.' });
    } catch (error) {
        console.error('Admin request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// List all admin requests (admin only)
const listAdminRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Approve admin request
const approveAdminRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AdminRequest.findById(id);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: request.email });
        if (existingUser) {
            // Update existing user to admin
            existingUser.role = 'admin';
            await existingUser.save();
        } else {
            // Create new admin user with provided credentials
            // Password was hashed at request time; reuse hashed value
            const newAdminUser = new User({
                username: request.username,
                email: request.email,
                password: request.password,
                role: 'admin',
                verified: true // Auto-verify admin users
            });
            await newAdminUser.save();
        }

        // Update request status
        request.status = 'approved';
        await request.save();

        // Send approval email
        try {
            if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_SENDER) {
                await sendEmail({
                    to: request.email,
                    subject: 'Admin Access Approved - WhatsX',
                    text: `Dear ${request.username},\n\nYour request for admin access to WhatsX has been approved! You can now log in with your email and password.\n\nBest regards,\nWhatsX Team`,
                    html: `
                        <h2>Admin Access Approved - WhatsX</h2>
                        <p>Dear ${request.username},</p>
                        <p>Your request for admin access to WhatsX has been <strong>approved</strong>!</p>
                        <p>You can now log in with your email and password.</p>
                        <p><strong>Login Details:</strong></p>
                        <ul>
                            <li>Email: ${request.email}</li>
                            <li>Password: (the password you provided)</li>
                        </ul>
                        <p>Best regards,<br>WhatsX Team</p>
                    `
                });
            }
        } catch (emailError) {
            console.error('Approval email failed:', emailError);
        }

        res.json({ message: 'Request approved and user promoted to admin.' });
    } catch (error) {
        console.error('Approve admin request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reject admin request
const rejectAdminRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AdminRequest.findById(id);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        // Send rejection email before deleting
        try {
            if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_SENDER) {
                await sendEmail({
                    to: request.email,
                    subject: 'Admin Access Request - WhatsX',
                    text: `Dear ${request.username},\n\nThank you for your interest in WhatsX admin access. After careful review, we regret to inform you that your request has not been approved at this time.\n\nWe appreciate your understanding.\n\nBest regards,\nWhatsX Team`,
                    html: `
                        <h2>Admin Access Request - WhatsX</h2>
                        <p>Dear ${request.username},</p>
                        <p>Thank you for your interest in WhatsX admin access.</p>
                        <p>After careful review, we regret to inform you that your request has <strong>not been approved</strong> at this time.</p>
                        <p>We appreciate your understanding.</p>
                        <p>Best regards,<br>WhatsX Team</p>
                    `
                });
            }
        } catch (emailError) {
            console.error('Rejection email failed:', emailError);
        }

        await AdminRequest.findByIdAndDelete(id);
        res.json({ message: 'Request rejected, user notified, and request deleted.' });
    } catch (error) {
        console.error('Reject admin request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserStats,
    getProfile,
    updateProfile,
    changePassword,
    verifyOtp,
    adminRequest,
    listAdminRequests,
    approveAdminRequest,
    rejectAdminRequest
};