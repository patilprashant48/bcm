const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Capital option routes
router.post('/', authenticateToken, async (req, res) => {
    // TODO: Create capital option
    res.json({ success: true, message: 'Capital option created' });
});

router.get('/project/:projectId', authenticateToken, async (req, res) => {
    // TODO: Get capital options for project
    res.json({ success: true, options: [] });
});

router.post('/invest', authenticateToken, async (req, res) => {
    // TODO: Invest in capital option
    res.json({ success: true, message: 'Investment successful' });
});

router.get('/investments', authenticateToken, async (req, res) => {
    // TODO: Get user investments
    res.json({ success: true, investments: [] });
});

module.exports = router;
