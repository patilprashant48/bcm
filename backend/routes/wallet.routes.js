const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// User routes
router.get('/', authenticateToken, walletController.getWallets);
router.get('/transactions', authenticateToken, walletController.getTransactions);
router.get('/:walletType/balance', authenticateToken, walletController.getWalletBalance);
router.get('/:walletType/history', authenticateToken, walletController.getLedgerHistory);
router.post('/topup', authenticateToken, walletController.requestTopup);
router.post('/topup-request', authenticateToken, walletController.requestTopup); // Alias for frontend compatibility
router.post('/withdraw', authenticateToken, walletController.requestWithdrawal);
router.get('/payment-requests', authenticateToken, walletController.getPaymentRequests);
router.get('/payment-details', walletController.getPlatformPaymentDetails);

// Admin routes
router.get('/admin/payment-requests', authenticateToken, isAdmin, walletController.getAllPaymentRequests);
router.post('/admin/payment-requests/:requestId/approve', authenticateToken, isAdmin, walletController.approvePayment);
router.post('/admin/payment-requests/:requestId/reject', authenticateToken, isAdmin, walletController.rejectPayment);
router.get('/admin/transactions', authenticateToken, isAdmin, walletController.getAllTransactions);
router.get('/admin/wallet', authenticateToken, isAdmin, walletController.getAdminWallet);
router.get('/admin/wallet/transactions', authenticateToken, isAdmin, walletController.getAdminTransactions);
router.post('/admin/wallet/topup', authenticateToken, isAdmin, walletController.topUpAdminWallet);

module.exports = router;
