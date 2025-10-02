const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://trp-main-cys8.vercel.app',
  'https://trp-main.vercel.app',
  'https://trp-main-git-main-jaydeepc.vercel.app',
  'https://trp-main-jaydeepc.vercel.app'
];

// Add environment-specific origins
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log('🔧 Added FRONTEND_URL to allowed origins:', process.env.FRONTEND_URL);
}

console.log('🌐 Final allowed origins:', allowedOrigins);

// Bulletproof CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS request from origin:', origin);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('📋 Allowed origins:', allowedOrigins);
    
    // Always allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow all localhost origins (any port) for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ CORS: Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow all vercel.app domains for deployment
    if (origin.includes('vercel.app')) {
      console.log('✅ CORS: Allowing vercel.app origin:', origin);
      return callback(null, true);
    }
    
    // Allow specific whitelisted origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowing whitelisted origin:', origin);
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ CORS: Allowing in development mode:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: BLOCKING origin:', origin);
    console.log('📋 Available origins:', allowedOrigins);
    callback(new Error(`CORS blocked: ${origin} not in allowed origins`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Origin',
    'x-user-id'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers manually as backup
  if (origin && (origin.includes('localhost') || origin.includes('vercel.app') || allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin, x-user-id');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request from:', origin);
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/rfqs', require('./routes/rfqRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/debug', require('./routes/debugRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mockData: process.env.USE_MOCK_DATA === 'true'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
const connectDB = require('./config/database');
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Project Robbie Backend running on port ${PORT}`);
  console.log(`📊 Mock Data: ${process.env.USE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`🤖 Gemini Model: ${process.env.GEMINI_MODEL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
