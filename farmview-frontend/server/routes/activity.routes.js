const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Activity = require('../models/Activity.model');

// @route   GET /api/activity
// @desc    Get recent activities for logged-in farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find({ farmer: req.farmer._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// @route   POST /api/activity
// @desc    Log a new activity
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, title, description, icon, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Activity type and title are required'
      });
    }

    const activity = await Activity.create({
      farmer: req.farmer._id,
      type,
      title,
      description,
      icon: icon || '📋',
      metadata
    });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
});

// @route   DELETE /api/activity
// @desc    Clear all activities
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    await Activity.deleteMany({ farmer: req.farmer._id });

    res.json({
      success: true,
      message: 'Activities cleared successfully'
    });
  } catch (error) {
    console.error('Clear activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear activities'
    });
  }
});

module.exports = router;
