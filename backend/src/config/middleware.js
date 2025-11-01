const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const express = require('express');

// CORS configuration
const getCorsOrigins = () => {
  const localOrigins = ['http://localhost:3000'];

  return [
    ...localOrigins,
    'https://trp-main.vercel.app',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : []),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ];
};

const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-user-id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply all middleware
const setupMiddleware = (app) => {
  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting
  app.use('/api/', rateLimiter);

  // CORS
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
};

module.exports = {
  setupMiddleware,
  corsOptions,
  rateLimiter
};
