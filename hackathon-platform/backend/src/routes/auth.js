const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Step 1: Register and trigger verification email
router.post('/register', authController.register);

// Step 2: Verify 6-digit email OTP
router.post('/verify-otp', authController.verifyOtp);

// Resend verification code email
router.post('/send-verification-email', authController.resendVerificationEmail);
router.post('/resend-otp', authController.resendVerificationEmail);

// Login (returns token or prompts 2FA challenge)
router.post('/login', authController.login);

// Verify 2FA code during login
router.post('/verify-2fa', authController.verifyLogin2Fa);
router.post('/send-2fa-email', authController.resendVerificationEmail);

// Profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
