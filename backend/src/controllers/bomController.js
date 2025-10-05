const BOM = require('../models/BOM');
const RFQNew = require('../models/RFQNew');

const bomController = {
  async createBOM(req, res) {
    try {
      const { rfqId, components, version = 'alpha' } = req.body;

      // Verify RFQ exists
      const rfq = await RFQNew.findOne({ rfqId });
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      const bomData = {
        rfqId,
        components: components || [],
        version,
        status: 'draft'
      };

      const bom = new BOM(bomData);
      await bom.save();

      // Update RFQ with BOM reference
      await RFQNew.findOneAndUpdate(
        { rfqId },
        { $push: { bomIds: bom._id } }
      );

      res.status(201).json({
        success: true,
        data: bom
      });

    } catch (error) {
      console.error('Error creating BOM:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getBOMsByRFQ(req, res) {
    try {
      const { rfqId } = req.params;

      const boms = await BOM.find({ rfqId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: boms
      });

    } catch (error) {
      console.error('Error fetching BOMs:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getBOMById(req, res) {
    try {
      const { bomId } = req.params;

      const bom = await BOM.findById(bomId);

      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }

      res.json({
