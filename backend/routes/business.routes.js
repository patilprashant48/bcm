const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isBusinessUser } = require('../middleware/roleCheck');
const projectController = require('../controllers/projectController');

// Business onboarding routes
router.post('/onboarding/personal', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Implement personal profile submission
    res.json({ success: true, message: 'Personal profile saved' });
});

router.post('/onboarding/business', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Implement business profile submission
    res.json({ success: true, message: 'Business profile saved' });
});

router.post('/onboarding/documents', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Implement document upload
    res.json({ success: true, message: 'Documents uploaded' });
});

router.post('/onboarding/banking', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Implement banking details submission
    res.json({ success: true, message: 'Banking details saved' });
});

router.post('/onboarding/submit', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Submit for admin approval
    res.json({ success: true, message: 'Submitted for approval' });
});

router.get('/profile', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Get business profile
    res.json({ success: true, profile: {} });
});

router.get('/approval-status', authenticateToken, isBusinessUser, async (req, res) => {
    // TODO: Get approval status
    res.json({ success: true, status: 'NEW' });
});

// Project routes for business users
router.post('/projects', authenticateToken, isBusinessUser, projectController.createProject);
router.get('/projects', authenticateToken, isBusinessUser, projectController.getMyProjects);
router.get('/projects/:id', authenticateToken, isBusinessUser, projectController.getProjectById);
router.put('/projects/:id', authenticateToken, isBusinessUser, projectController.updateProject);
router.delete('/projects/:id', authenticateToken, isBusinessUser, projectController.deleteProject);

module.exports = router;
