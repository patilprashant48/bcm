const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// Business approval routes
router.get('/businesses', authenticateToken, isAdmin, adminController.getBusinesses);
router.post('/businesses/:id/approve', authenticateToken, isAdmin, adminController.approveBusiness);
router.post('/businesses/:id/reject', authenticateToken, isAdmin, adminController.rejectBusiness);
router.post('/businesses/:id/recheck', authenticateToken, isAdmin, adminController.recheckBusiness);

// Project approval routes
router.get('/projects', authenticateToken, isAdmin, adminController.getProjects);
router.post('/projects/:id/approve', authenticateToken, isAdmin, adminController.approveProject);
router.post('/projects/:id/reject', authenticateToken, isAdmin, adminController.rejectProject);
router.post('/projects/:id/recheck', authenticateToken, isAdmin, adminController.recheckProject);

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, isAdmin, adminController.getDashboardStats);

module.exports = router;
