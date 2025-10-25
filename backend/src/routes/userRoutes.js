const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public route - sync user from Firebase (no auth required for initial sync)
router.post('/sync', userController.syncUser);

// Protected routes - require authentication
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);
router.get('/me/stats', userController.getUserStats);

module.exports = router;
