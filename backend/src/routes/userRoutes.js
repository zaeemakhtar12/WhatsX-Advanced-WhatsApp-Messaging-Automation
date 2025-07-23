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
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Public Routes
router.post('/register', ValidationMiddleware.validateRegistration, registerUser);
router.post('/login', ValidationMiddleware.validateLogin, loginUser);

// Admin-protected routes
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);
router.get('/users/:id', verifyToken, checkRole('admin'), getUserById);
router.put('/users/:id', verifyToken, checkRole('admin'), updateUser);
router.delete('/users/:id', verifyToken, checkRole('admin'), deleteUser);
router.patch('/users/:id/role', verifyToken, checkRole('admin'), updateUserRole);

module.exports = router;