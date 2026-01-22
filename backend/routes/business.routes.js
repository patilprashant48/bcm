const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isBusinessUser } = require('../middleware/roleCheck');
const projectController = require('../controllers/projectController');
const businessController = require('../controllers/businessController');

// Business onboarding routes
router.post('/onboarding', authenticateToken, isBusinessUser, businessController.submitOnboarding);
router.get('/profile', authenticateToken, isBusinessUser, businessController.getProfile);
router.get('/approval-status', authenticateToken, isBusinessUser, businessController.getApprovalStatus);
router.get('/dashboard/stats', authenticateToken, isBusinessUser, businessController.getDashboardStats);

// Project routes for business users
router.post('/projects', authenticateToken, isBusinessUser, projectController.createProject);
router.get('/projects', authenticateToken, isBusinessUser, projectController.getMyProjects);
router.get('/projects/:id', authenticateToken, isBusinessUser, projectController.getProjectById);
router.put('/projects/:id', authenticateToken, isBusinessUser, projectController.updateProject);
router.delete('/projects/:id', authenticateToken, isBusinessUser, projectController.deleteProject);

module.exports = router;
