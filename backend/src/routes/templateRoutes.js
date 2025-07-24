const express = require('express');
const templateController = require('../controllers/templateController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes accessible to all authenticated users
router.get('/templates', verifyToken, templateController.getTemplates);
router.get('/templates/categories', verifyToken, templateController.getTemplateCategories);
router.get('/templates/:id', verifyToken, templateController.getTemplate);
router.post('/templates/:id/use', verifyToken, templateController.useTemplate);

// Routes accessible to admin users only
router.post('/templates', verifyToken, requireRole('admin'), templateController.createTemplate);
router.put('/templates/:id', verifyToken, requireRole('admin'), templateController.updateTemplate);
router.delete('/templates/:id', verifyToken, templateController.deleteTemplate); // Allow users to delete their own templates
router.get('/templates-stats', verifyToken, requireRole('admin'), templateController.getTemplateStats);

module.exports = router; 