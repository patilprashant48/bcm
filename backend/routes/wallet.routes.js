const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// User routes
router.get('/', authenticateToken, walletController.getWallets);
router.get('/:walletType/balance', authenticateToken, walletController.getWalletBalance);
router.get('/:walletType/history', authenticateToken, walletController.getLedgerHistory);
router.post('/topup', authenticateToken, walletController.requestTopup);
router.get('/payment-requests', authenticateToken, walletController.getPaymentRequests);
router.get('/payment-details', walletController.getPlatformPaymentDetails);

// Admin routes
router.get('/admin/payment-requests', authenticateToken, isAdmin, walletController.getAllPaymentRequests);
router.post('/admin/payment-requests/:requestId/approve', authenticateToken, isAdmin, walletController.approvePayment);
router.post('/admin/payment-requests/:requestId/reject', authenticateToken, isAdmin, walletController.rejectPayment);

module.exports = router;
