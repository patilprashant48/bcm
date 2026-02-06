const express = require('express');
const router = express.Router();
const fdsController = require('../controllers/fdsController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Admin routes for FDS Scheme Master
router.post('/schemes', authenticateToken, isAdmin, fdsController.createScheme);
router.get('/schemes', authenticateToken, isAdmin, fdsController.getSchemes);
router.patch('/schemes/:id/status', authenticateToken, isAdmin, fdsController.updateSchemeStatus);

module.exports = router;
