const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    documentTypes: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        enum: ['BOM', 'Design', 'Specification', 'Quotation', 'Other']
      },
      description: 'Array of document types found in the uploaded files'
    },
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          partNumber: { type: Type.STRING, nullable: true },
          name: { type: Type.STRING },
          description: { type: Type.STRING, nullable: true },
          quantity: { type: Type.NUMBER },
          specifications: { type: Type.STRING, nullable: true },
          zbc: {
            type: Type.OBJECT,
            properties: {
              shouldCost: { type: Type.NUMBER, nullable: true }
            }
          }
        },
        required: ['name', 'quantity']
      }
    }
  },
  required: ['documentTypes', 'components']
};

const extractDocumentData = async (fileBuffers, fileNames, mimeTypes) => {
  try {
    const fileCount = fileBuffers.length;
    console.log(`🔍 Extracting data from ${fileCount} document(s)`);

    const systemInstruction = `You are a procurement data extraction expert. Analyze documents and extract structured procurement information with high accuracy.`;

    const contentParts = [
      `Analyze ${fileCount === 1 ? 'this document' : 'these documents'} and intelligently extract procurement-relevant information.

The document(s) could be:
- Bill of Materials (BOM)
- Design specifications
- Technical drawings
- Vendor quotations
- Material lists
- Any other procurement document

${fileCount > 1 ? 'If multiple documents are provided, combine and consolidate the information from all documents into a single comprehensive extraction.' : ''}

IMPORTANT EXTRACTION RULES:
- Be flexible with field names (Part #, Item, Component, SKU all mean partNumber)
- If it's a design document, extract component requirements
- If it's a quotation, extract pricing and specifications
- If fields are missing or unclear, use null for unavailable fields
- Make intelligent inferences where appropriate
- Handle handwritten notes, sketches, and informal formats
- For duplicate components across files, consolidate them
- Provide a confidence score (0-100) based on document quality and data completeness
- In extractionNotes, mention any challenges, assumptions, or important observations

Extract all available information and structure it according to the defined schema.`
    ];

    for (let i = 0; i < fileBuffers.length; i++) {
      contentParts.push({
        inlineData: {
          data: fileBuffers[i].toString('base64'),
          mimeType: mimeTypes[i]
        }
      });
      console.log(`📎 File ${i + 1}: ${fileNames[i]} (${mimeTypes[i]})`);
    }

    const model = process.env.GEMINI_DOCUMENT_UNDERSTANDING_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents: contentParts,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema
      }
    });

    const extractedData = JSON.parse(response.text);

    // Initialize metadata if it doesn't exist
    if (!extractedData.metadata) {
      extractedData.metadata = {};
    }

    extractedData.metadata.fileNames = fileNames;
    extractedData.metadata.fileCount = fileCount;
    extractedData.metadata.processingTime = new Date().toISOString();

    const componentsFound = extractedData.components?.length || 0;
    console.log(`✅ Extraction complete: ${componentsFound} components found`);
    console.log(`📊 Document types: ${extractedData.documentTypes?.join(', ')}`);
    console.log(`🎯 Confidence: ${extractedData.metadata.confidence}%`);

    if (extractedData.metadata.extractionNotes) {
      console.log(`📝 Notes: ${extractedData.metadata.extractionNotes}`);
    }

    return {
      success: true,
      extraction: extractedData,
      componentsFound,
      modelMetadata: {
        provider: 'GOOGLE',
        model,
        tokenUsage: {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          thoughtTokens: response.usageMetadata.thoughtsTokenCount
        }
      }
    };

  } catch (error) {
    console.error('❌ Document extraction error:', error);
    throw new Error(`Document extraction failed: ${error.message}`);
  }
};

module.exports = {
  extractDocumentData
};
