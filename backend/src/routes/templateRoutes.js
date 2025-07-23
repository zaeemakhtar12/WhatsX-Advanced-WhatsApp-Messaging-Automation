const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Public routes (accessible to all authenticated users)
router.get('/templates', templateController.getTemplates);
router.get('/templates/categories', templateController.getCategories);
router.get('/templates/:id', templateController.getTemplate);
router.post('/templates/:id/use', templateController.useTemplate);

// Admin-only routes
router.post('/templates', checkRole('admin'), templateController.createTemplate);
router.put('/templates/:id', checkRole('admin'), templateController.updateTemplate);
router.delete('/templates/:id', checkRole('admin'), templateController.deleteTemplate);
router.get('/templates-stats', checkRole('admin'), templateController.getTemplateStats);

module.exports = router; 