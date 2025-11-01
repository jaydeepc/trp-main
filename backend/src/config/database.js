const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables.');
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
    
    // In development, continue without database for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without database connection in development');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
