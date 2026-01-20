const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Business approval routes
router.get('/businesses', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Get all businesses by status
    res.json({ success: true, businesses: [] });
});

router.get('/businesses/:id', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Get business details
    res.json({ success: true, business: {} });
});

router.post('/businesses/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Approve business
    res.json({ success: true, message: 'Business approved' });
});

router.post('/businesses/:id/recheck', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Request recheck
    res.json({ success: true, message: 'Recheck requested' });
});

router.post('/businesses/:id/reject', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Reject business
    res.json({ success: true, message: 'Business rejected' });
});

// Project approval routes
router.get('/projects', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Get all projects by status
    res.json({ success: true, projects: [] });
});

router.post('/projects/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Approve project
    res.json({ success: true, message: 'Project approved' });
});

router.post('/projects/:id/reject', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Reject project
    res.json({ success: true, message: 'Project rejected' });
});

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Get dashboard statistics
    res.json({ success: true, stats: {} });
});

module.exports = router;
