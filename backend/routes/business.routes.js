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

const shareController = require('../controllers/shareController');
const capitalController = require('../controllers/capitalController');

// Capital tool routes for business users
router.post('/capital/shares', authenticateToken, isBusinessUser, shareController.createShare);
router.post('/capital/loans', authenticateToken, isBusinessUser, capitalController.createLoan);
router.post('/capital/partnerships', authenticateToken, isBusinessUser, capitalController.createPartnership);

router.get('/capital', authenticateToken, isBusinessUser, async (req, res) => {
    // Aggregate result: Shares + Capital Options
    try {
        const userId = req.user.id;
        const models = require('../database/mongodb-schema');

        // Find projects for this user
        const projects = await models.Project.find({ userId });
        const projectIds = projects.map(p => p._id);

        const shares = await models.Share.find({ projectId: { $in: projectIds } });
        const options = await models.CapitalOption.find({ projectId: { $in: projectIds } });
        // FDs are linked to business user directly? 
        // fdsController createScheme uses req.user.id as createdBy.
        // FDScheme schema has 'createdBy'.
        const fds = await models.FDScheme.find({ createdBy: userId });

        res.json({
            success: true,
            shares,
            capitalTools: options,
            fds
        });
    } catch (error) {
        console.error('Get Capital Tools error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch capital tools' });
    }
});

const planController = require('../controllers/planController');

// Active plan route for business panel  
router.get('/active-plan', authenticateToken, isBusinessUser, planController.getActivePlan);

// Legal Templates for business users
router.get('/documents/templates', authenticateToken, isBusinessUser, async (req, res) => {
    try {
        const models = require('../database/mongodb-schema');
        const templates = await models.DocumentTemplate.find({ isActive: true }).sort({ updatedAt: -1 });
        res.json({ success: true, templates });
    } catch (error) {
        console.error('Get Legal Templates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }
});

module.exports = router;
