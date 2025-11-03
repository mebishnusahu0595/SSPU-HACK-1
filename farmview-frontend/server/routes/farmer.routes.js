const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Farmer = require('../models/Farmer.model');

// @route   GET /api/farmer/profile
// @desc    Get farmer profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// @route   PUT /api/farmer/profile
// @desc    Update farmer profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'mobile', 'address', 'preferredLanguage', 'profilePicture'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const farmer = await Farmer.findByIdAndUpdate(
      req.farmer._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: farmer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   PUT /api/farmer/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const farmer = await Farmer.findById(req.farmer._id).select('+password');
    
    const isMatch = await farmer.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    farmer.password = newPassword;
    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// @route   DELETE /api/farmer/account
// @desc    Deactivate account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    await Farmer.findByIdAndUpdate(req.farmer._id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
});

module.exports = router;
