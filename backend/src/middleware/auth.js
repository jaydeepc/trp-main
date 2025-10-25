// Authentication middleware to extract user ID from headers
const authMiddleware = (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID is required'
      });
    }

    // Attach user ID to request object
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication failed'
    });
  }
};

// Optional auth middleware (doesn't fail if no user ID)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (userId) {
      req.userId = userId;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
