const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const Document = require('../models/Document.model');
const Property = require('../models/Property.model');
const Farmer = require('../models/Farmer.model');
const { authAdmin, authSuperAdmin } = require('../middleware/adminAuth');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Contact super admin.'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        username: admin.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        verificationsCount: admin.verificationsCount
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get Admin Profile
router.get('/profile', authAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        verificationsCount: req.admin.verificationsCount,
        lastLogin: req.admin.lastLogin,
        createdAt: req.admin.createdAt
      }
    });
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Get Dashboard Statistics
router.get('/dashboard/stats', authAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await Farmer.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalDocuments = await Document.countDocuments();
    
    // ONLY manual pending documents (exclude AI-verified)
    const pendingDocuments = await Document.countDocuments({
      status: 'Pending',
      verificationStatus: { $ne: 'auto-verified' }, // Exclude AI-verified
      verificationMethod: { $ne: 'ocr-ai' } // Exclude OCR-AI method
    });
    
    const verifiedDocuments = await Document.countDocuments({
      status: 'Verified'
    });
    
    const rejectedDocuments = await Document.countDocuments({
      status: 'Rejected'
    });

    // AI-verified documents count (not shown to admin)
    const aiVerifiedDocuments = await Document.countDocuments({
      verificationStatus: 'auto-verified',
      verificationMethod: 'ocr-ai'
    });

    // Recent activities
    const recentDocuments = await Document.find({
      status: 'Pending',
      verificationStatus: { $ne: 'auto-verified' },
      verificationMethod: { $ne: 'ocr-ai' }
    })
      .populate('uploadedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProperties = await Property.find()
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalDocuments,
        pendingDocuments, // Only manual pending
        verifiedDocuments,
        rejectedDocuments,
        aiVerifiedDocuments // Just for info, not actionable
      },
      recentDocuments,
      recentProperties
    });

  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get Pending Documents for Manual Verification
router.get('/documents/pending', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ONLY manual pending documents (exclude AI-verified)
    const query = {
      status: 'Pending',
      verificationStatus: { $ne: 'auto-verified' },
      verificationMethod: { $ne: 'ocr-ai' }
    };

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get pending documents error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending documents'
    });
  }
});

// Get All Documents (with filters)
router.get('/documents', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const verificationType = req.query.verificationType;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by verification type
    if (verificationType === 'manual') {
      query.verificationMethod = { $ne: 'ocr-ai' };
      query.verificationStatus = { $ne: 'auto-verified' };
    } else if (verificationType === 'ai') {
      query.$or = [
        { verificationMethod: 'ocr-ai' },
        { verificationStatus: 'auto-verified' }
      ];
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get all documents error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// Get Single Document Details
router.get('/documents/:id', authAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email phone address');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get related property if exists
    const relatedProperty = await Property.findOne({
      documents: document._id
    }).populate('farmerId', 'name email phone');

    res.json({
      success: true,
      document,
      relatedProperty
    });

  } catch (err) {
    console.error('Get document details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document details'
    });
  }
});

// Verify Document (Manual Verification by Admin)
router.put('/documents/:id/verify', authAdmin, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Verified/Rejected) is required'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Prevent admin from verifying AI-verified documents
    if (document.verificationStatus === 'auto-verified' || document.verificationMethod === 'ocr-ai') {
      return res.status(403).json({
        success: false,
        message: 'Cannot manually verify AI-verified documents. These are automatically verified.'
      });
    }

    // Update document
    document.status = status;
    document.verificationStatus = status === 'Verified' ? 'verified' : 'rejected';
    document.verificationMethod = 'manual';
    document.verifiedBy = req.admin._id;
    document.verifiedAt = new Date();
    document.verificationRemarks = remarks;

    await document.save();

    // Update admin verification count
    req.admin.verificationsCount += 1;
    await req.admin.save();

    // If document is linked to a property, update property verification status
    const property = await Property.findOne({ documents: document._id });
    if (property) {
      property.documentVerificationStatus = status === 'Verified' ? 'verified' : 'rejected';
      property.verificationMethod = 'manual';
      await property.save();
    }

    res.json({
      success: true,
      message: `Document ${status.toLowerCase()} successfully`,
      document
    });

  } catch (err) {
    console.error('Verify document error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document'
    });
  }
});

// Get All Users
router.get('/users', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await Farmer.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Farmer.countDocuments();

    // Get document counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const documentCount = await Document.countDocuments({ uploadedBy: user._id });
        const propertyCount = await Property.countDocuments({ farmerId: user._id });
        return {
          ...user.toObject(),
          documentCount,
          propertyCount
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get User Details
router.get('/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await Farmer.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's documents and properties
    const documents = await Document.find({ uploadedBy: user._id }).sort({ createdAt: -1 });
    const properties = await Property.find({ farmerId: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      documents,
      properties
    });

  } catch (err) {
    console.error('Get user details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

// Create New Admin (Super Admin Only)
router.post('/create-admin', authAdmin, authSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username or email already exists'
      });
    }

    const admin = new Admin({
      username,
      email,
      password,
      role: role || 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin'
    });
  }
});

module.exports = router;
