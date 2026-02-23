const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// Business approval routes
router.get('/businesses', authenticateToken, isAdmin, adminController.getBusinesses);
router.get('/businesses/:id', authenticateToken, isAdmin, adminController.getBusinessDetails);
router.post('/businesses/:id/approve', authenticateToken, isAdmin, adminController.approveBusiness);
router.post('/businesses/:id/reject', authenticateToken, isAdmin, adminController.rejectBusiness);
router.post('/businesses/:id/recheck', authenticateToken, isAdmin, adminController.recheckBusiness);
router.post('/businesses/:id/deactivate', authenticateToken, isAdmin, adminController.deactivateBusiness);
router.post('/businesses/:id/reactivate', authenticateToken, isAdmin, adminController.reactivateBusiness);

// Project approval routes
router.get('/projects', authenticateToken, isAdmin, adminController.getProjects);
router.get('/projects/live', authenticateToken, isAdmin, adminController.getLiveProjects);
router.get('/projects/closed', authenticateToken, isAdmin, adminController.getClosedProjects);
router.post('/projects/:id/approve', authenticateToken, isAdmin, adminController.approveProject);
router.post('/projects/:id/reject', authenticateToken, isAdmin, adminController.rejectProject);
router.post('/projects/:id/recheck', authenticateToken, isAdmin, adminController.recheckProject);
router.post('/projects/:id/close', authenticateToken, isAdmin, adminController.closeProject);
router.post('/projects/:id/live', authenticateToken, isAdmin, adminController.makeProjectLive);

// Customer management
router.get('/customers', authenticateToken, isAdmin, adminController.getCustomers);
router.post('/customers/:id/suspend', authenticateToken, isAdmin, adminController.suspendCustomer);
router.post('/customers/:id/activate', authenticateToken, isAdmin, adminController.activateCustomer);

// KYC management
router.get('/kyc', authenticateToken, isAdmin, adminController.getKYCRequests);
router.post('/kyc/:id/approve', authenticateToken, isAdmin, adminController.approveKYC);
router.post('/kyc/:id/reject', authenticateToken, isAdmin, adminController.rejectKYC);

// Plan management
router.get('/plans', authenticateToken, isAdmin, adminController.getPlans);
router.post('/plans', authenticateToken, isAdmin, adminController.createPlan);
router.put('/plans/:id', authenticateToken, isAdmin, adminController.updatePlan);
router.delete('/plans/:id', authenticateToken, isAdmin, adminController.deletePlan);
router.get('/plans/user-subscriptions', authenticateToken, isAdmin, adminController.getUserPlanSubscriptions);

// Settings
router.get('/settings', authenticateToken, isAdmin, adminController.getSettings);
router.put('/settings', authenticateToken, isAdmin, adminController.updateSettings);

// Capital tools management
router.get('/capital/shares', authenticateToken, isAdmin, adminController.getShares);
router.post('/capital/shares/:id/approve', authenticateToken, isAdmin, adminController.approveShare);
router.post('/capital/shares/:id/reject', authenticateToken, isAdmin, adminController.rejectShare);
router.post('/capital/shares/:id/recheck', authenticateToken, isAdmin, adminController.recheckShare);
router.get('/capital/loans', authenticateToken, isAdmin, adminController.getLoans);
router.post('/capital/loans/:id/approve', authenticateToken, isAdmin, adminController.approveLoan);
router.post('/capital/loans/:id/reject', authenticateToken, isAdmin, adminController.rejectLoan);
router.post('/capital/loans/:id/recheck', authenticateToken, isAdmin, adminController.recheckLoan);
router.get('/capital/fds', authenticateToken, isAdmin, adminController.getFDs);
router.get('/capital/partnerships', authenticateToken, isAdmin, adminController.getPartnerships);
router.post('/capital/partnerships/:id/approve', authenticateToken, isAdmin, adminController.approvePartnership);
router.post('/capital/partnerships/:id/reject', authenticateToken, isAdmin, adminController.rejectPartnership);
router.post('/capital/partnerships/:id/recheck', authenticateToken, isAdmin, adminController.recheckPartnership);

// Legal Templates
router.get('/documents/templates', authenticateToken, isAdmin, adminController.getLegalTemplates);
router.post('/documents/templates', authenticateToken, isAdmin, adminController.createLegalTemplate);
router.put('/documents/templates/:id', authenticateToken, isAdmin, adminController.updateLegalTemplate);
router.delete('/documents/templates/:id', authenticateToken, isAdmin, adminController.deleteLegalTemplate);

// Admin management
router.get('/admins', authenticateToken, isAdmin, adminController.getAdmins);
router.post('/admins', authenticateToken, isAdmin, adminController.createAdmin);
router.put('/admins/:id/status', authenticateToken, isAdmin, adminController.updateAdminStatus);

// Audit logs
router.get('/audit-logs', authenticateToken, isAdmin, adminController.getAuditLogs);

// Notifications
router.post('/notifications/send', authenticateToken, isAdmin, adminController.sendNotification);

// Reports
router.get('/reports/transactions', authenticateToken, isAdmin, adminController.getTransactionReports);
router.get('/reports/transactions/export', authenticateToken, isAdmin, adminController.exportTransactionReport);
router.get('/reports/activity', authenticateToken, isAdmin, adminController.getUserActivity);
router.get('/reports/revenue', authenticateToken, isAdmin, adminController.getRevenueReports);

// Banners
router.get('/banners', authenticateToken, isAdmin, adminController.getBanners);
router.post('/banners', authenticateToken, isAdmin, adminController.createBanner);
router.delete('/banners/:id', authenticateToken, isAdmin, adminController.deleteBanner);

// Announcements
router.get('/announcements', authenticateToken, isAdmin, adminController.getAnnouncements);
router.post('/announcements', authenticateToken, isAdmin, adminController.createAnnouncement);
router.delete('/announcements/:id', authenticateToken, isAdmin, adminController.deleteAnnouncement);

// Generated Docs
router.get('/documents/generated', authenticateToken, isAdmin, adminController.getGeneratedDocs);

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, isAdmin, adminController.getDashboardStats);

module.exports = router;
