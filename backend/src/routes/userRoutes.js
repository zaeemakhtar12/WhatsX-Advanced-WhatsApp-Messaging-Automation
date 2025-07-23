const express = require('express');
const { 
    registerUser, 
    loginUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    updateUserRole 
} = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Public Routes
router.post('/register', ValidationMiddleware.validateRegistration, registerUser);
router.post('/login', ValidationMiddleware.validateLogin, loginUser);

// Admin-protected routes
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.get('/users/:id', verifyToken, requireRole('admin'), getUserById);
router.put('/users/:id', verifyToken, requireRole('admin'), updateUser);
router.delete('/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.patch('/users/:id/role', verifyToken, requireRole('admin'), updateUserRole);

module.exports = router;