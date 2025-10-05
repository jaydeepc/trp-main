const RFQNew = require('../models/RFQNew');
const { v4: uuidv4 } = require('uuid');

class RFQController {
  // Create new RFQ
  async createRFQ(req, res) {
    try {
      const userId = req.userId;
      const { title, description, priority = 'medium' } = req.body || {};

      // Generate rfqId
      const rfqId = `RFQ-${uuidv4()}`;

      const rfq = new RFQNew({
        rfqId,
        createdBy: userId,
        status: 'draft',
        workflow: {
          currentStep: 1,
          completedSteps: [],
          stepData: {}
        }
      });

      await rfq.save();

      res.status(201).json({
        success: true,
        message: 'RFQ created successfully',
        data: rfq.toObject()
      });

    } catch (error) {
      console.error('Error creating RFQ:', error);
      res.status(500).json({
        error: 'Failed to create RFQ',
        message: error.message
      });
    }
  }

  // Get RFQs for user with filtering and pagination
  async getRFQs(req, res) {
    try {
      const userId = req.userId;
      const {
        status,
        priority,
        limit = 20,
        page = 1,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { createdBy: userId };
      if (status) query.status = status;
      if (priority) query.priority = priority;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rfqs, total] = await Promise.all([
        RFQNew.find(query)
          .sort(sort)
          .limit(parseInt(limit))
          .skip(skip)
          .populate('documents', 'fileName fileType uploadedAt processingStatus')
          .populate('bomId', 'version status totalComponents estimatedValue'),
        RFQNew.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          items: rfqs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching RFQs:', error);
      res.status(500).json({
        error: 'Failed to fetch RFQs',
        message: error.message
      });
    }
  }

  // Get specific RFQ
  async getRFQ(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params; // This is now the UUID rfqId from frontend

      console.log('🔍 RFQController.getRFQ - Looking up RFQ:', { rfqId: id, userId });

      const rfq = await RFQNew.findOne({ rfqId: id, createdBy: userId }) // Use rfqId and createdBy for consistency
        .populate('documents')
        .populate('bomId');

      if (!rfq) {
        console.log('❌ RFQ not found for rfqId:', id);
        return res.status(404).json({
          error: 'RFQ not found',
          message: 'The requested RFQ does not exist or you do not have access to it'
        });
      }

      console.log('✅ Found RFQ:', {
        rfqId: rfq.rfqId,
        rfqNumber: rfq.rfqNumber,
        hasAnalysisData: !!rfq.analysisData
      });

      res.json({
        success: true,
        data: rfq
      });

    } catch (error) {
      console.error('Error fetching RFQ:', error);
      res.status(500).json({
        error: 'Failed to fetch RFQ',
        message: error.message
      });
    }
  }

  // Update RFQ basic information
  async updateRFQ(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params; // This is now the UUID rfqId from frontend
      const updates = req.body;

      console.log('🔧 RFQController.updateRFQ - Updating RFQ:', { rfqId: id, userId });

      // Remove fields that shouldn't be directly updated
      delete updates.userId;
      delete updates._id;
      delete updates.rfqId; // Prevent rfqId from being changed
      delete updates.createdAt;

      const rfq = await RFQNew.findOneAndUpdate(
        { rfqId: id, createdBy: userId }, // Use rfqId and createdBy for consistency
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!rfq) {
        console.log('❌ RFQ not found for rfqId:', id);
        return res.status(404).json({
          error: 'RFQ not found',
          message: 'The requested RFQ does not exist or you do not have access to it'
        });
      }

      console.log('✅ RFQ updated successfully:', rfq.rfqId);

      res.json({
        success: true,
        message: 'RFQ updated successfully',
        data: rfq
      });

    } catch (error) {
      console.error('Error updating RFQ:', error);
      res.status(500).json({
        error: 'Failed to update RFQ',
        message: error.message
      });
    }
  }

  // Update requirements (Step 1)
  async updateRequirements(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params; // This is now the UUID rfqId from frontend
      const { requirements } = req.body;

      console.log('📝 RFQController.updateRequirements:', {
        rfqId: id,
        userId,
        requirements: Object.keys(requirements)
      });

      const rfq = await RFQNew.findOne({ rfqId: id, createdBy: userId }); // Use rfqId and createdBy for consistency

      if (!rfq) {
        console.log('❌ RFQ not found for rfqId:', id);
        return res.status(404).json({
          error: 'RFQ not found'
        });
      }

      // Update requirements
      rfq.requirements = { ...rfq.requirements, ...requirements };

      // Update workflow step data
      rfq.workflow.stepData.step1 = {
        requirementsDefined: true,
        completedAt: new Date(),
        ...requirements
      };

      // Mark step as completed and move to next step
      if (!rfq.workflow.completedSteps.includes(1)) {
        rfq.workflow.completedSteps.push(1);
        rfq.workflow.currentStep = Math.max(rfq.workflow.currentStep, 2);
        rfq.status = 'in-progress';
      }

      await rfq.save();

      console.log('✅ Requirements updated successfully for RFQ:', rfq.rfqId);

      res.json({
        success: true,
        message: 'Requirements updated successfully',
        data: rfq
      });

    } catch (error) {
      console.error('Error updating requirements:', error);
      res.status(500).json({
        error: 'Failed to update requirements',
        message: error.message
      });
    }
  }

  // Complete step (generic step completion)
  async completeStep(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { step, stepData } = req.body;

      const rfq = await RFQNew.findOne({ rfqId: id, createdBy: userId }); // Use rfqId and createdBy for consistency

      if (!rfq) {
        return res.status(404).json({
          error: 'RFQ not found'
        });
      }

      // Update step data
      rfq.workflow.stepData[`step${step}`] = {
        ...rfq.workflow.stepData[`step${step}`],
        ...stepData,
        completedAt: new Date()
      };

      // Mark step as completed
      if (!rfq.workflow.completedSteps.includes(step)) {
        rfq.workflow.completedSteps.push(step);
        rfq.workflow.currentStep = Math.max(rfq.workflow.currentStep, step + 1);
      }

      // Update status based on step completion
      if (step >= 4) {
        rfq.status = 'completed';
      } else if (step >= 2) {
        rfq.status = 'in-progress';
      }

      await rfq.save();

      res.json({
        success: true,
        message: `Step ${step} completed successfully`,
        data: rfq
      });

    } catch (error) {
      console.error('Error completing step:', error);
      res.status(500).json({
        error: 'Failed to complete step',
        message: error.message
      });
    }
  }
}

module.exports = new RFQController();
