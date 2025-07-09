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
  'https://trp-main.vercel.app', // Your actual frontend domain
  'https://your-frontend-domain.vercel.app', // Add your frontend domain here
];

// Add environment-specific origins
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow all localhost origins for development
    if (origin && origin.includes('localhost')) {
      console.log('CORS: Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow all vercel.app domains for deployment
    if (origin && origin.includes('vercel.app')) {
      console.log('CORS: Allowing vercel.app origin:', origin);
      return callback(null, true);
    }
    
    // Check against specific allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Allowing whitelisted origin:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: BLOCKING origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/rfqs', require('./routes/rfqRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

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
