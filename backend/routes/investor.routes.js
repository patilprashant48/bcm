const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isInvestor } = require('../middleware/roleCheck');

// Investor-specific routes for mobile app
router.get('/projects/live', authenticateToken, isInvestor, async (req, res) => {
    // TODO: Get all live projects
    res.json({ success: true, projects: [] });
});

router.get('/portfolio', authenticateToken, isInvestor, async (req, res) => {
    // TODO: Get investor portfolio
    res.json({ success: true, portfolio: {} });
});

router.post('/watchlist/add', authenticateToken, isInvestor, async (req, res) => {
    // TODO: Add to watchlist
    res.json({ success: true, message: 'Added to watchlist' });
});

router.get('/watchlist', authenticateToken, isInvestor, async (req, res) => {
    // TODO: Get watchlist
    res.json({ success: true, watchlist: [] });
});

router.get('/announcements', authenticateToken, isInvestor, async (req, res) => {
    // TODO: Get active announcements
    res.json({ success: true, announcements: [] });
});

module.exports = router;
