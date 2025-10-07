const BOM = require('../models/BOM');
const RFQNew = require('../models/RFQNew');
const perplexityService = require('../services/perplexityService');

class BOMAnalysisController {
  async createBomAnalysis(req, res) {
    try {
      const { rfqId } = req.params;
      const { type = 'beta' } = req.body;

      console.log(`🔍 Starting ${type} BOM analysis for rfqId: ${rfqId}`);

      // Validate type parameter
      if (!['alpha', 'beta', 'final'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type. Must be "alpha", "beta", or "final"'
        });
      }

      // Get RFQ with analysis data and requirements
      const rfq = await RFQNew.findOne({ rfqId }).lean();
      if (!rfq) {
        return res.status(404).json({
          success: false,
          error: 'RFQ not found'
        });
      }

      // Validate that analysis data exists
      if (!rfq.analysisData?.components || rfq.analysisData.components.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No components found in RFQ analysis data. Please upload and process documents first.'
        });
      }

      const components = rfq.analysisData.components;
      const requirements = rfq.requirements || {};

      console.log(`📊 Processing ${components.length} components for alternatives analysis`);

      // Process each component for alternatives (for beta type)
      const processedComponents = [];

      if (type === 'beta') {
        await this.createBetaBOM(components, requirements, processedComponents);
      } else {
        // To be done later for alpha and final types
        return res.status(501).json({
          success: false,
          error: `BOM type "${type}" not implemented yet.`
        });
      }

      // Create BOM with the specified type
      const bomData = {
        rfqId,
        type,
        components: processedComponents,
        metadata: {
          totalValue: 0, // Will be calculated by pre-save middleware
          currency: 'USD',
        },
        status: 'draft'
      };

      const bom = new BOM(bomData);
      await bom.save();

      // Update RFQ BOM summary
      await rfq.updateBOMSummary?.() || RFQNew.findOneAndUpdate(
        { rfqId },
        { $push: { bomIds: bom._id } }
      );

      const totalAlternatives = processedComponents.reduce((total, comp) => total + (comp.alternatives?.length || 0), 0);

      console.log(`✅ ${type} BOM analysis completed for ${rfqId}`);
      console.log(`📋 Created BOM with ${processedComponents.length} components and ${totalAlternatives} alternatives`);

      res.status(201).json({
        success: true,
        data: {
          bomId: bom._id.toString(),
          rfqId: bom.rfqId,
          type: bom.type,
          version: bom.version,
          componentCount: processedComponents.length,
          alternativesCount: totalAlternatives,
          status: bom.status,
          metadata: bom.metadata,
          components: processedComponents,
          createdAt: bom.createdAt
        },
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} BOM analysis completed with ${processedComponents.length} components and ${totalAlternatives} alternatives`
      });

    } catch (error) {
      console.error(`❌ BOM Analysis Error for ${req.params.rfqId}:`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create BOM analysis'
      });
    }
  }

  async createBetaBOM(components, requirements, processedComponents) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      console.log(`🔄 Processing component ${i + 1}/${components.length}: ${component.name}`);

      try {
        // Call Perplexity to find alternatives
        const alternativesData = await this.findComponentAlternatives(component, requirements);
        // TODO: find suppliers
        // TODO: find alternatives suppliers

        // Transform component data for BOM format
        const bomComponent = {
          partNumber: component.partNumber || '',
          name: component.name,
          description: component.description || '',
          specifications: component.specifications || '',
          quantity: component.quantity || 1,

          // Add ZBC data if available
          ...(component.zbc && {
            zbc: {
              shouldCost: component.zbc.shouldCost,
              variance: component.zbc.variance,
            }
          }),

          // Transform Perplexity alternatives to BOM alternatives format
          alternatives: alternativesData.alternatives?.map(alt => ({
            id: alt.partNumber || `${component.name}-alt-${Date.now()}`,
            partNumber: alt.partNumber || '',
            name: alt.name,
            description: alt.description,
            specifications: alt.specifications,
            costRange: alt.costRange,
            recommendationReason: alt.keyAdvantages?.join('; ') || 'Alternative component',
            suppliers: [] // Empty for now - will be populated later
          })) || [],

          suppliers: [] // Empty for now - will be populated later
        };

        processedComponents.push(bomComponent);

      } catch (error) {
        console.error(`❌ Error processing component ${component.name}:`, error.message);
        throw new Error(`Failed to process component ${component.name}: ${error.message}`);
      }
    }
  }

  async findComponentAlternatives(component, requirements, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for component: ${component.name}`);
        const result = await perplexityService.findComponentAlternatives(component, requirements);
        return result;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${component.name}:`, error.message);

        if (attempt === maxRetries) {
          console.error(`🚨 All ${maxRetries} attempts failed for ${component.name}`);
          throw error;
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = new BOMAnalysisController();
