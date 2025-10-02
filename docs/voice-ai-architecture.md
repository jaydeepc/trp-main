# Voice + AI Architecture Documentation

> 📚 **See Also:** 
> - [Complete Project Architecture](./project-robbie-architecture.md) for full system documentation
> - [Voice-App Command Bus](./voice-app-architecture.md) for bidirectional communication pattern

This document outlines the complete architecture for integrating Gemini Live voice capabilities with the Project Robbie procurement platform.

## Overview

The system leverages Gemini Live's automatic function calling capabilities to create a natural voice interface for procurement workflows. Key features include:

- Real-time voice interaction with 3D audio visualization
- Automatic function selection based on natural language
- Context-aware conversations with UI state synchronization
- Streaming responses with dynamic UI updates

## Core Architecture Components

```mermaid
flowchart TD
    A[User Voice Input] --> B[AudioInterface Hook]
    B --> C[3D Audio Visualization]
    B --> D[Gemini Live API]
    D --> E{Function Router}
    E -->|UI Control| F[show_upload_form]
    E -->|Analysis| G[analyze_bom]
    E -->|Cost Calc| H[calculate_zbc]
    E -->|Suppliers| I[suggest_suppliers]
    E -->|Navigation| J[navigate_to]
    
    F --> K[State Manager]
    G --> L[Backend Services]
    H --> L
    I --> L
    J --> M[UI Navigation]
    
    K --> N[UI Updates]
    L --> N
    M --> N
    N --> O[User Sees/Hears Response]
    
    style D fill:#e1f5fe
    style E fill:#f3e5f5
    style N fill:#e8f5e8
```

## 1. Main Voice Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant AudioInterface
    participant AudioVisualization
    participant GeminiLive
    participant StateManager
    participant UI
    
    User->>AudioInterface: Speak query
    AudioInterface->>AudioVisualization: Show listening state (blue particles)
    AudioInterface->>GeminiLive: Stream audio to Gemini Live
    GeminiLive->>GeminiLive: Process speech & determine function
    
    alt Function Call Required
        GeminiLive->>StateManager: Call appropriate function
        StateManager->>UI: Update interface
        StateManager->>GeminiLive: Return function result
    end
    
    GeminiLive->>AudioVisualization: Show speaking state (teal particles)
    GeminiLive->>User: Provide voice response
    AudioVisualization->>AudioVisualization: Return to idle (blue particles)
    UI->>User: Display visual updates
```

## 2. File Upload & Context Injection Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant StateManager
    participant GeminiLive
    participant BackendService
    
    Note over User,BackendService: User uploads file through UI
    User->>UI: Uploads BOM file (drag & drop)
    UI->>StateManager: updateState("FILE_UPLOADED", fileDetails)
    StateManager->>GeminiLive: Send system message about upload
    Note right of GeminiLive: Gemini Live now knows<br/>a file was uploaded
    
    GeminiLive->>User: "I see you've uploaded inventory.xlsx. Would you like me to analyze this BOM file?"
    User->>GeminiLive: "Yes, please"
    
    GeminiLive->>GeminiLive: Determine function: analyze_bom
    GeminiLive->>BackendService: Call analyze_bom(fileDetails)
    BackendService->>BackendService: Process with Gemini API
    BackendService->>GeminiLive: Return structured BOM analysis
    
    GeminiLive->>UI: Navigate to BOM Review component
    GeminiLive->>User: "I've analyzed your BOM file. Found 15 components with 3 high-risk items..."
```

## 3. BOM Analysis Workflow

```mermaid
sequenceDiagram
    participant User
    participant GeminiLive
    participant FunctionRouter
    participant BackendAPI
    participant GeminiService
    participant SmartBOMReview
    
    User->>GeminiLive: Voice confirmation for BOM analysis
    GeminiLive->>FunctionRouter: Call analyze_bom function
    FunctionRouter->>BackendAPI: /api/documents/process
    BackendAPI->>GeminiService: processBOMFile(buffer, fileName, type)
    
    Note over GeminiService: Uses Gemini AI with specialized<br/>BOM extraction prompts
    
    GeminiService->>GeminiService: AI analysis with structured JSON response
    GeminiService->>BackendAPI: Return component data
    BackendAPI->>GeminiLive: Send analysis results
    GeminiLive->>SmartBOMReview: Update UI with components
    SmartBOMReview->>User: Display interactive BOM table
    GeminiLive->>User: "Analysis complete. I found aluminum housing, precision bearings..."
```

## 4. ZBC Cost Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant GeminiLive
    participant FunctionRouter
    participant BackendAPI
    participant GeminiService
    participant CostVisualization
    
    User->>GeminiLive: "Calculate costs for these components"
    GeminiLive->>FunctionRouter: Call calculate_zbc function
    
    alt Engineering Design Analysis
        FunctionRouter->>BackendAPI: analyzeEngineeringDesign
        BackendAPI->>GeminiService: Generate ZBC from design specs
    else Existing ZBC Report
        FunctionRouter->>BackendAPI: extractZBCReport  
        BackendAPI->>GeminiService: Extract pre-calculated ZBC values
    end
    
    GeminiService->>GeminiService: Process with cost analysis prompts
    GeminiService->>BackendAPI: Return ZBC calculations
    BackendAPI->>GeminiLive: Send cost data
    GeminiLive->>CostVisualization: Update UI with cost breakdown
    CostVisualization->>User: Display ZBC analysis with charts
    GeminiLive->>User: "Total estimated cost is $847. The aluminum housing shows +18% variance..."
```

## 5. Supplier Recommendation Flow

```mermaid
sequenceDiagram
    participant User
    participant GeminiLive
    participant FunctionRouter
    participant BackendAPI
    participant GeminiService
    participant SupplierView
    
    User->>GeminiLive: "Find suppliers for these components"
    GeminiLive->>FunctionRouter: Call suggest_suppliers function
    FunctionRouter->>BackendAPI: generateSuggestions
    
    par Market Analysis
        BackendAPI->>GeminiService: predictMarketPrices
        GeminiService->>BackendAPI: Return pricing data
    and Supplier Analysis
        BackendAPI->>GeminiService: generateSuggestions  
        GeminiService->>BackendAPI: Return supplier recommendations
    end
    
    BackendAPI->>GeminiLive: Combined supplier & pricing data
    GeminiLive->>SupplierView: Display supplier options with ratings
    SupplierView->>User: Show supplier cards with risk/cost analysis
    GeminiLive->>User: "I recommend 3 suppliers. TechCorp offers best price, but MfgPro has better reliability..."
```

## 6. State Management Architecture

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Listening: User activates voice
    Listening --> Processing: Speech recognized
    Processing --> FunctionExecution: Function determined
    FunctionExecution --> Responding: Function complete
    Responding --> Idle: Response delivered
    
    Listening --> Error: Recognition failed
    Processing --> Error: Intent unclear
    FunctionExecution --> Error: Function failed
    Error --> Idle: Reset conversation
    
    state Processing {
        [*] --> IntentDetection
        IntentDetection --> ParameterExtraction
        ParameterExtraction --> FunctionSelection
        FunctionSelection --> [*]
    }
    
    state FunctionExecution {
        [*] --> ValidateParameters
        ValidateParameters --> CallBackend
        CallBackend --> UpdateUI
        UpdateUI --> [*]
    }
```

## 7. Function Definitions Schema

```mermaid
classDiagram
    class FunctionRegistry {
        +Map~string, Function~ functions
        +registerFunction(name, config)
        +executeFunction(name, params)
        +validateParameters(params, schema)
    }
    
    class UIControlFunctions {
        +show_upload_form()
        +hide_upload_form()
        +navigate_to(destination)
        +set_view_mode(mode)
    }
    
    class AnalysisFunctions {
        +analyze_bom(fileName, fileType)
        +calculate_zbc(components, options)
        +suggest_suppliers(components, preferences)
        +predict_prices(components, region)
    }
    
    class StateFunctions {
        +get_uploaded_files()
        +get_current_view()
        +get_conversation_context()
        +update_user_preferences(prefs)
    }
    
    FunctionRegistry --> UIControlFunctions
    FunctionRegistry --> AnalysisFunctions
    FunctionRegistry --> StateFunctions
```

## 8. Context Injection Pattern

```mermaid
sequenceDiagram
    participant UIAction
    participant StateManager
    participant ContextBuffer
    participant GeminiLive
    
    Note over UIAction,GeminiLive: Keeping Gemini Live informed of UI actions
    
    UIAction->>StateManager: File uploaded
    StateManager->>ContextBuffer: Store file metadata
    StateManager->>GeminiLive: Send system message
    Note right of GeminiLive: "User uploaded inventory.xlsx<br/>Type: Excel, Size: 2.3MB"
    
    UIAction->>StateManager: Navigate to step 2
    StateManager->>ContextBuffer: Update current view
    StateManager->>GeminiLive: Send context update  
    Note right of GeminiLive: "User is now viewing<br/>Smart BOM Review"
    
    UIAction->>StateManager: Modify component quantity
    StateManager->>ContextBuffer: Update component data
    StateManager->>GeminiLive: Send data change notification
    Note right of GeminiLive: "Component quantity changed<br/>from 10 to 15 units"
```

## 9. Error Handling & Recovery

```mermaid
flowchart TD
    A[Voice Input] --> B{Speech Recognition}
    B -->|Success| C[Process Intent]
    B -->|Failed| D[Ask for Repetition]
    
    C --> E{Function Available?}
    E -->|Yes| F[Execute Function]
    E -->|No| G[Clarify Intent]
    
    F --> H{Function Success?}
    H -->|Success| I[Provide Response]
    H -->|Failed| J[Error Recovery]
    
    D --> A
    G --> A
    J --> K[Suggest Alternative]
    K --> A
    
    I --> L[Update UI]
    L --> M[End Interaction]
    
    style D fill:#ffebee
    style G fill:#fff3e0
    style J fill:#ffebee
    style K fill:#fff3e0
```

## Implementation Checklist

### Frontend Components
- [ ] Integrate Gemini Live WebSocket connection
- [ ] Implement function registry with UI state hooks
- [ ] Create context state manager
- [ ] Connect audio visualization to conversation states
- [ ] Add error handling and recovery flows

### Backend Services
- [ ] Set up Gemini Live API endpoints
- [ ] Implement function call routing
- [ ] Create context injection middleware
- [ ] Add function execution logging
- [ ] Implement streaming response handling

### Function Definitions
- [ ] UI control functions (show/hide forms, navigation)
- [ ] Analysis functions (BOM, ZBC, suppliers)
- [ ] State query functions (files, context, preferences)
- [ ] User preference management

### Testing Strategy
- [ ] Unit tests for function registry
- [ ] Integration tests for voice workflows
- [ ] E2E tests for complete user journeys
- [ ] Error condition testing
- [ ] Performance testing for streaming responses

## Notes

- All diagrams assume Gemini Live is configured with the appropriate function definitions
- State management requires careful synchronization between UI actions and conversation context
- Error handling should provide graceful degradation to text-based interaction when voice fails
- Function parameters should be validated both client-side and server-side
- Conversation context should be persisted across sessions for continuity

---

*Generated: January 2025*
*Version: 1.0*
*Status: Architecture Documentation*
