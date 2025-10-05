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
        userId,
        title: title || `New RFQ ${Date.now()}`,
        description,
        priority,
        status: 'draft',
        currentStep: 1,
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

      const query = { userId };
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
      const { id } = req.params;

      const rfq = await RFQNew.findOne({ _id: id, userId })
        .populate('documents')
        .populate('bomId');

      if (!rfq) {
        return res.status(404).json({
          error: 'RFQ not found',
          message: 'The requested RFQ does not exist or you do not have access to it'
        });
      }

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
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be directly updated
      delete updates.userId;
      delete updates._id;
      delete updates.createdAt;

      const rfq = await RFQNew.findOneAndUpdate(
        { _id: id, userId },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!rfq) {
        return res.status(404).json({
          error: 'RFQ not found',
          message: 'The requested RFQ does not exist or you do not have access to it'
        });
      }

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
      const { id } = req.params;
      const { requirements } = req.body;

      const rfq = await RFQNew.findOne({ _id: id, userId });

      if (!rfq) {
        return res.status(404).json({
          error: 'RFQ not found'
        });
      }

      rfq.requirements = { ...rfq.requirements, ...requirements };
      rfq.workflow.stepData.step1 = {
        requirementsDefined: true,
        completedAt: new Date(),
        ...requirements
      };

      if (!rfq.workflow.completedSteps.includes(1)) {
        rfq.workflow.completedSteps.push(1);
        rfq.currentStep = Math.max(rfq.currentStep, 2);
        rfq.workflow.currentStep = rfq.currentStep;
      }

      await rfq.save();

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

      const rfq = await RFQNew.findOne({ _id: id, userId });

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
        rfq.currentStep = Math.max(rfq.currentStep, step + 1);
        rfq.workflow.currentStep = rfq.currentStep;
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
