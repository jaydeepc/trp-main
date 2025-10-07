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
      const rfqUpdate = await RFQNew.findOne({ rfqId });
      if (rfqUpdate) {
        if (!rfqUpdate.bomIds.includes(bom._id)) {
          rfqUpdate.bomIds.push(bom._id);
        }

        // Update workflow step to 3 after successful beta BOM creation
        if (type === 'beta' && !rfqUpdate.workflow.completedSteps.includes(2)) {
          rfqUpdate.workflow.completedSteps.push(2);
          rfqUpdate.workflow.currentStep = Math.max(rfqUpdate.workflow.currentStep, 3);
          console.log(`📊 Workflow updated: Step 2 completed, moving to step 3`);
        }

        await rfqUpdate.save();
        await rfqUpdate.updateBOMSummary?.();
      }

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
    console.log(`🚀 Starting rate-limited parallel processing of ${components.length} components`);

    // Process components in batches with delays to respect rate limits
    const batchSize = 3; // Process 3 components at a time
    const delayBetweenBatches = 2000; // 2 second delay between batches
    
    const results = [];
    
    for (let i = 0; i < components.length; i += batchSize) {
      const batch = components.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(components.length/batchSize)} (${batch.length} components)`);
      
      // Process current batch in parallel
      const batchPromises = batch.map(async (component, batchIndex) => {
        const globalIndex = i + batchIndex;
        return this.processComponentWithRetries(component, globalIndex, components.length, requirements);
      });

      // Wait for current batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i + batchSize < components.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    // Process results and handle errors
    const errors = [];
    const successfulComponents = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const componentResult = result.value;
        if (componentResult.success) {
          successfulComponents.push(componentResult);
        } else {
          errors.push(`Component "${componentResult.componentName}": ${componentResult.error}`);
        }
      } else {
        errors.push(`Component ${index + 1}: ${result.reason?.message || 'Unknown error'}`);
      }
    });

    // Sort successful components by their original index to maintain order
    successfulComponents.sort((a, b) => a.originalIndex - b.originalIndex);

    // Add successful components to processedComponents array
    successfulComponents.forEach(result => {
      processedComponents.push(result.component);
    });

    console.log(`🎯 Parallel processing completed: ${successfulComponents.length}/${components.length} components processed successfully`);

    // If there are errors but some components succeeded, log warnings
    if (errors.length > 0 && successfulComponents.length > 0) {
      console.warn(`⚠️ Some components failed to process:`, errors);
      console.warn(`📊 Continuing with ${successfulComponents.length} successfully processed components`);
    }

    // If all components failed, throw an error
    if (errors.length > 0 && successfulComponents.length === 0) {
      throw new Error(`All components failed to process: ${errors.join('; ')}`);
    }

    // If some components failed, we could optionally throw or continue
    // For now, we'll continue with successful ones and log the errors
  }

  async processComponentWithRetries(component, index, totalComponents, requirements, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Processing component ${index + 1}/${totalComponents}: ${component.name} (Attempt ${attempt}/${maxRetries})`);

        // Step 1: Find alternatives for the component
        const alternativesData = await this.findComponentAlternatives(component, requirements);
        
        // Step 2: Prepare all components for supplier research (main component + alternatives)
        const componentsForSupplierResearch = [
          component, // Main component
          ...(alternativesData.alternatives || []) // Alternative components
        ];

        console.log(`🔍 Finding suppliers for ${componentsForSupplierResearch.length} components (1 main + ${alternativesData.alternatives?.length || 0} alternatives)`);

        // Step 3: Find suppliers for all components with rate limiting
        const supplierResults = [];
        const delayBetweenSupplierCalls = 1000; // 1 second delay between supplier calls
        
        for (let compIndex = 0; compIndex < componentsForSupplierResearch.length; compIndex++) {
          const comp = componentsForSupplierResearch[compIndex];
          const isMainComponent = compIndex === 0;
          
          try {
            console.log(`🏭 Finding suppliers for ${isMainComponent ? 'main' : 'alternative'} component: ${comp.name}`);
            
            const supplierData = await this.findComponentSuppliers(comp, requirements);
            supplierResults.push({
              status: 'fulfilled',
              value: {
                success: true,
                isMainComponent,
                componentIndex: compIndex,
                component: comp,
                supplierData
              }
            });
          } catch (error) {
            console.error(`❌ Failed to find suppliers for component ${comp.name}:`, error.message);
            supplierResults.push({
              status: 'fulfilled',
              value: {
                success: false,
                isMainComponent,
                componentIndex: compIndex,
                component: comp,
                error: error.message
              }
            });
          }
          
          // Add delay between supplier calls (except for the last one)
          if (compIndex < componentsForSupplierResearch.length - 1) {
            console.log(`⏳ Waiting ${delayBetweenSupplierCalls}ms before next supplier call...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenSupplierCalls));
          }
        }

        // Process supplier results
        let mainComponentSuppliers = [];
        const alternativeComponentsWithSuppliers = [];

        supplierResults.forEach((result, resultIndex) => {
          if (result.status === 'fulfilled' && result.value.success) {
            const { isMainComponent, supplierData, component: comp } = result.value;
            
            // Transform supplier data to BOM format
            const transformedSuppliers = supplierData.alternativeSuppliers?.map(supplier => ({
              id: `${comp.name}-supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: supplier.supplierName,
              country: supplier.country,
              classification: supplier.classification,
              classificationDescription: supplier.classificationDescription,
              supplierURL: supplier.supplierURL,
              productPageURL: supplier.productPageURL,
              landedCostINR: supplier.landedCostINR,
              keyAdvantages: supplier.keyAdvantages,
              reliability: supplier.reliability,
              leadTime: supplier.leadTime,
              baselineAnalysis: isMainComponent ? supplierData.baselineAnalysis : undefined
            })) || [];

            if (isMainComponent) {
              mainComponentSuppliers = transformedSuppliers;
            } else {
              // This is an alternative component, add suppliers to it
              const altIndex = resultIndex - 1; // Subtract 1 because main component is at index 0
              if (alternativesData.alternatives && alternativesData.alternatives[altIndex]) {
                alternativeComponentsWithSuppliers[altIndex] = {
                  ...alternativesData.alternatives[altIndex],
                  suppliers: transformedSuppliers
                };
              }
            }
          } else {
            const componentName = result.status === 'fulfilled' ? result.value.component.name : 'Unknown';
            console.warn(`⚠️ Failed to get suppliers for component: ${componentName}`);
          }
        });

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

          // Add suppliers for main component
          suppliers: mainComponentSuppliers,

          // Transform alternatives with their suppliers
          alternatives: alternativesData.alternatives?.map((alt, altIndex) => {
            const altWithSuppliers = alternativeComponentsWithSuppliers[altIndex];
            return {
              id: alt.partNumber || `${component.name}-alt-${Date.now()}-${altIndex}`,
              partNumber: alt.partNumber || '',
              name: alt.name,
              description: alt.description,
              specifications: alt.specifications,
              costRange: alt.costRange,
              recommendationReason: alt.keyAdvantages?.join('; ') || 'Alternative component',
              suppliers: altWithSuppliers?.suppliers || []
            };
          }) || []
        };

        const totalSuppliers = mainComponentSuppliers.length + 
          (bomComponent.alternatives?.reduce((sum, alt) => sum + (alt.suppliers?.length || 0), 0) || 0);

        console.log(`✅ Completed component ${index + 1}/${totalComponents}: ${component.name} with ${totalSuppliers} total suppliers`);
        return { success: true, component: bomComponent, originalIndex: index };

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for component ${component.name}:`, error.message);

        if (attempt === maxRetries) {
          console.error(`🚨 All ${maxRetries} attempts failed for component ${component.name}`);
          return {
            success: false,
            error: error.message,
            componentName: component.name,
            originalIndex: index
          };
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry for component ${component.name}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async findComponentAlternatives(component, requirements, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Attempt ${attempt}/${maxRetries} for component: ${component.name}`);
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

  async findComponentSuppliers(component, requirements, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🏭 Attempt ${attempt}/${maxRetries} for supplier research: ${component.name}`);
        const result = await perplexityService.findComponentSuppliers(component, requirements);
        return result;
      } catch (error) {
        console.error(`❌ Supplier research attempt ${attempt} failed for ${component.name}:`, error.message);

        if (attempt === maxRetries) {
          console.error(`🚨 All ${maxRetries} supplier research attempts failed for ${component.name}`);
          throw error;
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before supplier research retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = new BOMAnalysisController();
