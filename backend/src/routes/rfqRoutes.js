const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');

// RFQ CRUD routes
router.post('/', rfqController.createRFQ);
router.get('/', rfqController.getRFQs);
router.get('/:id', rfqController.getRFQ);
router.put('/:id', rfqController.updateRFQ);

// Workflow step routes
router.put('/:id/requirements', rfqController.updateRequirements);
router.put('/:id/step/:step', rfqController.completeStep);

module.exports = router;
