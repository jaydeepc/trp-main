# Voice-App Bidirectional Architecture

## 🎯 The Real Challenge

**Voice Assistant needs to handle MANY functions with BIDIRECTIONAL communication:**

```
Voice Functions Needed:
├── createRFQ()
├── uploadFile()  
├── triggerAnalysis()
├── goToCommercialTerms()
├── updateLeadTime(value)
├── updatePaymentTerms(value)
├── updateDeliveryLocation(value)
├── addComplianceRequirement(cert)
├── showRFQPreview()
├── navigateToStep(step)
└── ... (many more)
```

**Data Flow is BIDIRECTIONAL:**
```
Voice → App:  "Create RFQ"
App → Voice:  "RFQ created with ID: RFQ-123"

Voice → App:  "Upload file completed" 
App → Voice:  "File uploaded: design.pdf, 45 components found"

Voice → App:  "Trigger analysis"
App → Voice:  "Analysis completed: $15,420 total cost, 3 optimization opportunities"

Voice → App:  "Set lead time to 8 weeks"
App → Voice:  "Lead time updated to 8 weeks"
```

---

## ✅ Proposed: **Voice-App Command Bus Architecture**

```
┌─────────────────────────────────────────────────────┐
│                    App.tsx                          │
├─────────────────────────────────────────────────────┤
│  RFQProvider + LiveAPIProvider + CommercialTerms   │
│                                                     │  
│  ┌─────────────────────────────────────────────────┐│
│  │            AppContent                           ││
│  │  • useRFQ()                                    ││
│  │  • useNavigate()                               ││  
│  │  • useCommercialTerms()                        ││
│  │                                                ││
│  │  registers with ↓                              ││
│  └─────────────────────────────────────────────────┘│
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           🎙️ VOICE-APP COMMAND BUS 🎙️              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📡 APP COMMAND REGISTRY:                          │
│  ├── registerCommand('createRFQ', handler)         │
│  ├── registerCommand('uploadFile', handler)        │  
│  ├── registerCommand('updateLeadTime', handler)    │
│  ├── registerCommand('navigateToStep', handler)    │
│  └── ... (all app functions)                       │
│                                                     │
│  📤 VOICE FEEDBACK SYSTEM:                         │
│  ├── sendFeedback('fileUploaded', data)           │
│  ├── sendFeedback('analysisCompleted', results)   │
│  ├── sendFeedback('formFieldUpdated', field)      │
│  └── ... (all app → voice communication)          │
│                                                     │
│  🔄 CONTEXT MANAGER:                               │
│  ├── currentStep: number                          │
│  ├── currentRFQ: RFQ | null                       │
│  ├── uploadedFiles: File[]                        │
│  ├── analysisResults: any                         │  
│  └── formState: CommercialTermsData                │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              VoiceInterfaceSidebar                  │
├─────────────────────────────────────────────────────┤
│  • Gemini Live API                                 │
│  • Audio handling                                  │  
│  • Voice function registry                         │
│                                                     │
│  connects to ↑ Command Bus                         │
│                                                     │
│  📥 Receives commands from Gemini                   │
│  📤 Sends feedback to Gemini                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 **Bidirectional Flow Example**

### **Scenario: File Upload → Analysis → Commercial Terms**

```
1. 🎙️ User: "Let's upload a file"
   Voice → Command Bus: executeCommand('createRFQ')
   Command Bus → App: createRFQ()
   App → Command Bus: sendFeedback('rfqCreated', {id: 'RFQ-123'})
   Command Bus → Voice: context.currentRFQ = RFQ-123
   Voice → User: "Great! RFQ-123 created. Please upload your file."

2. 📁 User uploads file in UI
   App → Command Bus: sendFeedback('fileUploaded', {name: 'design.pdf', components: 45})
   Command Bus → Voice: updateContext({uploadedFiles: [...]})
   Voice → User: "Perfect! I found 45 components in design.pdf. Shall I analyze it?"

3. 🎙️ User: "Yes, analyze it"
   Voice → Command Bus: executeCommand('triggerAnalysis', {rfqId: 'RFQ-123'})
   Command Bus → App: triggerAnalysis('RFQ-123')
   App → Command Bus: sendFeedback('analysisStarted')
   Command Bus → Voice: "Analysis started..."
   
   [10 seconds later]
   App → Command Bus: sendFeedback('analysisCompleted', {totalCost: 15420, opportunities: 3})
   Command Bus → Voice: updateContext({analysisResults: ...})
   Voice → User: "Analysis complete! Total cost $15,420 with 3 optimization opportunities. Ready for commercial terms?"

4. 🎙️ User: "Set lead time to 8 weeks"
   Voice → Command Bus: executeCommand('updateLeadTime', {value: '8 weeks'})
   Command Bus → App: updateCommercialTerms('leadTime', '8 weeks')
   App → Command Bus: sendFeedback('fieldUpdated', {field: 'leadTime', value: '8 weeks'})
   Command Bus → Voice: updateContext({formState: {leadTime: '8 weeks'}})
   Voice → User: "Lead time set to 8 weeks. What about payment terms?"
```

---

## 🏗️ **Command Bus Implementation**

```typescript
class VoiceAppCommandBus {
  private appCommands: Map<string, Function> = new Map();
  private voiceFeedback: Function | null = null;
  private context: any = {};

  // App registers its functions
  registerAppCommand(name: string, handler: Function) {
    this.appCommands.set(name, handler);
  }

  // Voice registers to receive feedback
  registerVoiceFeedback(handler: Function) {
    this.voiceFeedback = handler;
  }

  // Voice calls app functions
  async executeAppCommand(name: string, params: any = {}) {
    const handler = this.appCommands.get(name);
    if (handler) {
      const result = await handler(params);
      this.updateContext(name, result);
      return result;
    }
  }

  // App sends feedback to voice
  sendVoiceFeedback(event: string, data: any) {
    if (this.voiceFeedback) {
      this.voiceFeedback(event, data);
    }
    this.updateContext(event, data);
  }

  // Shared context between voice and app
  updateContext(key: string, value: any) {
    this.context[key] = value;
  }

  getContext() {
    return this.context;
  }
}
```

---

## 🎯 **Benefits**

### ✅ **Centralized Integration**
- All voice-app communication goes through one place
- Easy to debug and monitor
- Single source of truth for voice context

### ✅ **Bidirectional Communication**  
- App can notify voice about state changes
- Voice gets real-time feedback
- Context stays synchronized

### ✅ **Scalable Functions**
- Easy to add new voice functions
- Easy to add new app capabilities
- Both sides register independently  

### ✅ **Maintainable**
- Voice component only handles voice logic
- App components only handle business logic
- Command bus handles integration

---

## 🚀 **Implementation Steps**

1. Create `VoiceAppCommandBus` service
2. App registers all its functions (createRFQ, updateFields, etc.)
3. Voice registers to receive feedback
4. Voice calls bus.executeAppCommand() 
5. App calls bus.sendVoiceFeedback()
6. Context flows bidirectionally through bus

**Result: Scalable, maintainable bidirectional voice integration! 🎉**
