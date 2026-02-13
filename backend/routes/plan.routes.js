const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Plan routes
router.get('/', async (req, res) => {
    // TODO: Get all active plans
    res.json({ success: true, plans: [] });
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Create plan
    res.json({ success: true, message: 'Plan created' });
});

router.post('/:planId/activate', authenticateToken, async (req, res) => {
    // TODO: Activate plan for user
    res.json({ success: true, message: 'Plan activated' });
});

router.get('/my-plan', authenticateToken, async (req, res) => {
    // TODO: Get user's active plan
    res.json({ success: true, plan: null });
});

// Alias for business panel compatibility
router.get('/business/active-plan', authenticateToken, async (req, res) => {
    // TODO: Get user's active plan
    res.json({ success: true, plan: null });
});

module.exports = router;
