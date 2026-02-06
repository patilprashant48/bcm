const express = require('express');
const router = express.Router();
const fdsController = require('../controllers/fdsController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Investor Routes
router.get('/active', authenticateToken, fdsController.getActiveSchemes);
router.post('/invest', authenticateToken, fdsController.investInScheme);

// Admin routes for FDS Scheme Master
router.post('/schemes', authenticateToken, isAdmin, fdsController.createScheme);
router.get('/schemes', authenticateToken, isAdmin, fdsController.getSchemes);
router.patch('/schemes/:id/status', authenticateToken, isAdmin, fdsController.updateSchemeStatus);

module.exports = router;
