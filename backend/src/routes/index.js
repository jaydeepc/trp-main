const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const rfqRoutes = require('./rfqRoutes');
const documentRoutes = require('./documentRoutes');
const bomAnalysisRoutes = require('./bomAnalysisRoutes');
const userRoutes = require('./userRoutes');

// Apply auth middleware to protected routes
router.use('/rfqs', authMiddleware, rfqRoutes);
router.use('/documents', authMiddleware, documentRoutes);
router.use('/bom-analysis', authMiddleware, bomAnalysisRoutes);
router.use('/users', userRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
