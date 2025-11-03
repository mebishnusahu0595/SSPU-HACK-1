const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer.model');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get farmer from token
      req.farmer = await Farmer.findById(decoded.id).select('-password');

      if (!req.farmer) {
        return res.status(401).json({
          success: false,
          message: 'Farmer not found. Token invalid.'
        });
      }

      if (!req.farmer.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Generate JWT Token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
