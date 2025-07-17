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
            role,
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
        const { email, password, role } = req.body; // ✅ also receive role

        // Step 1: Find user by email and role
        const user = await User.findOne({ email, role }); // ✅ match both email and role

        if (!user) {
            return res.status(404).json({ message: 'User not found or role mismatch' });
        }

        // Step 2: Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Step 3: Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Step 4: Send token in the response
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
