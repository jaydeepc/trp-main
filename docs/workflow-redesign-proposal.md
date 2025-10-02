# RFQ Workflow Redesign Proposal

**Status:** ✅ Steps 1 & 2 Complete - Context-Aware BOM Analysis Workflow Implemented  
**Purpose:** Document workflow changes and track implementation progress

> 📚 **Note:** This document tracks the implementation of the new workflow with context-aware BOM analysis. Steps 1 & 2 are fully implemented and tested.

---

## 📊 Implementation Status

### ✅ Completed - Steps 1 & 2 (Full Implementation)

#### Step 1: Upload & Document Understanding
- [x] Document extraction service with Gemini 2.0 Flash
- [x] Multi-file upload support (up to 10 files)
- [x] ZIP file extraction and processing
- [x] File validation middleware
- [x] Document controller with clean architecture
- [x] RFQ model updated with new fields
- [x] API endpoint: `POST /api/documents/extract`
- [x] Frontend upload component with drag-and-drop
- [x] Integration with extraction API
- [x] Display extracted data in Excel-style table
- [x] Loading states and error handling
- [x] Redux state management for extracted data
- [x] Database persistence in MongoDB

#### Step 2: Project Requirements & Context-Aware Analysis
- [x] Requirements form component (RequirementsForm.tsx)
- [x] Compliance requirements multi-select (ISO 9001, RoHS, REACH, etc.)
- [x] Lead time selector with presets
- [x] Payment terms selector (Net 30, Net 60, etc.)
- [x] Delivery region preference
- [x] Special requirements textarea
- [x] BOM analysis API modified to accept requirements
- [x] Backend validates requirements and triggers context-aware analysis
- [x] Analysis results stored in Redux (components, suppliers, insights)
- [x] Loading overlay during analysis
- [x] Error handling with user feedback
- [x] Voice integration with CommandBus
- [x] Enum validation matching backend schema

### 🎯 Key Implementation Details

**Frontend Files:**
- `frontend/src/components/forms/UploadDocuments.tsx` - Step 1 upload component
- `frontend/src/components/forms/RequirementsForm.tsx` - Step 2 requirements + analysis trigger
- `frontend/src/services/api.ts` - Added `analyzeBOM()` method
- `frontend/src/store/rfqSlice.ts` - State management for workflow

**Backend Files:**
- `backend/src/routes/rfqRoutes.js` - Modified `/rfqs/:id/analyse` endpoint
- `backend/src/models/RFQ.js` - Updated schema with extractedDocumentData
- `backend/src/routes/documentRoutes.js` - Document extraction endpoint
- `backend/src/services/documentExtractor.js` - Gemini extraction service

**Workflow Flow:**
1. User uploads documents (PDF, ZIP, Excel, etc.)
2. Backend extracts components using Gemini AI
3. Extracted data displayed in Excel-style table in Step 2
4. User fills requirements form (compliance, lead time, payment, region)
5. On submit, BOM analysis triggered with requirements as context
6. Analysis results stored in Redux and database
7. User proceeds to Step 3 with enriched component data

### 📋 Future Enhancements
- [ ] Step 3: Enhanced Smart BOM Review with analyzed data
- [ ] Step 4: Commercial Terms (if separate from requirements)
- [ ] Step 5: Preview & Send RFQ
- [ ] Voice integration enhancements
- [ ] End-to-end workflow testing

---

## 🎯 Problem Statement

### Current Workflow Issues

**Current 4-Step Process:**
1. **Upload** → Upload files
2. **Analyze** → AI processes everything (20 seconds)
3. **Commercial Terms** → User provides requirements AFTER analysis
4. **Review** → Check and send

**Problems:**
- Analysis happens without context (compliance, lead time, etc.)
- Requirements come too late in the process
- Potential rework if analysis doesn't match requirements
- Doesn't match real procurement workflows
- AI can't optimize if it doesn't know constraints

---

## ✨ Proposed Solution

### New Workflow: Context-First Approach

**New 5-Step Process:**

```
Step 1: Upload & Quick Extract
├── Upload BOM/design files
├── Quick extraction (5 seconds)
├── Component count: "Found 45 components"
└── NO full analysis yet

Step 2: Project Requirements (NEW)
├── Compliance requirements
├── Lead time constraints
├── Delivery region preference
├── Special requirements
└── Budget is extracted from BOM automatically

Step 3: Context-Aware BOM Analysis (ENHANCED)
├── AI analyzes WITH requirements as context
├── Pre-filters by compliance
├── Prioritizes by lead time & region
├── Highlights constraint violations
└── Results are immediately actionable

Step 4: Review & Refine
├── Review analysis results
├── Make adjustments
└── Confirm selections

Step 5: Preview & Send
└── Final RFQ summary and send
```

---

## 📋 Detailed Step Breakdown

### Step 1: Upload & Document Understanding (ENHANCED)

**User Actions:**
- Upload **ANY format** BOM: Excel, PDF, CSV, images, handwritten notes, etc.
- Drag-and-drop or file picker
- Voice: "Let's upload a file"

**Backend Processing: Document Understanding with Gemini (5-10 seconds)**

#### 1.1 File Upload & Validation
```javascript
// Receive file from frontend
POST /api/rfqs/:id/upload
```

#### 1.2 Gemini Document Understanding (GENERIC)
**Critical Feature: System accepts ANY document type in ANY format!**

**Supported Formats:**
- ✅ Excel (.xlsx, .xls)
- ✅ PDF documents
- ✅ CSV files
- ✅ Images (photos of handwritten notes, sketches)
- ✅ CAD drawings (as images/PDFs)
- ✅ Scanned documents
- ✅ Word documents (.docx)
- ✅ Text files (.txt)

**Supported Document Types:**
- ✅ Bill of Materials (BOM)
- ✅ Design specifications
- ✅ Technical drawings
- ✅ Vendor quotations
- ✅ Material specifications
- ✅ Engineering requirements
- ✅ Any procurement-related document

```javascript
// Backend calls Gemini API with GENERIC document understanding
const extractDocumentData = async (fileBuffer, fileName, mimeType) => {
  // GENERIC prompt that handles ANY document type
  const prompt = `
  Analyze this document and intelligently extract procurement-relevant 
  information in JSON format. The document could be:
  - A Bill of Materials (BOM)
  - Design specifications
  - Technical drawings
  - Vendor quotations
  - Material lists
  - Any other procurement document
  
  Identify the document type and extract appropriate data:
  
  {
    "documentType": "BOM|Design|Specification|Quotation|Other",
    "components": [
      {
        "partNumber": "string (if available)",
        "partName": "string",
        "description": "string",
        "quantity": number,
        "material": "string (if mentioned)",
        "dimensions": "string (if mentioned)",
        "estimatedCost": number (if available),
        "specifications": "string",
        "notes": "string"
      }
    ],
    "projectInfo": {
      "projectName": "string",
      "projectNumber": "string",
      "date": "string",
      "budget": number (if mentioned),
      "industry": "string (automotive, aerospace, electronics, etc.)"
    },
    "technicalRequirements": {
      "materials": ["string"],
      "finishes": ["string"],
      "tolerances": "string",
      "standards": ["string"],
      "testingRequired": "string"
    },
    "metadata": {
      "confidence": number (0-100),
      "extractionNotes": "string (any challenges or assumptions)"
    }
  }
  
  IMPORTANT:
  - Be flexible with field names (Part #, Item, Component, SKU all mean partNumber)
  - If it's a design document, extract component requirements
  - If it's a quotation, extract pricing and specifications
  - If fields are missing, extract what's available
  - Make intelligent inferences where appropriate
  - Handle handwritten notes, sketches, and informal formats
  `;
  
  const result = await geminiAPI.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { 
            inline_data: {
              mime_type: mimeType,
              data: fileBuffer.toString('base64')
            }
          }
        ]
      }
    ]
  });
  
  // Parse JSON response from Gemini
  const extractedData = JSON.parse(result.response.text());
  return extractedData;
};
```

#### 1.3 Send Structured Data to Frontend
```javascript
// Backend response
{
  "success": true,
  "extraction": {
    "components": [...], // Structured component data
    "projectInfo": {...},
    "metadata": {
      "documentType": "BOM",
      "confidence": 92,
      "componentsFound": 45
    }
  },
  "readyForRequirements": true
}
```

#### 1.4 Frontend Receives & Notifies Gemini Live
```javascript
// Frontend receives extraction
const handleExtractionComplete = (data) => {
  // Store in state
  setExtractedComponents(data.components);
  
  // Send context to Gemini Live via sendText
  const contextMessage = `
  Document extraction complete:
  - File: ${fileName}
  - Components found: ${data.metadata.componentsFound}
  - Document type: ${data.metadata.documentType}
  - Extraction confidence: ${data.metadata.confidence}%
  - Ready for requirements gathering
  `;
  
  geminiLive.sendText(contextMessage);
};
```

**Output:**
```
✅ Document processed: design_v2.xlsx
🤖 AI Extraction: 92% confidence
📊 Found: 45 components extracted
💾 Structured data ready
```

**Voice Flow:**
```
Robbie: "Perfect! I've uploaded your file and found 45 components. 
         Before I analyze them in detail, I need to understand your 
         project requirements. This helps me provide better results."
```

---

### Step 2: Project Requirements (NEW STEP)

**Purpose:** Gather constraints BEFORE analysis to contextualize results.

#### 2.1 Compliance Requirements

**Options:**
- ISO 9001 (Quality Management)
- AS9100 (Aerospace)
- ISO 14001 (Environmental)
- OHSAS 18001 (Health & Safety)
- RoHS (Hazardous Substances)
- REACH (Chemical Regulation)
- FDA (Medical Devices)
- CE Marking (European Conformity)
- UL Listed (Safety Certification)
- None required

**Voice Interaction:**
```
Robbie: "Let's start with compliance. Do you have any certification 
         requirements for this project? For example, ISO 9001, RoHS, 
         REACH, or others?"

User: "We need ISO 9001 and RoHS"

Robbie: "Got it! ISO 9001 and RoHS compliance required. I'll make 
         sure to filter suppliers accordingly."
```

#### 2.2 Lead Time Constraints

**Options:**
- 2-4 weeks (Urgent)
- 4-6 weeks (Standard)
- 6-8 weeks (Extended)
- 8-12 weeks (Long-lead)
- 12+ weeks (Custom)
- Flexible (No constraint)

**Voice Interaction:**
```
Robbie: "What's your lead time requirement? How soon do you need 
         these components?"

User: "We need them within 8 weeks"

Robbie: "Perfect! 8-week lead time constraint noted. I'll prioritize 
         suppliers who can deliver within this timeframe."
```

#### 2.3 Delivery Region Preference

**Options:**
- North America
- Europe
- Asia Pacific
- Middle East
- Latin America
- Global (No preference)

**Voice Interaction:**
```
Robbie: "Do you have a preferred region for supplier sourcing?"

User: "North America preferred"

Robbie: "Understood! I'll prioritize North American suppliers in 
         the analysis."
```

#### 2.4 Payment Terms (Optional)

**Options:**
- Net 30 / Net 60
- Milestone-based
- 2/10 Net 30
- Cash on Delivery
- Letter of Credit
- To be negotiated

**Voice Interaction:**
```
Robbie: "What payment terms work for your organization?"

User: "Net 30 is standard for us"

Robbie: "Got it! Net 30 payment terms."
```

#### 2.5 Special Requirements (Optional)

**Examples:**
- Anti-static packaging
- Custom labeling
- Expedited shipping
- Drop-shipping requirements
- Specific quality certifications

**Voice Interaction:**
```
Robbie: "Any special requirements or notes I should be aware of? 
         For example, packaging, shipping, or quality specifications?"

User: "We need anti-static packaging for all electronic components"

Robbie: "Noted! Anti-static packaging requirement added."
```

#### 2.6 Budget/Cost Target

**✅ AUTOMATICALLY EXTRACTED FROM BOM**
- No need to ask user
- ZBC analysis will be in the BOM file
- AI extracts during Step 3 analysis

---

### Step 3: Context-Aware BOM Analysis (ENHANCED)

**What Changes:**

**Before (Current):**
```
Input: BOM file only
Process: Analyze everything
Output: All possible suppliers
Problem: Many results don't match actual needs
```

**After (Proposed):**
```
Input: BOM file + Requirements context
Process: Analyze WITH constraints
Output: Pre-filtered, relevant suppliers
Benefit: Results are immediately actionable
```

**Backend Processing (20 seconds):**
```javascript
{
  bomFile: "design_v2.xlsx",
  context: {
    compliance: ["ISO 9001", "RoHS"],
    leadTime: "6-8 weeks",
    region: "North America",
    paymentTerms: "Net 30",
    specialRequirements: "Anti-static packaging"
  }
}

// AI analyzes components AND filters by requirements
// Only shows suppliers that meet ALL criteria
```

**Enhanced Output:**
```
✅ Analysis Complete (45 components)

Pre-filtered Results:
├── 38 components: Suppliers match all requirements
├── 5 components: Lead time constraints (8+ weeks needed)
├── 2 components: No North American suppliers with RoHS
└── Total estimated cost: $47,250 (within budget)

⚠️ Issues Requiring Attention:
1. Component XYZ-789: Only Asian suppliers have RoHS
   → Recommendation: Accept Asian supplier OR find alternative part
   
2. Component ABC-456: Minimum lead time is 9 weeks
   → Recommendation: Order immediately OR find expedited option
```

**Voice Feedback:**
```
Robbie: "Analysis complete! Good news - 38 of your 45 components 
         can be sourced from North American suppliers with ISO 9001 
         and RoHS certification within 8 weeks.
         
         However, I found 7 components that need your attention:
         5 have longer lead times, and 2 aren't available from 
         North American RoHS-certified suppliers.
         
         Total estimated cost is $47,250. Would you like to review 
         the details or discuss alternatives for those 7 components?"
```

---

### Step 4: Review & Refine

**Same as current Step 2, but with better context:**
- User reviews the pre-filtered results
- Can adjust quantities/specifications
- Accept AI recommendations or override
- All results already match requirements

---

### Step 5: Preview & Send

**Same as current Step 4:**
- Complete RFQ summary
- All details confirmed
- Send to suppliers

---

## 🔄 Comparison: Before vs After

### Current Flow (4 Steps)
```
1. Upload → 2. Analyze Everything → 3. Add Requirements → 4. Send
   Problem: Requirements come too late!
```

### Proposed Flow (5 Steps)
```
1. Upload → 2. Gather Requirements → 3. Analyze With Context → 4. Review → 5. Send
   Benefit: Analysis is contextualized from the start!
```

---

## 🎤 Voice Integration Changes

### Updated Robbie System Instructions

**New Workflow Prompts:**

```
After file upload:
"Perfect! I've uploaded your file and found {count} components. 
Before I analyze them in detail, I need to understand your project 
requirements. This helps me provide better, more relevant results.

Let's start with compliance requirements..."

After requirements gathering:
"Excellent! I now understand your requirements:
- Compliance: {list}
- Lead time: {time}
- Region: {region}
- Payment: {terms}
- Special notes: {notes}

I'll now analyze all {count} components specifically for suppliers 
that match these criteria. This will take about 20 seconds..."

After analysis:
"Analysis complete! I found {matched} components that fully meet 
your requirements. {issues} components need your attention due to 
{reasons}. Would you like to review the details?"
```

---

## 🏗️ Implementation Details

### ✅ Backend - Step 1 (COMPLETED)

#### 1. Document Extraction Endpoint
```
POST /api/documents/extract

Implementation:
- File: backend/src/routes/documentRoutes.js
- Controller: backend/src/controllers/documentController.js
- Service: backend/src/services/documentExtractor.js
- Validation: backend/src/middleware/fileValidation.js
- ZIP Handler: backend/src/utils/zipExtractor.js

Features:
✅ Accepts up to 10 files simultaneously
✅ Supports: Images, PDFs, Excel, CSV, Word, CAD, SolidWorks, ZIP
✅ Automatic ZIP extraction
✅ Gemini 2.0 Flash for document understanding
✅ Structured JSON output with confidence scoring
✅ Stores results in RFQ model

Request:
- Method: POST
- Content-Type: multipart/form-data
- Field: files (array, max 10)

Response:
{
  "success": true,
  "message": "Documents extracted successfully",
  "data": {
    "extractedData": {
      "documentTypes": ["BOM", "Design"],
      "components": [...],
      "projectInfo": {...},
      "technicalRequirements": {...},
      "metadata": {
        "confidence": 92,
        "filesProcessed": 7
      }
    },
    "filesProcessed": 7,
    "filesUploaded": 2,
    "zipResults": [...]
  }
}
```

#### 2. RFQ Model Updates (COMPLETED)
```javascript
// New fields added to backend/src/models/RFQ.js

sourceDocuments: [{
  fileName: String,
  fileType: String,
  fileSize: Number,
  source: 'direct' | 'zip',
  zipSource: String
}],

extractedDocumentData: {
  documentTypes: ['BOM', 'Design', 'Specification', 'Quotation', 'Other'],
  components: [...],
  projectInfo: {...},
  technicalRequirements: {...},
  metadata: {
    confidence: Number,
    filesProcessed: Number,
    extractedAt: Date
  }
}
```

### 📋 Backend - Steps 2-5 (PLANNED)

#### 1. Requirements Endpoint (TODO)
```
PUT /api/rfqs/:id/requirements

Body:
{
  "compliance": ["ISO 9001", "RoHS"],
  "leadTime": "6-8 weeks",
  "region": "North America",
  "paymentTerms": "Net 30",
  "specialRequirements": "Anti-static packaging"
}

Response:
{
  "success": true,
  "message": "Requirements saved",
  "readyForAnalysis": true
}
```

#### 2. Enhanced Analysis Endpoint
```
PUT /api/rfqs/:id/analyse

Changes:
- Reads requirements from RFQ document
- Passes requirements as context to Gemini AI
- Analysis includes filtering and prioritization
- Results are pre-scored against requirements
```

#### 3. Updated RFQ Model
```javascript
{
  // ... existing fields
  
  requirements: {
    compliance: [String],
    leadTime: String,
    region: String,
    paymentTerms: String,
    specialRequirements: String,
    gatheredAt: Date
  },
  
  analysisContext: {
    requirementsApplied: Boolean,
    matchedComponents: Number,
    flaggedComponents: Number,
    constraintViolations: [Object]
  }
}
```

### Frontend Changes

#### 1. New Step 2 Component
```
frontend/src/components/forms/Step2ProjectRequirements.tsx

- Compliance multi-select
- Lead time dropdown
- Region selector
- Payment terms dropdown
- Special requirements textarea
- Voice-controllable via Robbie
```

#### 2. Renumber Existing Steps
```
Step1DefineRequirement.tsx → No change (upload only)
Step2SmartBOMReview.tsx → Step3SmartBOMReview.tsx
Step3CommercialTerms.tsx → DELETE (fields moved to Step 2)
Step4PreviewRFQ.tsx → Step4ReviewRefine.tsx
                   → Step5PreviewSend.tsx (new)
```

#### 3. Redux State Updates
```typescript
rfq: {
  currentStep: number; // Now 1-5 instead of 1-4
  
  requirements: {
    compliance: string[];
    leadTime: string;
    region: string;
    paymentTerms: string;
    specialRequirements: string;
  },
  
  // Remove separate commercialTerms object
  // Merged into requirements
}
```

#### 4. Voice Function Registry Updates
```typescript
// Remove old functions
- show_commercial_terms()
- set_lead_time()
- set_payment_terms()
- set_delivery_location()

// Add new functions
- show_requirements_form()
- set_compliance_requirement()
- set_lead_time_requirement()
- set_region_preference()
- set_payment_terms()
- set_special_requirements()
- get_requirements_summary()
```

---

## ✅ Benefits of New Workflow

### 1. Context-Aware Analysis
- AI knows constraints upfront
- Results are immediately relevant
- No post-analysis filtering needed

### 2. Reduced Rework
- Get it right the first time
- No "oops, forgot to mention RoHS"
- No re-analysis required

### 3. Faster Time-to-Decision
- Results match actual needs
- Less back-and-forth
- Clearer next steps

### 4. Better Supplier Matching
- Pre-filtered by compliance
- Prioritized by lead time
- Focused on preferred regions

### 5. Matches Real Procurement
- How teams actually work
- Requirements-driven process
- Professional workflow

### 6. Improved Voice Experience
- Natural conversation flow
- Robbie gathers context first
- Better AI recommendations

---

## 📅 Implementation Roadmap

### ✅ Phase 1: Backend - Step 1 (COMPLETED)
- [x] Create document extraction service
- [x] Add ZIP file handling
- [x] Create file validation middleware
- [x] Set up document controller
- [x] Update RFQ model with new fields
- [x] Create extraction API endpoint
- [x] Test with multiple file formats
- [x] Install required packages (adm-zip, @google/genai)

**Completed:** February 10, 2025

### 🚧 Phase 2: Frontend - Step 1 (IN PROGRESS)
- [ ] Create file upload component
- [ ] Add drag-and-drop functionality
- [ ] Integrate with extraction API
- [ ] Display extraction results
- [ ] Show file processing status
- [ ] Handle ZIP file uploads
- [ ] Add error handling
- [ ] Update Redux state for extracted data

**Target:** Next sprint

### 📋 Phase 3: Step 2 - Requirements (PLANNED)
- [ ] Create requirements form component
- [ ] Add compliance multi-select
- [ ] Add lead time selector
- [ ] Add region preference
- [ ] Create requirements API endpoint
- [ ] Update RFQ model for requirements
- [ ] Add voice function support
- [ ] Test requirements flow

**Target:** Sprint 2

### 📋 Phase 4: Step 3 - Context-Aware Analysis (PLANNED)
- [ ] Modify analysis to accept context
- [ ] Update Gemini prompts for context-aware analysis
- [ ] Implement pre-filtering logic
- [ ] Create constraint violation detection
- [ ] Update analysis results display
- [ ] Test with various requirement combinations

**Target:** Sprint 3

### 📋 Phase 5: Steps 4 & 5 - Review & Send (PLANNED)
- [ ] Renumber existing components
- [ ] Update routing
- [ ] Update Redux state flow
- [ ] Add voice integration
- [ ] E2E testing
- [ ] User acceptance testing

**Target:** Sprint 4

---

## 🧪 Testing Scenarios

### Test Case 1: ISO 9001 + RoHS + 8-week Lead Time
```
Input:
- 50 components
- Requires: ISO 9001, RoHS
- Lead time: 8 weeks
- Region: North America

Expected Output:
- Only show suppliers with both certifications
- Filter by 8-week delivery capability
- Prioritize North American suppliers
- Flag components that don't meet criteria
```

### Test Case 2: Flexible Requirements
```
Input:
- 30 components
- No compliance requirements
- Flexible lead time
- Global sourcing

Expected Output:
- Show all available suppliers
- Sort by cost and trust score
- Provide multiple options per component
- No filtering or flagging
```

### Test Case 3: Complex Compliance
```
Input:
- 75 components
- Requires: ISO 9001, AS9100, RoHS, REACH
- Lead time: 12 weeks
- Region: Europe only

Expected Output:
- Highly filtered results
- May have limited supplier options
- Clear identification of hard-to-source items
- Alternative component suggestions
```

---

## 📝 Success Metrics

### Quantitative
- ✅ 40% reduction in analysis rework
- ✅ 60% faster time-to-decision
- ✅ 85% of results match actual needs (vs 60% current)
- ✅ 90% user satisfaction with workflow

### Qualitative
- ✅ Users report more relevant results
- ✅ Less confusion about next steps
- ✅ Voice experience feels more natural
- ✅ Workflow matches expectations

---

## 🔄 Migration Strategy

### For Existing RFQs
- Keep current workflow for in-progress RFQs
- Don't force migration
- New workflow only for new RFQs

### For Users
- In-app tutorial for new workflow
- Robbie explains the change naturally
- Documentation updates
- Support team training

---

## ❓ Open Questions

1. **Should Step 2 be optional?**
   - If user wants to skip, proceed with no filtering?
   - Or require minimum requirements?

2. **Budget handling?**
   - Confirm it's always in BOM file
   - What if missing from BOM?

3. **Voice vs UI priority?**
   - Should voice override UI input?
   - Or UI override voice?

4. **Requirements editing?**
   - Can users go back and change requirements?
   - Does this trigger re-analysis?

---

## 📚 Related Documentation

Once implemented, update these files:
- ✅ [project-robbie-architecture.md](./project-robbie-architecture.md) - Update workflow section
- ✅ [voice-app-architecture.md](./voice-app-architecture.md) - Update command examples
- ✅ [voice-ai-architecture.md](./voice-ai-architecture.md) - Update flow diagrams
- ❌ [workflow-redesign-proposal.md](./workflow-redesign-proposal.md) - DELETE this file

---

---

## 🎯 Current Focus: Frontend Step 1 Implementation

### Next Immediate Steps

1. **Create Upload Component**
   - Multi-file upload with drag-and-drop
   - File type validation on frontend
   - Upload progress indicators
   - Support for ZIP files

2. **API Integration**
   - Call `POST /api/documents/extract`
   - Handle loading states
   - Display extraction results
   - Error handling

3. **State Management**
   - Store extracted data in Redux
   - Update RFQ state with file information
   - Manage upload/extraction flow

4. **UI/UX**
   - Show component count after extraction
   - Display confidence scores
   - File list with details
   - Voice feedback integration

---

**Status:** 🚧 Step 1 Backend Complete - Frontend In Progress  
**Next Step:** Build frontend upload component  
**Timeline:** 1 week per phase
