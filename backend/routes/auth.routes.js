const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/reset-admin-emergency', authController.resetAdminPasswordEmergency);
router.post('/register', authController.register);
router.post('/register-simple', authController.registerSimple);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

// Protected routes
router.post('/update-password', authenticateToken, authController.updatePassword);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
