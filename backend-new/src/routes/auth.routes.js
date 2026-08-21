const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimit');
const { auth } = require('../middleware/auth'); // Utilisé pour les routes protégées

const router = express.Router();

// Routes publiques
router.post('/login', authLimiter, authController.login);
router.post('/verify-2fa', authLimiter, authController.verify2fa);
router.post('/resend-2fa', authLimiter, authController.resend2fa);

// Routes protégées
router.get('/me', auth, authController.me);
router.post('/logout', auth, authController.logout);
router.post('/user/avatar', auth, authController.updateAvatar);
router.post('/fcm-token', auth, authController.updateFcmToken);

module.exports = router;