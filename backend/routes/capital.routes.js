const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const capitalController = require('../controllers/capitalController');

// Capital option routes
router.get('/', authenticateToken, capitalController.getCapitalOptions);
router.post('/invest', authenticateToken, capitalController.investInCapitalOption);

// Creation routes (Admin/Business)
router.post('/loans', authenticateToken, capitalController.createLoan);
router.post('/partnerships', authenticateToken, capitalController.createPartnership);

router.get('/project/:projectId', authenticateToken, async (req, res) => {
    // TODO: Get capital options for project
    res.json({ success: true, options: [] });
});

router.get('/investments', authenticateToken, async (req, res) => {
    // TODO: Get user investments
    res.json({ success: true, investments: [] });
});

module.exports = router;
