const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

// Admin authentication middleware
exports.authAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No admin token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { id: decoded.id, role: decoded.role, username: decoded.username });
    
    // Check if it's an admin token
    if (decoded.role !== 'admin' && decoded.role !== 'super-admin' && decoded.role !== 'moderator') {
      console.log('❌ Not an admin role:', decoded.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      console.log('❌ Admin not found with id:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin token.' 
      });
    }

    if (!admin.isActive) {
      console.log('❌ Admin account inactive:', admin.username);
      return res.status(403).json({ 
        success: false, 
        message: 'Admin account is inactive.' 
      });
    }

    console.log('✅ Admin authenticated:', admin.username);
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
