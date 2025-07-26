const express = require('express');
const { 
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
} = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Public Routes
router.post('/register', ValidationMiddleware.validateRegistration, registerUser);
router.post('/login', ValidationMiddleware.validateLogin, loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/admin-request', adminRequest);

// Profile routes (authenticated user) - MUST come before /users/:id
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.patch('/profile/password', verifyToken, changePassword);

// Admin-protected routes
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.get('/users/stats', verifyToken, requireRole('admin'), getUserStats);
router.get('/admin-requests', verifyToken, requireRole('admin'), listAdminRequests);
router.post('/admin-requests/:id/approve', verifyToken, requireRole('admin'), approveAdminRequest);
router.post('/admin-requests/:id/reject', verifyToken, requireRole('admin'), rejectAdminRequest);

// User management routes (parameterized) - MUST come after specific routes
router.get('/users/:id', verifyToken, requireRole('admin'), getUserById);
router.put('/users/:id', verifyToken, requireRole('admin'), updateUser);
router.delete('/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.patch('/users/:id/role', verifyToken, requireRole('admin'), updateUserRole);

module.exports = router;