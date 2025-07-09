const mongoose = require('mongoose');

const connectDB = async () => {
  // If using mock data, skip database connection
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('🎭 Using mock data mode - skipping database connection');
    return;
  }

  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production');
    }
    console.log('⚠️  Continuing without database connection in development');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // In development or when using mock data, continue without database
    if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true') {
      console.log('⚠️  Continuing in mock data mode without database connection');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
