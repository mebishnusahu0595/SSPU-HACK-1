const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const mongoose = require('mongoose');
const Farmer = require('../models/Farmer.model');
const { generateToken, protect } = require('../middleware/auth.middleware');
const { verifyRecaptcha } = require('../middleware/recaptcha.middleware');

// Initialize GridFS for profile pictures
let gridfsBucket;
const conn = mongoose.connection;

conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'profilePictures'
  });
  console.log('✅ GridFS initialized for profile pictures');
});

// Multer setup for profile picture upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'));
    }
  }
});

// @route   POST /api/auth/signup
// @desc    Register a new farmer
// @access  Public
router.post('/signup', 
  verifyRecaptcha,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ], 
  async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, mobile, password, preferredLanguage } = req.body;

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingFarmer) {
      if (existingFarmer.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login or use different email.'
        });
      }
      if (existingFarmer.mobile === mobile) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already registered. Please login or use different number.'
        });
      }
    }

    // Create new farmer
    const farmer = await Farmer.create({
      name,
      email,
      mobile,
      password,
      preferredLanguage: preferredLanguage || 'en'
    });

    // Generate JWT token
    const token = generateToken(farmer._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to FarmView AI.',
      data: {
        farmerId: farmer.farmerId,
        name: farmer.name,
        email: farmer.email,
        mobile: farmer.mobile,
        preferredLanguage: farmer.preferredLanguage,
        token
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login farmer
// @access  Public
router.post('/login', 
  verifyRecaptcha,
  [
    body('identifier').notEmpty().withMessage('Email or mobile number is required'),
    body('password').notEmpty().withMessage('Password is required')
  ], 
  async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body;

    // Find farmer by email or mobile
    const farmer = await Farmer.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ]
    }).select('+password');

    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/mobile and password.'
      });
    }

    // Check if account is active
    if (!farmer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordMatch = await farmer.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/mobile and password.'
      });
    }

    // Update last login
    await farmer.updateLastLogin();

    // Generate JWT token
    const token = generateToken(farmer._id);

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        farmerId: farmer.farmerId,
        name: farmer.name,
        email: farmer.email,
        mobile: farmer.mobile,
        preferredLanguage: farmer.preferredLanguage,
        profilePicture: farmer.profilePicture,
        token
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const farmer = await Farmer.findById(decoded.id).select('-password');

    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        farmerId: farmer.farmerId,
        name: farmer.name,
        email: farmer.email,
        mobile: farmer.mobile,
        preferredLanguage: farmer.preferredLanguage
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update farmer profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').optional().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required'),
  body('address').optional().trim(),
  body('preferredLanguage').optional().trim()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, mobile, address, preferredLanguage } = req.body;
    const farmerId = req.farmer._id;

    // Check if email or mobile is being changed and already exists
    if (email && email !== req.farmer.email) {
      const existingFarmer = await Farmer.findOne({ email });
      if (existingFarmer && existingFarmer._id.toString() !== farmerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        });
      }
    }

    if (mobile && mobile !== req.farmer.mobile) {
      const existingFarmer = await Farmer.findOne({ mobile });
      if (existingFarmer && existingFarmer._id.toString() !== farmerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already in use by another account'
        });
      }
    }

    // Update farmer profile
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        farmerId: updatedFarmer.farmerId,
        name: updatedFarmer.name,
        email: updatedFarmer.email,
        mobile: updatedFarmer.mobile,
        address: updatedFarmer.address,
        preferredLanguage: updatedFarmer.preferredLanguage,
        profilePicture: updatedFarmer.profilePicture,
        createdAt: updatedFarmer.createdAt
      }
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change farmer password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const farmerId = req.farmer._id;

    // Get farmer with password
    const farmer = await Farmer.findById(farmerId).select('+password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await farmer.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    farmer.password = newPassword;
    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password Change Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.',
      error: error.message
    });
  }
});

// @route   POST /api/auth/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const farmerId = req.farmer._id;
    
    // Delete old profile picture if exists
    if (req.farmer.profilePicture) {
      try {
        const oldFileId = new mongoose.Types.ObjectId(req.farmer.profilePicture);
        await gridfsBucket.delete(oldFileId);
      } catch (err) {
        console.log('No previous profile picture to delete or error:', err.message);
      }
    }

    // Upload new profile picture to GridFS
    const filename = `profile-${farmerId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const uploadStream = gridfsBucket.openUploadStream(filename, {
      metadata: {
        farmerId: req.farmer.farmerId,
        contentType: req.file.mimetype,
        uploadedAt: new Date()
      }
    });

    // Write buffer to GridFS
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      // Update farmer profile with new picture ID
      const updatedFarmer = await Farmer.findByIdAndUpdate(
        farmerId,
        { profilePicture: uploadStream.id.toString() },
        { new: true }
      ).select('-password');

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture: uploadStream.id.toString(),
          farmer: {
            farmerId: updatedFarmer.farmerId,
            name: updatedFarmer.name,
            email: updatedFarmer.email,
            mobile: updatedFarmer.mobile,
            address: updatedFarmer.address,
            preferredLanguage: updatedFarmer.preferredLanguage,
            profilePicture: updatedFarmer.profilePicture,
            createdAt: updatedFarmer.createdAt
          }
        }
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture',
        error: error.message
      });
    });

  } catch (error) {
    console.error('Profile Picture Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// @route   GET /api/auth/profile-picture/:fileId
// @desc    Get profile picture
// @access  Public
router.get('/profile-picture/:fileId', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    const downloadStream = gridfsBucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    });

    downloadStream.on('end', () => {
      res.end();
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Invalid file ID'
    });
  }
});

// @route   DELETE /api/auth/delete-profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/delete-profile-picture', protect, async (req, res) => {
  try {
    const farmerId = req.farmer._id;
    
    if (!req.farmer.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Delete from GridFS
    try {
      const fileId = new mongoose.Types.ObjectId(req.farmer.profilePicture);
      await gridfsBucket.delete(fileId);
    } catch (err) {
      console.log('Error deleting file:', err.message);
    }

    // Update farmer profile
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { profilePicture: null },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        farmer: {
          farmerId: updatedFarmer.farmerId,
          name: updatedFarmer.name,
          email: updatedFarmer.email,
          mobile: updatedFarmer.mobile,
          profilePicture: updatedFarmer.profilePicture
        }
      }
    });

  } catch (error) {
    console.error('Delete Profile Picture Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message
    });
  }
});

module.exports = router;
