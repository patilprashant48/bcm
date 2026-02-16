const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const shareController = require('../controllers/shareController');

const { isAdmin } = require('../middleware/roleCheck');

// Share routes
router.post('/', authenticateToken, shareController.createShare);
router.get('/', authenticateToken, shareController.getShares); // List shares
router.post('/:shareId/approve', authenticateToken, isAdmin, shareController.approveShare); // Admin Approval
router.post('/:shareId/buy', authenticateToken, shareController.buyShares);

// TODO: Sell shares
router.post('/:shareId/sell', authenticateToken, async (req, res) => {
    res.json({ success: true, message: 'Sell feature coming soon' });
});

router.get('/holdings', authenticateToken, async (req, res) => {
    // TODO: Get user holdings
    res.json({ success: true, holdings: [] });
});

module.exports = router;
