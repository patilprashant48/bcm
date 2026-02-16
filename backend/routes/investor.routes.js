const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isInvestor } = require('../middleware/roleCheck');
const investorController = require('../controllers/investorController');

// Investor-specific routes for mobile app
router.get('/projects/live', authenticateToken, isInvestor, investorController.getLiveProjects);
router.get('/projects/:id', authenticateToken, isInvestor, investorController.getProjectDetails);
router.post('/buy', authenticateToken, isInvestor, investorController.buyShares);
router.get('/portfolio', authenticateToken, isInvestor, investorController.getPortfolio);
router.post('/watchlist/add', authenticateToken, isInvestor, investorController.addToWatchlist);
router.get('/watchlist', authenticateToken, isInvestor, investorController.getWatchlist);
router.get('/announcements', authenticateToken, isInvestor, investorController.getAnnouncements);
router.get('/fds', authenticateToken, isInvestor, require('../controllers/fdsController').getActiveSchemes); // Direct link to FDS controller

module.exports = router;
