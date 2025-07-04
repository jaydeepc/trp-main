const express = require('express');
const router = express.Router();

// Simple authentication routes for MVP
// In production, this would integrate with proper authentication service

// POST /api/auth/login - Simple login (MVP)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For MVP, accept any email/password combination
    // In production, this would validate against user database
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    // Mock user data for MVP
    const user = {
      id: 'demo-user-001',
      email: email,
      name: email.split('@')[0],
      role: 'buyer',
      company: 'Demo Manufacturing Co.',
      permissions: ['create_rfq', 'view_rfq', 'edit_rfq']
    };
    
    // Mock JWT token (in production, use proper JWT signing)
    const token = `mock-jwt-token-${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        expiresIn: '24h'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// POST /api/auth/register - Simple registration (MVP)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required'
      });
    }
    
    // For MVP, accept any registration
    const user = {
      id: `user-${Date.now()}`,
      email,
      name,
      company: company || 'Unknown Company',
      role: 'buyer',
      permissions: ['create_rfq', 'view_rfq', 'edit_rfq'],
      createdAt: new Date().toISOString()
    };
    
    const token = `mock-jwt-token-${Date.now()}`;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token,
        expiresIn: '24h'
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', (req, res) => {
  // For MVP, return demo user
  const userId = req.headers['x-user-id'] || 'demo-user-001';
  
  const user = {
    id: userId,
    email: 'demo@projectrobbie.com',
    name: 'Demo User',
    role: 'buyer',
    company: 'Project Robbie Demo',
    permissions: ['create_rfq', 'view_rfq', 'edit_rfq'],
    preferences: {
      theme: 'light',
      notifications: true,
      defaultLeadTime: '30-45 days',
      defaultPaymentTerms: 'Net 30'
    }
  };
  
  res.json({
    success: true,
    data: { user }
  });
});

// POST /api/auth/logout - Logout
router.post('/logout', (req, res) => {
  // For MVP, just return success
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/status - Check authentication status
router.get('/status', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  res.json({
    success: true,
    data: {
      authenticated: !!token,
      tokenValid: true, // For MVP, always valid
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
