// userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import your User model

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

        // Step 3: Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || "user", // Always store a role, default to 'user'
        });

        // Step 4: Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body; // receive role
        console.log('Login attempt for:', email, 'with role:', role);

        // Step 1: Find user by email and role
        const user = await User.findOne({ email, role });

        if (!user) {
            console.log('User not found or role mismatch for:', email, role);
            return res.status(404).json({ message: 'User not found or role mismatch' });
        }

        // Step 2: Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
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

        console.log('Login successful for user:', email, 'role:', user.role);
        
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
            { new: true }
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

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserStats
};