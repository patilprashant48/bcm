const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isBusinessUser } = require('../middleware/roleCheck');
const projectController = require('../controllers/projectController');
const businessController = require('../controllers/businessController');

// Business onboarding routes
router.post('/onboarding', authenticateToken, isBusinessUser, businessController.submitOnboarding);
router.get('/profile', authenticateToken, isBusinessUser, businessController.getProfile);
router.put('/profile', authenticateToken, isBusinessUser, businessController.submitOnboarding);
router.get('/approval-status', authenticateToken, isBusinessUser, businessController.getApprovalStatus);
router.get('/dashboard/stats', authenticateToken, isBusinessUser, businessController.getDashboardStats);

// Project routes for business users
router.post('/projects', authenticateToken, isBusinessUser, projectController.createProject);
router.get('/projects', authenticateToken, isBusinessUser, projectController.getMyProjects);
router.get('/projects/:id', authenticateToken, isBusinessUser, projectController.getProjectById);
router.put('/projects/:id', authenticateToken, isBusinessUser, projectController.updateProject);
router.delete('/projects/:id', authenticateToken, isBusinessUser, projectController.deleteProject);

// Capital tool routes for business users
router.post('/capital/shares', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Create share offering
    res.json({ success: true, message: 'Share offering created successfully' });
});

router.post('/capital/loans', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Create loan offering
    res.json({ success: true, message: 'Loan offering created successfully' });
});

router.post('/capital/partnerships', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Create partnership offering
    res.json({ success: true, message: 'Partnership offering created successfully' });
});

router.get('/capital', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Get all capital tools for business
    res.json({ success: true, capitalTools: [] });
});

// Active plan route for business panel  
router.get('/active-plan', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Get business user's active plan
    res.json({ success: true, plan: null });
});

module.exports = router;
