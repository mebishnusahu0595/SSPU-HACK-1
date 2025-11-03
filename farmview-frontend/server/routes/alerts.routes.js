const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const WeatherAlert = require('../models/WeatherAlert.model');
const weatherAlertService = require('../services/weatherAlertService');
const cropPrediction = require('../ml/cropPrediction');
const Property = require('../models/Property.model');
const axios = require('axios');

// @route   GET /api/alerts
// @desc    Get all active alerts for logged-in farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await weatherAlertService.getActiveAlerts(req.farmer.farmerId);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/property/:propertyId
// @desc    Get alerts for specific property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const alerts = await WeatherAlert.find({
      farmerId: req.farmer.farmerId,
      property: req.params.propertyId,
      isActive: true
    })
    .sort({ severity: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/history
// @desc    Get alert history (including deactivated)
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const alerts = await WeatherAlert.find({
      farmerId: req.farmer.farmerId
    })
    .populate('property', 'propertyName currentCrop')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert history',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await WeatherAlert.findOne({
      _id: req.params.id,
      farmerId: req.farmer.farmerId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const updatedAlert = await weatherAlertService.markAlertRead(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      data: updatedAlert
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/:id/acknowledge
// @desc    Acknowledge alert (farmer has taken action)
// @access  Private
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await WeatherAlert.findOne({
      _id: req.params.id,
      farmerId: req.farmer.farmerId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const updatedAlert = await weatherAlertService.acknowledgeAlert(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: updatedAlert
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/check-now
// @desc    Manually trigger weather check for all properties
// @access  Private
router.post('/check-now', protect, async (req, res) => {
  try {
    await weatherAlertService.checkAllProperties();

    res.status(200).json({
      success: true,
      message: 'Weather check initiated for all properties'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger weather check',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/check-property/:propertyId
// @desc    Manually trigger weather check for specific property
// @access  Private
router.post('/check-property/:propertyId', protect, async (req, res) => {
  try {
    // Verify property ownership
    const property = await Property.findOne({
      _id: req.params.propertyId,
      farmer: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await weatherAlertService.checkPropertyNow(req.params.propertyId);

    res.status(200).json({
      success: true,
      message: 'Weather check completed for property'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check property weather',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/predict
// @desc    Get ML prediction for custom weather conditions
// @access  Private
router.post('/predict', protect, async (req, res) => {
  try {
    const {
      cropType,
      temperature,
      rainfall,
      humidity,
      windSpeed,
      soilType,
      irrigationType,
      growthStage
    } = req.body;

    if (!cropType || !temperature || !humidity) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: cropType, temperature, humidity'
      });
    }

    const prediction = await cropPrediction.predictCropDamage({
      cropType,
      currentWeather: {
        temperature: parseFloat(temperature),
        rainfall: parseFloat(rainfall) || 0,
        humidity: parseFloat(humidity),
        windSpeed: parseFloat(windSpeed) || 0
      },
      forecastWeather: [],
      soilType: soilType || 'Loamy',
      irrigationType: irrigationType || 'Rainfed',
      growthStage: growthStage || 'vegetative'
    });

    res.status(200).json({
      success: true,
      data: prediction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate prediction',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/stats
// @desc    Get alert statistics for farmer
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalAlerts = await WeatherAlert.countDocuments({
      farmerId: req.farmer.farmerId
    });

    const activeAlerts = await WeatherAlert.countDocuments({
      farmerId: req.farmer.farmerId,
      isActive: true
    });

    const criticalAlerts = await WeatherAlert.countDocuments({
      farmerId: req.farmer.farmerId,
      isActive: true,
      severity: 'Critical'
    });

    const unreadAlerts = await WeatherAlert.countDocuments({
      farmerId: req.farmer.farmerId,
      isActive: true,
      isRead: false
    });

    const alertsByType = await WeatherAlert.aggregate([
      { $match: { farmerId: req.farmer.farmerId, isActive: true } },
      { $group: { _id: '$alertType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const alertsBySeverity = await WeatherAlert.aggregate([
      { $match: { farmerId: req.farmer.farmerId, isActive: true } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalAlerts,
        active: activeAlerts,
        critical: criticalAlerts,
        unread: unreadAlerts,
        byType: alertsByType,
        bySeverity: alertsBySeverity
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics',
      error: error.message
    });
  }
});

module.exports = router;
