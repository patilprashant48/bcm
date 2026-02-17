const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isInvestor } = require('../middleware/roleCheck');
const investorController = require('../controllers/investorController');
const fdsController = require('../controllers/fdsController');
const shareController = require('../controllers/shareController');
const capitalController = require('../controllers/capitalController');

// Investor-specific routes for mobile app
router.get('/projects/live', authenticateToken, isInvestor, investorController.getLiveProjects);
router.get('/projects/:id', authenticateToken, isInvestor, investorController.getProjectDetails);
router.post('/buy', authenticateToken, isInvestor, investorController.buyShares);
router.get('/portfolio', authenticateToken, isInvestor, investorController.getPortfolio);
router.post('/watchlist/add', authenticateToken, isInvestor, investorController.addToWatchlist);
router.get('/watchlist', authenticateToken, isInvestor, investorController.getWatchlist);
router.get('/announcements', authenticateToken, isInvestor, investorController.getAnnouncements);

// Investment Opportunities
router.get('/fds', authenticateToken, isInvestor, fdsController.getActiveSchemes);
router.get('/shares', authenticateToken, isInvestor, shareController.getShares);
router.get('/capital', authenticateToken, isInvestor, capitalController.getCapitalOptions);

module.exports = router;
