const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Public route - sync user from Firebase (no auth required for initial sync)
router.post('/sync', userController.syncUser);

// Protected routes - require authentication
router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, userController.updateCurrentUser);
router.get('/me/stats', authMiddleware, userController.getUserStats);

module.exports = router;
