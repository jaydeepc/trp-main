const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');

// Middleware for user authentication
const authenticateUser = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || 'system';
  next();
};

// RFQ CRUD routes
router.post('/', authenticateUser, rfqController.createRFQ);
router.get('/', authenticateUser, rfqController.getRFQs);
router.get('/:id', authenticateUser, rfqController.getRFQ);
router.put('/:id', authenticateUser, rfqController.updateRFQ);

// Workflow step routes
router.put('/:id/requirements', authenticateUser, rfqController.updateRequirements);
router.put('/:id/step/:step', authenticateUser, rfqController.completeStep);

module.exports = router;
