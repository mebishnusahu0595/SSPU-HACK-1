const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

// Admin authentication middleware
exports.authAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No admin token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin' && decoded.role !== 'moderator') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin token.' 
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin account is inactive.' 
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('❌ Admin auth error:', err.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Super admin only middleware
exports.authSuperAdmin = async (req, res, next) => {
  try {
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin privileges required.' 
      });
    }
    next();
  } catch (err) {
    console.error('Super admin auth error:', err);
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};
