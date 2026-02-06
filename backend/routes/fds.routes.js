const express = require('express');
const router = express.Router();
const fdsController = require('../controllers/fdsController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Investor Routes
router.get('/active', authenticateToken, fdsController.getActiveSchemes);
router.post('/invest', authenticateToken, fdsController.investInScheme);

// Admin routes for FDS Scheme Master
// Scheme Management (Admin & Business)
router.post('/schemes', authenticateToken, fdsController.createScheme); // Role logic inside controller
router.get('/schemes', authenticateToken, fdsController.getSchemes); // TODO: Filter for Business User?
router.patch('/schemes/:id/status', authenticateToken, isAdmin, fdsController.updateSchemeStatus);
router.post('/schemes/:id/approval', authenticateToken, isAdmin, fdsController.manageSchemeApproval); // New approval route

module.exports = router;
