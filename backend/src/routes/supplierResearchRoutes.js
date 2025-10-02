const express = require('express');
const router = express.Router();
const RFQ = require('../models/RFQ');
const SupplierResearch = require('../models/SupplierResearch');

// Middleware for user authentication (simplified for MVP)
const authenticateUser = (req, res, next) => {
  // For MVP, use a default user ID
  // In production, this would validate JWT tokens
  req.userId = req.headers['x-user-id'] || 'demo-user-001';
  next();
};

// POST /api/supplier-research/:rfqId - Generate supplier research using Gemini
router.post('/:rfqId', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.rfqId,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    // Check if RFQ has extracted components data
    if (!rfq.extractedDocumentData || !rfq.extractedDocumentData.components) {
      return res.status(400).json({
        error: 'No components data found',
        message: 'Please upload and analyze documents first'
      });
    }

    const components = rfq.extractedDocumentData.components;
    
    // Create the supplier research prompt with appended data
    const supplierResearchPrompt = `System Directive:
This is a high-priority task for the Robbie Agent System. The mission is to perform intensive supplier research based on a user-provided Bill of Materials (BOM).

Primary Activated Persona:
Robbie Supplier Research (RSR) Agent. You are responsible for executing all research, analysis, and data compilation stages of this task. The final output from you will serve as critical intelligence for other agents in the system, such as the Robbie Suppliers Onboarding (RSO) Agent, who may use this data to identify and contact potential new manufacturers.

Mission Goal:
Transform a standard BOM into an actionable "Smart BOM" by identifying, vetting, and classifying global alternative suppliers for each component according to the specific criteria outlined below.

⸻

INPUTS FOR THE MISSION
	•	Bill of Materials (BOM): I will upload the BOM file.
	•	Baseline Reference Websites: For establishing baseline price and specifications, use reliable websites in the order listed (e.g., Robu.in, Electronicscomp.com, etc.). If a 'Source' URL is provided in the BOM, that is the primary reference for that item.

⸻

STAGE 1: BASELINE ANALYSIS (RSR Agent Task)

For each item in the BOM:
	1.	Identify & Document: Use the Baseline Reference Websites to locate each component.
	2.	Establish Baseline: Record:
	•	primaryCategory
	•	manufacturer
	•	keySpecifications
	•	baselinePriceINR
	•	sourceURL (must be a real, verifiable working URL)
	•	productPageURL (must be a real, verifiable working URL)

Important: If no real URL exists, set sourceURL and productPageURL to null. Do not fabricate URLs.

⸻

STAGE 2: GLOBAL DEEP SEARCH (RSR Agent Task)

For each benchmarked component:
	1.	Initiate Deep Search: Perform a relentless search for alternative OEMs and reputable suppliers.
	2.	Geographic Scope: Include India, China, South Korea, Taiwan, Hong Kong, UK, Vietnam, Japan, Germany, Italy. Prioritize India-based OEMs.
	3.	Specialized Focus for Drones: Intensify search for specialized components (airspeed sensors, PDB/UBEC variants, landing gear sets, gimbals, HD FPV systems, barometers, telemetry radios, antennas, fasteners, etc.).
	4.	Supplier Requirements: All supplier URLs (supplierURL and productPageURL) must be real, verified links. If not available, use null.

⸻

STAGE 3: CLASSIFICATION & FINANCIAL ANALYSIS (RSR Agent Task)

For each alternative supplier:
	1.	Evaluate: Compare the alternative directly to the Stage 1 baseline component.
	2.	Classify: Assign to exactly one of the 10 categories: 
Number	Classification
1	Better Quality but similar price
2	Better Quality but lower price
3	Better Quality but higher price
4	Better Quality, higher price and higher reliability
5	Better Quality, lower price and more established company
6	Better Quality, higher price and a more established company
7	Better Quality, lower price and better support
8	Better Quality, higher price and better support
9	Better Quality, lower price and better returns and warranty support
10	Better Quality, higher price and better returns and warranty support
 3.	Calculate Landed Cost:
	•	Use the local currency price and a realistic exchange rate.
	•	Include estimated shipping and customs duties.
	•	Record landedCostINR with fields:
	•	localCurrencyPrice
	•	exchangeRateUsed
	•	estimatedShippingINR
	•	estimatedCustomsINR
	•	totalLandedCostINR

⸻

OUTPUT SPECIFICATIONS
	1.	Return a JSON array containing ALL components from the input BOM. Each component must contain:
	•	partName
	•	description
	•	quantity
	•	unitCostINR
	•	totalCostINR
	•	baselineAnalysis (with all fields above)
	•	alternativeSuppliers (array with each supplier containing):
		- supplierName (company name)
		- supplierURL (real verified URL)
		- productPageURL (real verified URL)
		- manufacturer (actual manufacturer name)
		- keySpecifications (detailed technical specs)
		- classification (1-10 category number)
		- landedCostINR (with all cost breakdown fields)
		- alternativeBetterInWhichWays (detailed explanation of how this alternative is better based on the classification)

	2.	CRITICAL: You MUST process and return ALL components from the input data. Do not skip any components.
	3.	Ensure the JSON is well-formatted, human-readable, and fully verifiable.
	4.	If no real supplier URL is found, set the URL field to null.
	5.	Do not add explanations, commentary, or fabricated data.
	6.	MANDATORY: For each alternative supplier, you MUST include:
		- supplierName: The actual company/supplier name
		- manufacturer: The component manufacturer name
		- keySpecifications: Detailed technical specifications
		- alternativeBetterInWhichWays: Clear explanation of advantages over baseline
	7.	The output array length MUST equal the input components array length.

Data:-
{
  "extractedDocumentData": {
    "components": ${JSON.stringify(components, null, 2)}
  }
}`;

    console.log('🔍 Starting supplier research for RFQ:', rfq.rfqNumber);
    console.log('📊 Components to research:', components.length);

    // Import geminiService here to avoid circular dependencies
    const geminiService = require('../services/geminiService');
    
    const startTime = Date.now();
    
    // Call Gemini API with the supplier research prompt using BOM model (gemini-2.5-flash) with Google Search enabled
    const supplierResearchResponse = await geminiService.generateSupplierResearch(supplierResearchPrompt, 'bom-extraction');
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Supplier research completed in', processingTime, 'ms');
    console.log('📄 Response preview:', supplierResearchResponse.substring(0, 200) + '...');

    // Try to parse the response as JSON
    let parsedResponse;
    try {
      // Clean the response - remove any markdown formatting
      const cleanResponse = supplierResearchResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedResponse = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.log('Raw response:', supplierResearchResponse);
      
      return res.status(500).json({
        error: 'Failed to parse supplier research response',
        message: 'The AI response was not in valid JSON format',
        rawResponse: supplierResearchResponse.substring(0, 500)
      });
    }

    // Save to SupplierResearch collection with same userId as RFQ
    try {
      const supplierResearchDoc = new SupplierResearch({
        rfqId: rfq._id,
        rfqNumber: rfq.rfqNumber,
        userId: rfq.userId, // Use the same userId as the RFQ
        status: 'completed',
        supplierResearch: parsedResponse,
        processingTime,
        totalComponents: components.length,
        searchQueriesUsed: [], // We could enhance this to capture actual queries
        sourcesFound: 0, // We could enhance this from response metadata
        originalComponents: components.map(comp => ({
          partNumber: comp.partNumber,
          description: comp.description,
          quantity: comp.quantity,
          specifications: comp.specifications
        }))
      });

      await supplierResearchDoc.save();
      console.log('✅ Supplier research saved to database with ID:', supplierResearchDoc._id);

      // Return the response with database ID
      res.json({
        success: true,
        message: 'Supplier research completed and saved successfully',
        data: {
          id: supplierResearchDoc._id,
          rfqId: rfq._id,
          rfqNumber: rfq.rfqNumber,
          userId: rfq.userId,
          processingTime,
          totalComponents: components.length,
          supplierResearch: parsedResponse,
          summary: supplierResearchDoc.summary,
          metadata: {
            processedAt: new Date(),
            responseType: Array.isArray(parsedResponse) ? 'array' : 'object',
            itemCount: Array.isArray(parsedResponse) ? parsedResponse.length : 1,
            savedToDatabase: true
          }
        }
      });

    } catch (dbError) {
      console.error('❌ Failed to save to database:', dbError);
      
      // Still return the response even if DB save fails
      res.json({
        success: true,
        message: 'Supplier research completed successfully (database save failed)',
        data: {
          rfqId: rfq._id,
          rfqNumber: rfq.rfqNumber,
          userId: rfq.userId,
          processingTime,
          totalComponents: components.length,
          supplierResearch: parsedResponse,
          metadata: {
            processedAt: new Date(),
            responseType: Array.isArray(parsedResponse) ? 'array' : 'object',
            itemCount: Array.isArray(parsedResponse) ? parsedResponse.length : 1,
            savedToDatabase: false,
            dbError: dbError.message
          }
        }
      });
    }

  } catch (error) {
    console.error('Error generating supplier research:', error);
    res.status(500).json({
      error: 'Failed to generate supplier research',
      message: error.message
    });
  }
});

// GET /api/supplier-research/:rfqId - Get stored supplier research for an RFQ
router.get('/:rfqId', authenticateUser, async (req, res) => {
  try {
    const supplierResearch = await SupplierResearch.findByRFQ(req.params.rfqId);
    
    if (!supplierResearch) {
      return res.status(404).json({
        error: 'Supplier research not found',
        message: 'No supplier research data found for this RFQ'
      });
    }

    // Check if user has access to this supplier research
    if (supplierResearch.userId !== req.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this supplier research'
      });
    }

    res.json({
      success: true,
      data: supplierResearch
    });

  } catch (error) {
    console.error('Error fetching supplier research:', error);
    res.status(500).json({
      error: 'Failed to fetch supplier research',
      message: error.message
    });
  }
});

// GET /api/supplier-research - Get supplier research history for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const supplierResearches = await SupplierResearch.findByUser(req.userId, parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await SupplierResearch.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      data: {
        items: supplierResearches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching supplier research history:', error);
    res.status(500).json({
      error: 'Failed to fetch supplier research history',
      message: error.message
    });
  }
});

// DELETE /api/supplier-research/:id - Delete supplier research
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const supplierResearch = await SupplierResearch.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!supplierResearch) {
      return res.status(404).json({
        error: 'Supplier research not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier research deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting supplier research:', error);
    res.status(500).json({
      error: 'Failed to delete supplier research',
      message: error.message
    });
  }
});

module.exports = router;
