# Voice Integration Update Plan for New Workflow

**Date:** February 10, 2025  x
**Status:** 📋 Planning Phase  
**Related:** [Workflow Redesign](./workflow-redesign-proposal.md), [Voice Architecture](./voice-app-architecture.md)

---

## 🎯 Overview

Update Gemini Live voice integration to support the new context-aware BOM analysis workflow where requirements are gathered BEFORE analysis.

## 📊 Workflow Changes Impact on Voice

### Old Workflow (4 Steps)
```
Step 1: Upload Documents
Step 2: Smart BOM Review
Step 3: Commercial Terms ← Voice functions here
Step 4: Preview & Send
```

### New Workflow (4 Steps - Reorganized)
```
Step 1: Upload & Extract Documents
Step 2: Define Requirements + Trigger BOM Analysis ← Voice functions moved here
Step 3: Smart BOM Review (with analyzed data)
Step 4: Preview & Send
```

**Key Change:** Commercial Terms (Step 3) merged into Requirements (Step 2)

---

## 🔧 Required Changes

### 1. Voice Function Registry Updates

**File:** `frontend/src/services/voiceFunctionRegistry.ts`

#### Functions to Update:

##### A. Navigation Functions

**REMOVE:**
```typescript
show_commercial_terms() // Step 3 no longer exists
```

**UPDATE:**
```typescript
// Old
show_bom_analysis() // Was Step 2
  → dispatch(setCurrentStep(2))

// New  
show_requirements_form() // Now Step 2
  → dispatch(setCurrentStep(2))
  → Description: "Show requirements form where user defines compliance, lead time, payment terms, and triggers BOM analysis"
```

**UPDATE:**
```typescript
// Old
show_rfq_preview() // Was Step 4
  → dispatch(setCurrentStep(4))

// New
show_bom_review() // Now Step 3
  → dispatch(setCurrentStep(3))
  → Description: "Show analyzed BOM with enriched component data, supplier recommendations, and insights"

show_rfq_preview() // Now Step 4
  → dispatch(setCurrentStep(4))
```

##### B. Requirements Functions (Keep but update descriptions)

These functions stay the same but are now used in **Step 2** instead of Step 3:

```typescript
✅ set_lead_time(leadTime: string)
✅ set_payment_terms(paymentTerms: string)  
✅ set_delivery_location(location: string)
✅ add_compliance_requirement(requirement: string)
✅ remove_compliance_requirement(requirement: string)
✅ set_additional_requirements(requirements: string)
```

**Update:** Enum values to match backend schema:
- Payment terms: `['Net 30', 'Net 60', '2/10 Net 30', 'Milestone-based', 'Cash on Delivery', 'Letter of Credit']`
- Compliance: `['ISO 9001', 'RoHS', 'REACH', 'CE Marking', 'UL Listed', 'FDA', 'AS9100', 'ISO 14001', 'OHSAS 18001']`

##### C. New Functions to Add

```typescript
trigger_bom_analysis() {
  name: 'trigger_bom_analysis',
  description: 'Trigger BOM analysis with the defined requirements. Must be called after requirements are set.',
  parameters: {
    type: 'object',
    properties: {
      confirm: {
        type: 'boolean',
        description: 'User confirmation to start analysis'
      }
    },
    required: ['confirm']
  },
  function: async (args) => {
    // Validate requirements are set
    const state = store.getState().rfq.commercialTerms;
    if (!state.desiredLeadTime || !state.paymentTerms || !state.deliveryLocation) {
      return {
        success: false,
        message: 'Please set lead time, payment terms, and delivery location before triggering analysis',
        missing: []
      };
    }
    
    // Trigger analysis via RequirementsForm's handleNext
    // This will be done through VoiceAppCommandBus
    voiceAppCommandBus.executeAppCommand('analyzeBO

M');
    
    return {
      success: true,
      message: 'Starting BOM analysis with your requirements. This will take about 20 seconds...',
      estimatedTime: '20 seconds'
    };
  }
}
```

```typescript
get_requirements_summary() {
  name: 'get_requirements_summary',
  description: 'Get a summary of currently defined requirements',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  },
  function: async () => {
    const state = store.getState().rfq.commercialTerms;
    const extractedData = store.getState().rfq.extractedData;
    
    return {
      success: true,
      componentsFound: extractedData?.components?.length || 0,
      requirements: {
        leadTime: state.desiredLeadTime || 'Not set',
        paymentTerms: state.paymentTerms || 'Not set',
        deliveryLocation: state.deliveryLocation || 'Not set',
        compliance: state.complianceRequirements,
        additionalRequirements: state.additionalRequirements || 'None'
      },
      readyForAnalysis: !!(state.desiredLeadTime && state.paymentTerms && state.deliveryLocation)
    };
  }
}
```

```typescript
get_extracted_components_summary() {
  name: 'get_extracted_components_summary',
  description: 'Get summary of components extracted from uploaded documents',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  },
  function: async () => {
    const extractedData = store.getState().rfq.extractedData;
    
    if (!extractedData || !extractedData.components) {
      return {
        success: false,
        message: 'No components extracted yet. Please upload documents first.'
      };
    }
    
    return {
      success: true,
      totalComponents: extractedData.components.length,
      confidence: extractedData.metadata.confidence,
      documentTypes: extractedData.documentTypes,
      components: extractedData.components.slice(0, 5), // First 5 for summary
      message: `Found ${extractedData.components.length} components with ${extractedData.metadata.confidence}% confidence`
    };
  }
}
```

### 2. VoiceAppCommandBus Updates

**File:** `frontend/src/services/VoiceAppCommandBus.ts`

#### Current Implementation Status:
✅ Already exists and working
✅ RequirementsForm already registers commands with it
✅ Bidirectional communication working

#### New Commands Needed:

```typescript
// In RequirementsForm.tsx - already partially implemented
voiceAppCommandBus.registerAppCommand('analyzeBOM', async () => {
  // Trigger the handleNext function
  // This is already implemented in RequirementsForm
  return { success: true, message: 'Triggering BOM analysis...' };
});

voiceAppCommandBus.registerAppCommand('getRequirements', async () => {
  // Already implemented
  return {
    success: true,
    data: {
      compliance: localCompliance,
      leadTime: localLeadTime,
      paymentTerms: localPaymentTerms,
      region: localRegion,
      additionalRequirements: localAdditional
    }
  };
});
```

#### Context Updates After BOM Analysis:

```typescript
// In RequirementsForm.tsx handleNext() - ADD THIS:
// After analysis completes successfully
voiceAppCommandBus.sendVoiceFeedback('bomAnalysisComplete', {
  componentsAnalyzed: result.components.length,
  insights: result.insights,
  suppliersFound: Object.keys(result.suppliers).length,
  readyForReview: true
});
```

### 3. Gemini Live System Instructions Update

**File:** `frontend/src/contexts/LiveAPIContext.tsx` (or wherever system instructions are set)

#### Current System Instructions (Excerpt):
```
You are Robbie, an AI-powered procurement assistant...
The workflow has 4 steps:
1. Upload Documents
2. BOM Analysis
3. Commercial Terms
4. Preview & Send
```

#### Updated System Instructions:

```markdown
# Robbie - AI Procurement Assistant System Instructions

You are Robbie, an AI-powered procurement assistant for Project Robbie, helping organizations streamline their RFQ (Request for Quote) creation process.

## Core Workflow (4 Steps)

### Step 1: Upload & Document Extraction
- User uploads BOM, design files, or specifications
- System extracts components using Gemini AI (5-10 seconds)
- Displays structured component data
- Voice: Help user upload files, confirm extraction results

### Step 2: Define Requirements & Trigger Analysis ⭐ NEW
**Purpose:** Gather project constraints BEFORE analysis for context-aware results

**Requirements to Gather:**
1. **Compliance Requirements**
   - ISO 9001, RoHS, REACH, CE Marking, UL Listed, FDA, AS9100, ISO 14001, OHSAS 18001
   - Ask: "Do you need any compliance certifications?"
   
2. **Lead Time**
   - Presets: 1-2 weeks, 2-4 weeks, 4-6 weeks, 6-8 weeks, 8-12 weeks, 12+ weeks
   - Ask: "What's your desired lead time?"
   
3. **Payment Terms**
   - Options: Net 30, Net 60, 2/10 Net 30, Milestone-based, Cash on Delivery, Letter of Credit
   - Ask: "What payment terms work for your organization?"
   
4. **Delivery Location/Region**
   - Examples: North America, Europe, Asia Pacific, specific city/country
   - Ask: "Where should components be delivered?"
   
5. **Additional Requirements** (Optional)
   - Special packaging, expedited shipping, custom labeling, etc.

**After Requirements Gathered:**
- Summarize what user has configured
- Confirm: "Ready to analyze with these requirements?"
- Trigger BOM analysis with context
- Analysis takes ~20 seconds
- Results are PRE-FILTERED by requirements

**Voice Flow Example:**
```
Robbie: "Great! I see that there are 45 components requiring smart BOM analysis. Before analyzing, I need to understand your requirements. This helps me provide relevant results. Let's start with compliance - do you need any certifications like ISO 9001 or RoHS?"

User: "Yes, ISO 9001 and RoHS"

Robbie: "Perfect! ISO 9001 and RoHS noted. What's your desired lead time?"

User: "8 weeks"

Robbie: "Got it, 8-week lead time. What payment terms?"

User: "Net 30"

Robbie: "Excellent! And where should components be delivered?"

User: "San Francisco"

Robbie: "Perfect! Let me summarize:
- 45 components to analyze
- Compliance: ISO 9001, RoHS  
- Lead time: 8 weeks
- Payment: Net 30
- Location: San Francisco

Ready to start analysis with these requirements?"

User: "Yes"

Robbie: "Analyzing now with your requirements as context... [20 seconds]"
Robbie: "Analysis complete! Found 38 components that meet ALL your requirements. 7 components need attention due to lead time or region constraints. Would you like to review?"
```

### Step 3: Smart BOM Review
- Review analyzed components with enriched data
- Components show: AI suggestions, compliance status, risk flags, suppliers, pricing
- All results PRE-FILTERED by Step 2 requirements
- Voice: Help review components, explain insights, navigate suppliers

### Step 4: Preview & Send
- Final RFQ summary
- Confirm all details
- Send to suppliers

## Key Voice Functions Available

### Navigation:
- `show_requirements_form()` - Step 2
- `show_bom_review()` - Step 3  
- `show_rfq_preview()` - Step 4
- `navigate_to(destination)` - dashboard, etc.

### Requirements Management (Step 2):
- `set_lead_time(leadTime)`
- `set_payment_terms(paymentTerms)`
- `set_delivery_location(location)`
- `add_compliance_requirement(requirement)`
- `remove_compliance_requirement(requirement)`
- `set_additional_requirements(requirements)`
- `get_requirements_summary()` - Check current state
- `trigger_bom_analysis()` - Start analysis

### Component Information:
- `get_extracted_components_summary()` - View extracted components

## Conversation Guidelines

1. **Context-First Approach**
   - Always gather requirements before analysis
   - Explain WHY we need requirements (better results)
   - Be conversational but efficient

2. **Progressive Disclosure**
   - Don't overwhelm with all options at once
   - Ask one requirement at a time
   - Summarize after each major section

3. **Confirmation & Feedback**
   - Confirm each requirement as it's set
   - Provide real-time feedback
   - Summarize before triggering analysis

4. **Error Handling**
   - If requirements incomplete, explain what's missing
   - Offer to help fill missing requirements
   - Don't trigger analysis without required fields

5. **Analysis Communication**
   - Set expectations (20 seconds)
   - Provide progress updates if possible
   - Celebrate completion with key insights

## Response Style

- Natural and conversational
- Professional but friendly
- Clear and concise
- Proactive suggestions
- Patient with user questions

## Example Responses

**After Upload:**
"Perfect! I've extracted 45 components from your design.pdf. Before I analyze them, I need to understand your project requirements. This helps me filter suppliers and provide relevant results. Let's start with compliance requirements..."

**Missing Requirements:**
"I notice we haven't set a delivery location yet. Where would you like components shipped to? This helps me prioritize regional suppliers."

**Ready to Analyze:**
"Excellent! I have all your requirements:
• 45 components
• Compliance: ISO 9001, RoHS
• Lead time: 8 weeks  
• Payment: Net 30
• Location: North America

Ready to start the analysis? It'll take about 20 seconds."

**Analysis Complete:**
"Analysis done! Good news - 38 of your 45 components can be sourced from North American suppliers with ISO 9001 and RoHS certification within 8 weeks. However, 7 components need attention due to longer lead times. Total estimated cost: $47,250. Would you like to review the details?"
```

### 4. Voice Context Management

#### Context to Send After Each Step:

**After Step 1 (Upload & Extract):**
```typescript
voiceAppCommandBus.updateContext('step1Complete', {
  componentsFound: extractedData.components.length,
  confidence: extractedData.metadata.confidence,
  documentTypes: extractedData.documentTypes,
  readyForRequirements: true
});
```

**During Step 2 (Requirements Entry):**
```typescript
// After each requirement is set
voiceAppCommandBus.sendVoiceFeedback('requirementUpdated', {
  field: 'leadTime' | 'paymentTerms' | 'deliveryLocation' | 'compliance',
  value: newValue,
  allRequirementsSet: isValid
});
```

**After Step 2 (BOM Analysis Complete):**
```typescript
voiceAppCommandBus.sendVoiceFeedback('bomAnalysisComplete', {
  totalComponents: result.components.length,
  matchedComponents: result.components.filter(c => c.riskFlag.level === 'Low').length,
  flaggedComponents: result.components.filter(c => c.riskFlag.level !== 'Low').length,
  insights: result.insights,
  totalSuppliers: Object.values(result.suppliers).flat().length,
  estimatedCost: calculateTotalCost(result.components),
  readyForReview: true
});
```

---

## 🎯 Implementation Checklist

### Phase 1: Function Registry Updates
- [ ] Remove `show_commercial_terms()` function
- [ ] Rename `show_bom_analysis()` → `show_requirements_form()`
- [ ] Add `show_bom_review()` for Step 3
- [ ] Update `show_rfq_preview()` to Step 4
- [ ] Update enum values for payment terms and compliance
- [ ] Add `trigger_bom_analysis()` function
- [ ] Add `get_requirements_summary()` function
- [ ] Add `get_extracted_components_summary()` function
- [ ] Update all function descriptions

### Phase 2: CommandBus Integration
- [ ] Verify RequirementsForm commands registered
- [ ] Add `analyzeBOM` command handler
- [ ] Add context updates after BOM analysis
- [ ] Test bidirectional communication
- [ ] Verify feedback messages reach Gemini Live

### Phase 3: System Instructions
- [ ] Update workflow description (4 steps)
- [ ] Add detailed Step 2 requirements gathering guide
- [ ] Update voice flow examples
- [ ] Add response templates
- [ ] Update function availability list
- [ ] Add context-first approach guidelines

### Phase 4: Testing
- [ ] Test Step 1 → Step 2 navigation
- [ ] Test requirements gathering flow
- [ ] Test BOM analysis trigger
- [ ] Test context updates
- [ ] Test Step 2 → Step 3 transition
- [ ] Test complete workflow end-to-end
- [ ] Test error handling
- [ ] Test voice feedback

---

## 📝 Voice Conversation Flows

### Complete Happy Path

```
👤 User: "Let's create a new RFQ"
🤖 Robbie: "Great! I've opened the RFQ creation page. Please upload your BOM or design files."

👤 [Uploads design.pdf]
🤖 Robbie: "Perfect! I've extracted 45 components with 92% confidence. Before analyzing, I need your project requirements. Do you need any compliance certifications?"

👤 User: "ISO 9001 and RoHS"
🤖 Robbie: "Excellent! ISO 9001 and RoHS compliance noted. What's your desired lead time?"

👤 User: "6 to 8 weeks"
🤖 Robbie: "Got it, 6-8 week lead time. What about payment terms?"

👤 User: "Net 30"
🤖 Robbie: "Perfect! Net 30 payment terms set. Where should components be delivered?"

👤 User: "San Francisco"
🤖 Robbie: "Great! Delivery to San Francisco. Any special requirements like expedited shipping or custom packaging?"

👤 User: "No, that's all"
🤖 Robbie: "Excellent! Let me summarize:
• 45 components to analyze
• Compliance: ISO 9001, RoHS
• Lead time: 6-8 weeks
• Payment: Net 30
• Location: San Francisco

Ready to start analysis?"

👤 User: "Yes, analyze it"
🤖 Robbie: "Starting BOM analysis with your requirements. This will take about 20 seconds..."

[20 seconds later]

🤖 Robbie: "Analysis complete! Found 42 components that fully meet your requirements. 3 components need attention:
• 2 have longer lead times (9-10 weeks)
• 1 limited availability in North America

Total estimated cost: $32,450. Would you like to review the details?"

👤 User: "Yes, show me the review"
🤖 Robbie: "Taking you to the Smart BOM Review now where you can see all analyzed components with supplier recommendations..."
```

### Alternative Flow - Requirements Checking

```
👤 User: "What requirements have I set?"
🤖 Robbie: "Let me check your current requirements...

Currently set:
• Lead time: 6-8 weeks ✓
• Payment terms: Net 30 ✓  
• Delivery location: Not set ✗
• Compliance: ISO 9001, RoHS ✓

You still need to set a delivery location before we can analyze. Where would you like components delivered?"

👤 User: "New York"
🤖 Robbie: "Perfect! Delivery location set to New York. You now have all required information. Ready to trigger the analysis?"
```

### Error Handling Flow

```
👤 User: "Analyze the BOM"
🤖 Robbie: "I'd love to start the analysis, but I need a few more details first:

Missing requirements:
• Lead time - How soon do you need the components?
• Payment terms - What payment terms work for you?
• Delivery location - Where should components be delivered?

Let's start with lead time. What's your desired timeframe?"
```

---

## 🚀 Deployment Plan

1. **Code Changes** (1-2 days)
   - Update voiceFunctionRegistry.ts
   - Add new functions
   - Update CommandBus integration
   - Update system instructions

2. **Testing** (1 day)
   - Unit tests for new functions
   - Integration tests for voice flow
   - End-to-end workflow testing
   - Voice conversation testing

3. **Documentation** (0.5 days)
   - Update voice-app-architecture.md
   - Update README
   - Add voice command reference

4. **Deployment** (0.5 days)
   - Deploy to staging
   - User acceptance testing
   - Deploy to production
   - Monitor voice interactions

**Total Estimated Time:** 3-4 days

---

## 📚 Related Files to Update

- ✅ `docs/workflow-redesign-proposal.md` - Already updated
- [ ] `frontend/src/services/voiceFunctionRegistry.ts` - Main updates
- [ ] `frontend/src/services/VoiceAppCommandBus.ts` - Context updates
- [ ] `frontend/src/contexts/LiveAPIContext.tsx` - System instructions
- [ ] `frontend/src/components/forms/RequirementsForm.tsx` - Voice feedback
- [ ] `docs/voice-app-architecture.md` - Architecture documentation
- [ ] `README.md` - Voice command reference

---

**Status:** 📋 Ready for Implementation  
**Next Step:** Begin Phase 1 - Function Registry Updates
