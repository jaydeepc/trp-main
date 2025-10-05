const express = require('express');
const router = express.Router();

const rfqRoutes = require('./rfqRoutes');
const documentRoutes = require('./documentRoutes');
const supplierResearchRoutes = require('./supplierResearchRoutes');

router.use('/rfqs', rfqRoutes);
router.use('/documents', documentRoutes);
router.use('/supplier-research', supplierResearchRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
