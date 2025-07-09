# Project Robbie - Precision Procurement Platform

A comprehensive procurement platform with AI-powered document analysis, Zero-Based Costing (ZBC), and smart BoM processing.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:jaydeepc/trp-main.git
   cd trp-main
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   
   The project uses separate environment files for security:
   
   - **Root `.env`** - Contains only frontend configuration
   - **Backend `.env`** - Contains all backend secrets and API keys
   
   **Root `.env` (already configured):**
   ```env
   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:5001/api
   
   # Development Configuration (shared)
   NODE_ENV=development
   ```
   
   **Backend `.env` (contains sensitive data):**
   ```env
   # Gemini AI Configuration
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   GEMINI_MODEL_COMPLEX=gemini-1.5-pro
   GEMINI_THINKING_BUDGET=0
   GEMINI_MAX_TOKENS=8192
   GEMINI_TEMPERATURE=0.1
   
   # Development Configuration
   USE_MOCK_DATA=false
   MOCK_DELAY_MS=1500
   ENABLE_GEMINI_ANALYSIS=true
   GEMINI_CONFIDENCE_THRESHOLD=70
   
   # Backend Configuration
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/project-robbie
   ```
   
   **⚠️ Important**: Replace `your_actual_gemini_api_key_here` with your real Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend API server on `http://localhost:5001`
   - Frontend React app on `http://localhost:3000`

## 🏗️ Architecture

### Environment Variables Security
- **Frontend**: Only receives non-sensitive configuration via `REACT_APP_*` variables
- **Backend**: Contains all API keys and sensitive configuration in `backend/.env`
- **Separation**: Gemini API key is only in backend, never exposed to frontend

### Mock Data System
The backend intelligently switches between real Gemini AI analysis and mock data based on:
- `USE_MOCK_DATA` setting
- `ENABLE_GEMINI_ANALYSIS` setting  
- Confidence threshold for AI analysis quality
- Automatic fallback to mock data if AI analysis fails

## 📁 Project Structure

```
project-robbie/
├── .env                    # Frontend configuration only
├── .gitignore             # Properly ignores .env files
├── package.json           # Root package with dev scripts
├── backend/
│   ├── .env              # Backend secrets & API keys
│   ├── src/
│   │   ├── server.js     # Express server
│   │   ├── services/     # AI & mock services
│   │   └── routes/       # API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   └── services/     # API client
│   └── package.json
└── shared/
    └── mockData/         # Shared mock data
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run backend:dev` - Start only backend server
- `npm run frontend:dev` - Start only frontend server
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

## 🔒 Security Features

- Environment variables properly separated by concern
- API keys never exposed to frontend
- Comprehensive .gitignore to prevent accidental commits
- CORS configuration for secure cross-origin requests
- Rate limiting on API endpoints
- Helmet.js for security headers

## 🤖 AI Features

- **Document Analysis**: Upload CAD files, PDFs, Excel sheets for AI analysis
- **Zero-Based Costing**: Generate or extract ZBC data from documents
- **Smart BoM Processing**: Intelligent Bill of Materials analysis
- **Market Price Prediction**: AI-powered cost forecasting
- **Supplier Recommendations**: Regional sourcing suggestions
- **Compliance Checking**: Automated regulatory compliance verification

## 🚀 Deployment

The project is configured for easy deployment with proper environment variable separation. Make sure to:

1. Set up production environment variables
2. Configure MongoDB connection for production
3. Update CORS origins for production domains
4. Use `npm run build` to create production frontend build

## 📝 Recent Changes

- ✅ Refactored environment variables for security
- ✅ Removed Gemini API key from frontend configuration
- ✅ Updated .gitignore to properly ignore .env files
- ✅ Verified project runs correctly with new configuration
- ✅ Migrated to new repository: `git@github.com:jaydeepc/trp-main.git`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
