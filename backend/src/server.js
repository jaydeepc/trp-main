const express = require('express');
const { setupMiddleware } = require('./config/middleware');
const connectDB = require('./config/database');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

setupMiddleware(app);

// Handle OPTIONS requests for all routes
app.options('*', (req, res) => {
  res.status(204).end();
});

app.use('/api', require('./routes'));

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Project Robbie Backend running on port ${PORT}`);
  console.log(`🤖 Gemini Model: ${process.env.GEMINI_MODEL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
