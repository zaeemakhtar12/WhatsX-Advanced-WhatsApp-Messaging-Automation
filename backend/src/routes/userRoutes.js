const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Example admin-protected route
router.get('/users', verifyToken, checkRole('admin'), (req, res) => {
  res.json({ message: 'This is the list of all users' });
});

module.exports = router;
