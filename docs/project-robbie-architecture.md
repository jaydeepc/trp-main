# Project Robbie - Complete Architecture Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Core Features & Workflows](#core-features--workflows)
5. [State Management](#state-management)
6. [Backend API](#backend-api)
7. [Frontend Structure](#frontend-structure)
8. [Security & Configuration](#security--configuration)
9. [Data Flow Examples](#data-flow-examples)
10. [Development Guide](#development-guide)

---

## System Overview

**Project Robbie** is a full-stack AI-powered procurement platform with a sophisticated voice-first interface using Google Gemini Live API. The platform enables organizations to streamline procurement workflows through intelligent automation and natural voice interactions.

### Key Capabilities

-   **Voice-First Interface** - Natural language processing with no wake words required
-   **Smart BOM Analysis** - AI-powered component analysis with 94.2% accuracy in 2.3 seconds
-   **Zero-Based Costing** - Should-cost modeling with market price predictions
-   **Supplier Intelligence** - 200+ pre-qualified suppliers with real-time scoring
-   **Compliance Automation** - Automated regulatory compliance with 99.1% success rate
-   **Cost Optimization** - Average 12.8% cost reduction through AI recommendations

---

## Technology Stack

### Backend Stack

| Component          | Technology         | Version | Purpose                           |
| ------------------ | ------------------ | ------- | --------------------------------- |
| **Runtime**        | Node.js            | Latest  | Server runtime                    |
| **Framework**      | Express.js         | 4.18.2  | Web server framework              |
| **Database**       | MongoDB            | 8.0+    | Document database                 |
| **ODM**            | Mongoose           | 8.0.3   | MongoDB object modeling           |
| **AI Engine**      | Google Gemini AI   | 0.21.0  | Document analysis & processing    |
| **File Upload**    | Multer             | 1.4.5   | Multipart file handling           |
| **File Parsing**   | xlsx, pdf-parse    | Latest  | Document processing               |
| **Authentication** | JWT, bcryptjs      | Latest  | Token-based auth                  |
| **Security**       | Helmet             | 7.1.0   | Security headers                  |
| **Rate Limiting**  | express-rate-limit | 7.1.5   | API rate limiting (100 req/15min) |
| **Compression**    | compression        | 1.7.4   | Response compression              |

### Frontend Stack

| Component            | Technology           | Version | Purpose                     |
| -------------------- | -------------------- | ------- | --------------------------- |
| **UI Library**       | React                | 19.1.0  | Component-based UI          |
| **Language**         | TypeScript           | 4.9.5   | Type safety                 |
| **State Management** | Redux Toolkit        | Latest  | Global state                |
| **Routing**          | React Router         | 7.8.0   | Client-side routing         |
| **Styling**          | Tailwind CSS         | 3.4.17  | Utility-first CSS           |
| **Voice Interface**  | Gemini Live API      | Latest  | Real-time voice interaction |
| **Audio Processing** | Custom AudioRecorder | -       | Audio capture & streaming   |
| **Audio Worklets**   | Web Audio API        | -       | Real-time audio processing  |
| **Data Viz**         | Recharts             | 3.0.2   | Charts & graphs             |
| **Supplier Graphs**  | Vega/Vega-Lite       | 5.22.0  | Advanced visualizations     |
| **Icons**            | Lucide React         | 0.525.0 | Icon library                |
| **HTTP Client**      | Axios                | 1.10.0  | API communication           |
| **Utilities**        | lodash, ahooks       | Latest  | Helper functions            |
| **Events**           | eventemitter3        | 5.0.1   | Event handling              |

---

## Architecture Patterns

### 1. Monorepo Structure

```
trp-main/
├── backend/          # Node.js/Express API server
├── frontend/         # React/TypeScript application
├── shared/           # Shared utilities and mock data
└── docs/             # Architecture documentation
```

### 2. Voice-App Command Bus Pattern

**Purpose:** Enables bidirectional communication between voice interface and application.

**How it Works:**

-   App registers callable commands (createRFQ, uploadFile, navigateTo, etc.)
-   Voice executes commands through Gemini function calling
-   App sends real-time feedback back to voice
-   Shared context management maintains conversation state

**Key Benefits:**

-   Centralized integration point
-   Scalable function registration
-   Bidirectional communication
-   Context synchronization

For detailed implementation, see: [voice-app-architecture.md](./voice-app-architecture.md)

### 3. Function Registry Pattern

**Purpose:** Manages all voice-callable functions with automatic Gemini integration.

**Components:**

-   Function definitions with parameters and descriptions
-   Parameter validation
-   Execution handling with error recovery
-   Conversation state tracking

### 4. Context Provider Pattern

**Purpose:** Manages global application state and API connections.

**Providers:**

-   `LiveAPIProvider` - Gemini Live API connection
-   `RFQProvider` - RFQ workflow management
-   `ReduxProvider` - Global Redux store

---

## Core Features & Workflows

### RFQ Creation Workflow (4 Steps)

#### Step 1: Define Requirements

**User Actions:**

-   Upload CAD files, PDFs, Excel BOMs
-   Can upload via drag-and-drop or file picker
-   Voice command: "Let's upload a file"

**Processing:**

-   File validation (type, size)
-   Backend processing (10-20 seconds)
-   AI analysis using Gemini or mock data fallback
-   Component extraction with metadata

**Output:**

-   List of components with part numbers
-   Material types and quantities
-   Initial ZBC estimates
-   Confidence scores

#### Step 2: Smart BOM Review

**Display:**

-   Interactive table of analyzed components
-   ZBC should-cost vs market price
-   Variance analysis (e.g., +18%)
-   Risk flags and compliance status
-   AI confidence scores (90-95%)

**User Actions:**

-   Review component details
-   Modify quantities or specifications
-   Accept or reject AI suggestions
-   Voice command: "Show me high-risk items"

**Features:**

-   Market price predictions
-   Alternative component suggestions
-   Risk level indicators (Low, Medium, High)
-   Compliance verification status

#### Step 3: Commercial Terms

**Configuration Options:**

**Lead Time:**

-   2-4 weeks (Standard)
-   6-8 weeks (Extended)
-   10-12 weeks (Long-lead)
-   Custom duration
-   Voice: "Set lead time to 8 weeks"

**Payment Terms:**

-   Net 30 / Net 60
-   Milestone-based
-   2/10 Net 30 (2% discount if paid in 10 days)
-   Cash on Delivery
-   Letter of Credit
-   Voice: "Use Net 30 payment terms"

**Delivery Location:**

-   Free-form text input
-   Voice: "Deliver to San Francisco, California"

**Compliance Requirements:**

-   ISO 9001 (Quality Management)
-   AS9100 (Aerospace)
-   ISO 14001 (Environmental)
-   OHSAS 18001 (Health & Safety)
-   RoHS (Hazardous Substances)
-   REACH (Chemical Regulation)
-   FDA (Medical Devices)
-   CE Marking (European Conformity)
-   UL Listed (Safety Certification)
-   Voice: "Add ISO 9001 and RoHS compliance"

**Additional Requirements:**

-   Free-form text for special instructions
-   Packaging requirements
-   Quality control specifications
-   Voice: "Add requirement for anti-static packaging"

**Voice Workflow:**
Robbie guides users through each field sequentially:

1. Asks about lead time → User responds → Confirms
2. Asks about payment terms → User responds → Confirms
3. Asks about delivery → User responds → Confirms
4. Asks about compliance → User responds → Confirms
5. Asks about additional requirements → User responds → Confirms
6. Summarizes all commercial terms

#### Step 4: Preview & Send

**Display:**

-   Complete RFQ summary
-   All components with pricing
-   Total cost estimate
-   Commercial terms recap
-   Supplier recommendations

**Actions:**

-   Review all details
-   Edit if needed (goes back to previous steps)
-   Send to suppliers
-   Save as draft
-   Export as PDF
-   Voice: "Send this RFQ to suppliers"

**Output:**

-   RFQ sent notification
-   Tracking ID generated
-   Email confirmations
-   Status: "Sent" or "Draft"

### Dashboard Features

**Metrics Display:**

-   Total RFQs created
-   Active RFQs in progress
-   Completed RFQs
-   Total components analyzed
-   Average ZBC variance

**Recent Activity:**

-   Latest RFQs with status
-   Recent uploads
-   Pending actions
-   Analytics charts

**Supplier Trust Visualization:**

-   Interactive scatter plot
-   Cost vs Trust Score
-   Regional distribution
-   Supplier count by region

---

## State Management

### Redux Store Structure

```typescript
{
  voice: {
    isConnected: boolean;
    isListening: boolean;
    sendText: (message: string) => void;
    // Manages voice session lifecycle
  },

  rfq: {
    currentStep: number; // 1-4
    desiredLeadTime: string;
    paymentTerms: string;
    deliveryLocation: string;
    complianceRequirements: string[];
    additionalRequirements: string;
    // All commercial terms data
  }
}
```

### Voice Slice Actions

```typescript
- initializeVoice(payload: { sendText: Function })
- disconnectVoice()
- setListening(isListening: boolean)
```

### RFQ Slice Actions

```typescript
- setCurrentStep(step: number)
- setLeadTime(leadTime: string)
- setPaymentTerms(terms: string)
- setDeliveryLocation(location: string)
- addComplianceRequirement(requirement: string)
- removeComplianceRequirement(requirement: string)
- setAdditionalRequirements(requirements: string)
- resetCommercialTerms()
```

### React Context Providers

**LiveAPIContext:**

-   Manages Gemini Live API WebSocket connection
-   Provides: `{ client, connected, connect, disconnect, volume, setConfig, sendText }`
-   Handles audio streaming and response handling

**RFQContext:**

-   RFQ creation and management
-   File upload coordination
-   Analysis triggering
-   Step progression logic

---

## Backend API

### Base URL

-   Development: `http://localhost:5001/api`
-   Production: Configured via `REACT_APP_API_URL`

### Authentication

All API requests require `x-user-id` header (JWT in production).

### RFQ Endpoints

#### `GET /api/rfqs`

List user's RFQs with pagination and filtering.

**Query Parameters:**

-   `status` - Filter by status (draft, in-progress, sent, completed)
-   `limit` - Results per page (default: 20)
-   `page` - Page number (default: 1)

**Response:**

```json
{
    "success": true,
    "data": {
        "items": [
            /* RFQ summaries */
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 45,
            "pages": 3
        }
    }
}
```

#### `POST /api/rfqs`

Create new RFQ.

**Response:**

```json
{
    "success": true,
    "message": "RFQ created successfully",
    "data": {
        "id": "rfq_123",
        "status": "draft",
        "currentStep": 1,
        "createdAt": "2025-02-10T12:00:00Z"
    }
}
```

#### `GET /api/rfqs/:id`

Get specific RFQ details.

#### `PUT /api/rfqs/:id/analyse`

Upload and analyze document.

**Request:**

-   `Content-Type: multipart/form-data`
-   File in `document` field
-   Supported formats: Excel, CSV, PDF, XML

**Processing:**

-   Simulated delay: 20 seconds
-   AI analysis or mock data
-   Component extraction

**Response:**

```json
{
    "success": true,
    "message": "Document processed successfully",
    "data": {
        "components": [
            /* Component list */
        ],
        "suppliers": [
            /* Supplier recommendations */
        ],
        "insights": [
            /* AI insights */
        ]
    }
}
```

#### `PUT /api/rfqs/:id/step2`

Update Step 2 (BOM Review).

**Request Body:**

```json
{
    "componentUpdates": [
        {
            "componentId": "comp_123",
            "changes": {
                "quantity": 15,
                "notes": "Increased quantity"
            }
        }
    ],
    "notes": "Reviewed and approved all components"
}
```

#### `PUT /api/rfqs/:id/step3`

Update Step 3 (Commercial Terms).

**Request Body:**

```json
{
    "desiredLeadTime": "6-8 weeks",
    "paymentTerms": "Net 30",
    "deliveryLocation": "San Francisco, CA, USA",
    "complianceRequirements": ["ISO 9001", "RoHS"],
    "additionalRequirements": "Anti-static packaging required"
}
```

#### `PUT /api/rfqs/:id/step4`

Complete Step 4 (Send RFQ).

**Request Body:**

```json
{
    "action": "send" // or "preview"
}
```

#### `DELETE /api/rfqs/:id`

Delete RFQ.

#### `GET /api/rfqs/analytics/dashboard`

Get dashboard analytics.

**Response:**

```json
{
    "success": true,
    "data": {
        "summary": {
            "totalRFQs": 45,
            "activeRFQs": 12,
            "completedRFQs": 33,
            "totalComponents": 678,
            "averageZBCVariance": -8.5
        },
        "breakdown": [
            /* Status breakdown */
        ]
    }
}
```

### Health Check

#### `GET /api/health`

Server health status.

**Response:**

```json
{
    "status": "OK",
    "timestamp": "2025-02-10T12:00:00Z",
    "environment": "development",
    "mockData": false
}
```

---

## Frontend Structure

### Directory Organization

```
frontend/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── VoiceInterfaceSidebar.tsx    # Main voice UI
│   │   ├── AudioVisualization.tsx       # Waveform display
│   │   ├── Button.tsx, Card.tsx         # Basic components
│   │   ├── FloatingOverlay*.tsx         # Modal system
│   │   ├── Header.tsx                   # App header
│   │   └── ...
│   ├── forms/               # RFQ wizard steps
│   │   ├── Step1DefineRequirement.tsx
│   │   ├── Step2SmartBOMReview.tsx
│   │   ├── Step3CommercialTerms.tsx
│   │   └── Step4PreviewRFQ.tsx
│   └── voice/               # Voice-specific UI
│       └── DetailWindow.tsx
│
├── pages/                   # Route components
│   ├── Dashboard.tsx
│   └── RFQWizard.tsx
│
├── services/                # Business logic
│   ├── api.ts                          # Backend API client
│   ├── VoiceAppCommandBus.ts          # Voice-app bridge
│   ├── voiceFunctionRegistry.ts       # Function definitions
│   ├── voiceActionService.ts          # Voice actions
│   └── voice.service.ts
│
├── lib/                     # Utilities
│   ├── audio-recorder.ts              # Audio capture
│   ├── audio-streamer.ts              # Audio streaming
│   ├── worklets/
│   │   ├── audio-processing.ts        # Audio processing
│   │   └── vol-meter.ts               # Volume meter
│   ├── multimodal-live-client.ts      # Gemini client
│   └── utils.ts
│
├── hooks/                   # Custom React hooks
│   ├── useVoice.tsx
│   ├── useLiveApi.ts
│   └── useInitialEffect.ts
│
├── contexts/                # React Context providers
│   ├── LiveAPIContext.tsx
│   └── RFQContext.tsx
│
├── store/                   # Redux store
│   ├── index.ts
│   ├── voiceSlice.ts
│   └── rfqSlice.ts
│
├── types/                   # TypeScript definitions
│   ├── index.ts
│   └── multimodal-live-types.ts
│
├── layout/                  # Layout components
│   └── Layout.tsx
│
└── data/                    # Static data
    ├── featureDetails.ts
    └── mockBOMData.ts
```

### Component Hierarchy

```
App
├── ReduxProvider
├── LiveAPIProvider
├── RFQProvider
└── Router
    └── Layout
        ├── Header
        ├── VoiceInterfaceSidebar (always present)
        └── Routes
            ├── Dashboard
            └── RFQWizard
                ├── StepIndicator
                ├── Step1DefineRequirement
                ├── Step2SmartBOMReview
                ├── Step3CommercialTerms
                └── Step4PreviewRFQ
```

---

## Security & Configuration

### Environment Variables

#### Backend (.env)

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_COMPLEX=gemini-2.5-pro
GEMINI_THINKING_BUDGET=0
GEMINI_MAX_TOKENS=8192
GEMINI_TEMPERATURE=0.1

# Development Configuration
USE_MOCK_DATA=false
MOCK_DELAY_MS=1500
ENABLE_GEMINI_ANALYSIS=true
GEMINI_CONFIDENCE_THRESHOLD=70

# Server Configuration
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/project-robbie

# Optional
FRONTEND_URL=http://localhost:3000
```

#### Frontend (Root .env)

```env
# Frontend Configuration
REACT_APP_API_URL=http://localhost:5001/api

# Gemini Live API (Frontend)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Development
NODE_ENV=development
```

### Security Features

**Backend Security:**

-   Helmet.js for security headers
-   Rate limiting: 100 requests per 15 minutes
-   CORS with whitelist
-   JWT authentication ready
-   Password hashing with bcryptjs
-   Request compression

**CORS Configuration:**

-   Localhost (any port)
-   All vercel.app domains
-   Custom production URLs
-   Credentials support enabled

**Data Security:**

-   Sensitive data only in backend .env
-   No API keys exposed to frontend (except Live API)
-   Proper .gitignore configuration
-   Environment-based configuration

---

## Data Flow Examples

### Document Upload & Analysis

```
1. User uploads file
   ↓
2. Frontend: POST /api/rfqs/:id/analyse
   ↓
3. Backend: Receives file via multer
   ↓
4. Backend: Processes with Gemini AI or mock data
   - Simulated delay: 20 seconds
   - Component extraction
   - ZBC analysis
   - Risk assessment
   ↓
5. Backend: Returns structured BOM data
   ↓
6. Frontend: Displays in Step 2 (Smart BOM Review)
   ↓
7. Voice: Notified via VoiceAppCommandBus
```

### Voice Command Execution

```
1. User speaks: "Set lead time to 8 weeks"
   ↓
2. AudioRecorder captures audio → PCM conversion
   ↓
3. WebSocket streams to Gemini Live API
   ↓
4. Gemini processes speech, identifies intent
   ↓
5. Gemini calls function: set_lead_time({leadTime: "8 weeks"})
   ↓
6. VoiceFunctionRegistry receives call
   ↓
7. Validates parameters
   ↓
8. Dispatches Redux action: setLeadTime("8 weeks")
   ↓
9. UI updates: Form shows "8 weeks"
   ↓
10. Function returns success
   ↓
11. Gemini speaks: "Lead time set to 8 weeks"
```

### App-to-Voice Feedback

```
1. User uploads file via UI (not voice)
   ↓
2. File upload completes
   ↓
3. App calls: voiceAppCommandBus.sendVoiceFeedback('fileUploaded', {
     name: 'design.pdf',
     components: 45
   })
   ↓
4. Command bus updates shared context
   ↓
5. Voice handler receives feedback
   ↓
6. Gemini receives context update
   ↓
7. Gemini responds: "I see you've uploaded design.pdf with 45 components"
```

---

## Development Guide

### Prerequisites

-   Node.js v16+
-   MongoDB running on port 27017
-   Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Setup

```bash
# Clone repository
git clone git@github.com:jaydeepc/trp-main.git
cd trp-main

# Install dependencies
npm run install:all

# Configure environment variables
# Edit backend/.env with your Gemini API key

# Start development servers
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run backend:dev      # Backend only
npm run frontend:dev     # Frontend only

# Production
npm run build           # Build frontend
npm start              # Start backend in production

# Installation
npm run install:all    # Install all dependencies
npm run backend:install
npm run frontend:install
```

### Development URLs

-   Frontend: http://localhost:3000
-   Backend: http://localhost:5001
-   API: http://localhost:5001/api

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style

-   TypeScript for type safety
-   Functional components with hooks
-   Redux Toolkit for state management
-   Tailwind for styling
-   Comments only when necessary
-   TDD with Red-Green-Refactor cycle

---

## Deployment

### Vercel Deployment

**Backend:**

-   Configured with `vercel.json`
-   Environment variables set in Vercel dashboard
-   CORS configured for production domains

**Frontend:**

-   Standard React build
-   Environment variables in Vercel
-   API URL points to production backend

### Production Checklist

-   [ ] Set production environment variables
-   [ ] Configure MongoDB for production
-   [ ] Update CORS origins
-   [ ] Enable rate limiting
-   [ ] Configure monitoring
-   [ ] Set up error tracking
-   [ ] Enable SSL/HTTPS
-   [ ] Test voice functionality
-   [ ] Verify API connectivity

---

## Known Issues & Future Work

### Current Limitations

1. Hybrid workspace not yet implemented (see [hybrid-workspace-implementation.md](./hybrid-workspace-implementation.md))
2. Test coverage minimal
3. Mobile optimization needed
4. Some unused imports to clean up
5. Error handling could be more comprehensive

### Planned Features

-   Split-screen dashboard + voice interface
-   Mobile voice bar
-   Enhanced analytics
-   Supplier portal
-   Real-time collaboration
-   Advanced reporting

---

## Additional Documentation

-   [Voice-App Architecture](./voice-app-architecture.md) - Detailed Command Bus pattern
-   [Voice AI Architecture](./voice-ai-architecture.md) - Gemini Live integration with diagrams
-   [Hybrid Workspace Implementation](./hybrid-workspace-implementation.md) - Future UI plans

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2025  
**Maintainers:** Project Robbie Team
