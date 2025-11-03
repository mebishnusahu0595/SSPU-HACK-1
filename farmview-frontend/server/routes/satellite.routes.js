const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Property = require('../models/Property.model');
const sentinelService = require('../services/sentinelService');

// @route   GET /api/satellite/property/:propertyId
// @desc    Get satellite image for a property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
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

    // Calculate bounding box from property coordinates
    const bbox = sentinelService.calculateBoundingBox(property.location.coordinates);

    // Get dates in ISO-8601 format (required by Sentinel Hub)
    const toDate = new Date().toISOString();
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch satellite image
    const imageData = await sentinelService.getSatelliteImage({
      bbox,
      fromDate,
      toDate,
      width: 512,
      height: 512,
      cloudCoverage: 30
    });

    res.status(200).json({
      success: true,
      message: 'Satellite image retrieved successfully',
      data: {
        propertyId: property._id,
        propertyName: property.propertyName,
        image: imageData.image,
        format: imageData.format,
        dimensions: {
          width: imageData.width,
          height: imageData.height
        },
        dateRange: {
          from: fromDate,
          to: toDate
        }
      }
    });

  } catch (error) {
    console.error('Satellite Image Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve satellite image',
      error: error.message
    });
  }
});

// @route   GET /api/satellite/ndvi/:propertyId
// @desc    Get NDVI (crop health) data for a property
// @access  Private
router.get('/ndvi/:propertyId', protect, async (req, res) => {
  try {
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

    // Calculate bounding box
    const bbox = sentinelService.calculateBoundingBox(property.location.coordinates);

    // Get dates in ISO-8601 format (required by Sentinel Hub)
    const toDate = new Date().toISOString();
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch NDVI data
    const ndviData = await sentinelService.getNDVI({
      bbox,
      fromDate,
      toDate,
      width: 512,
      height: 512
    });

    res.status(200).json({
      success: true,
      message: 'NDVI data retrieved successfully',
      data: {
        propertyId: property._id,
        propertyName: property.propertyName,
        currentCrop: property.currentCrop,
        ndviData: ndviData.ndviData,
        format: ndviData.format,
        dimensions: {
          width: ndviData.width,
          height: ndviData.height
        },
        dateRange: {
          from: fromDate,
          to: toDate
        },
        interpretation: {
          high: 'NDVI > 0.6: Healthy, dense vegetation',
          medium: 'NDVI 0.3-0.6: Moderate vegetation',
          low: 'NDVI < 0.3: Sparse vegetation or bare soil',
          negative: 'NDVI < 0: Water, clouds, or snow'
        }
      }
    });

  } catch (error) {
    console.error('NDVI Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve NDVI data',
      error: error.message
    });
  }
});

// @route   POST /api/satellite/custom-image
// @desc    Get satellite image for custom coordinates
// @access  Private
router.post('/custom-image', protect, async (req, res) => {
  try {
    const { bbox, fromDate, toDate, width, height } = req.body;

    if (!bbox || bbox.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Valid bbox required: [minLon, minLat, maxLon, maxLat]'
      });
    }

    const imageData = await sentinelService.getSatelliteImage({
      bbox,
      fromDate: fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      toDate: toDate || new Date().toISOString(),
      width: width || 512,
      height: height || 512
    });

    res.status(200).json({
      success: true,
      message: 'Custom satellite image retrieved',
      data: imageData
    });

  } catch (error) {
    console.error('Custom Image Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve custom image',
      error: error.message
    });
  }
});

// @route   GET /api/satellite/ndvi-stats/:propertyId
// @desc    Get NDVI statistics (numerical values) for analysis
// @access  Private
router.get('/ndvi-stats/:propertyId', protect, async (req, res) => {
  try {
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

    // Calculate bounding box
    const bbox = sentinelService.calculateBoundingBox(property.location.coordinates);

    // Get dates
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate NDVI statistics
    const ndviStats = await sentinelService.calculateNDVI({
      bbox,
      fromDate,
      toDate,
      cloudCoverage: 30
    });

    res.status(200).json({
      success: true,
      message: 'NDVI statistics calculated successfully',
      data: {
        propertyId: property._id,
        propertyName: property.propertyName,
        currentCrop: property.currentCrop,
        statistics: ndviStats,
        dateRange: {
          from: fromDate,
          to: toDate
        }
      }
    });

  } catch (error) {
    console.error('NDVI Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate NDVI statistics',
      error: error.message
    });
  }
});

// @route   POST /api/satellite/temporal-analysis
// @desc    Compare NDVI changes over time (Before vs After)
// @access  Private
router.post('/temporal-analysis', protect, async (req, res) => {
  try {
    const { propertyId, beforeDate, afterDate } = req.body;

    const property = await Property.findOne({
      _id: propertyId,
      farmer: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Calculate bounding box
    const bbox = sentinelService.calculateBoundingBox(property.location.coordinates);

    // Set default dates if not provided
    const after = afterDate ? new Date(afterDate) : new Date();
    const before = beforeDate ? new Date(beforeDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days before

    console.log(`📊 Temporal Analysis: ${before.toISOString()} vs ${after.toISOString()}`);

    // Fetch NDVI for BEFORE date
    const ndviBefore = await sentinelService.calculateNDVI({
      bbox,
      fromDate: new Date(before.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      toDate: before.toISOString().split('T')[0],
      cloudCoverage: 50
    });

    // Fetch NDVI for AFTER date
    const ndviAfter = await sentinelService.calculateNDVI({
      bbox,
      fromDate: new Date(after.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      toDate: after.toISOString().split('T')[0],
      cloudCoverage: 50
    });

    // Calculate change statistics
    const statsBefore = ndviBefore.statistics;
    const statsAfter = ndviAfter.statistics;

    const change = {
      meanNDVI: {
        before: statsBefore.mean,
        after: statsAfter.mean,
        change: statsAfter.mean - statsBefore.mean,
        percentChange: ((statsAfter.mean - statsBefore.mean) / statsBefore.mean * 100).toFixed(2)
      },
      healthyPixels: {
        before: statsBefore.healthyPixels,
        after: statsAfter.healthyPixels,
        change: statsAfter.healthyPixels - statsBefore.healthyPixels,
        percentChange: ((statsAfter.healthyPixels - statsBefore.healthyPixels) / statsBefore.healthyPixels * 100).toFixed(2)
      },
      stressedPixels: {
        before: statsBefore.stressedPixels,
        after: statsAfter.stressedPixels,
        change: statsAfter.stressedPixels - statsBefore.stressedPixels,
        percentChange: ((statsAfter.stressedPixels - statsBefore.stressedPixels) / (statsBefore.stressedPixels || 1) * 100).toFixed(2)
      }
    };

    // Determine overall health trend
    let healthTrend = 'stable';
    let severity = 'low';
    let alerts = [];

    if (change.meanNDVI.change < -0.1) {
      healthTrend = 'declining';
      severity = 'high';
      alerts.push('⚠️ Significant vegetation decline detected');
      alerts.push('🌧️ Possible causes: Heavy rain, flooding, pest attack, disease');
      alerts.push('🚨 Immediate field inspection recommended');
    } else if (change.meanNDVI.change < -0.05) {
      healthTrend = 'declining';
      severity = 'medium';
      alerts.push('⚠️ Moderate vegetation stress detected');
      alerts.push('💧 Check irrigation and drainage');
    } else if (change.meanNDVI.change > 0.1) {
      healthTrend = 'improving';
      alerts.push('✅ Vegetation health improving');
      alerts.push('🌱 Current practices working well');
    }

    // Check for damaged areas
    if (change.stressedPixels.change > 100) {
      alerts.push(`🔴 ${change.stressedPixels.change} more stressed pixels detected`);
      alerts.push('📍 Inspect damaged areas for waterlogging, pest infestation');
    }

    res.status(200).json({
      success: true,
      message: 'Temporal analysis completed',
      data: {
        propertyName: property.propertyName,
        currentCrop: property.currentCrop,
        analysis: {
          beforeDate: before.toISOString().split('T')[0],
          afterDate: after.toISOString().split('T')[0],
          daysDifference: Math.round((after - before) / (1000 * 60 * 60 * 24)),
          healthTrend,
          severity,
          change,
          alerts,
          recommendations: generateTemporalRecommendations(healthTrend, severity, change, property.currentCrop)
        },
        images: {
          before: ndviBefore.image,
          after: ndviAfter.image
        }
      }
    });

  } catch (error) {
    console.error('Temporal Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform temporal analysis',
      error: error.message
    });
  }
});

// Helper function to generate recommendations
function generateTemporalRecommendations(trend, severity, change, crop) {
  const recommendations = [];

  if (trend === 'declining' && severity === 'high') {
    recommendations.push({
      priority: 'URGENT',
      icon: '🚨',
      action: 'Field Inspection',
      description: 'Visit the field immediately to assess damage extent'
    });
    recommendations.push({
      priority: 'URGENT',
      icon: '💧',
      action: 'Check Drainage',
      description: 'If heavy rain occurred, ensure proper water drainage to prevent waterlogging'
    });
    recommendations.push({
      priority: 'HIGH',
      icon: '🐛',
      action: 'Pest/Disease Check',
      description: 'Look for signs of pest infestation or disease outbreak'
    });
    recommendations.push({
      priority: 'HIGH',
      icon: '📸',
      action: 'Document Damage',
      description: 'Take photos for insurance claim if needed'
    });
  } else if (trend === 'declining' && severity === 'medium') {
    recommendations.push({
      priority: 'HIGH',
      icon: '💧',
      action: 'Irrigation Review',
      description: 'Check if irrigation schedule needs adjustment'
    });
    recommendations.push({
      priority: 'MEDIUM',
      icon: '🌱',
      action: 'Nutrient Management',
      description: 'Consider soil testing and appropriate fertilization'
    });
  } else if (trend === 'improving') {
    recommendations.push({
      priority: 'LOW',
      icon: '✅',
      action: 'Continue Current Practices',
      description: 'Your current farming practices are working well'
    });
    recommendations.push({
      priority: 'LOW',
      icon: '📊',
      action: 'Monitor Progress',
      description: 'Keep tracking NDVI weekly to maintain improvement'
    });
  }

  return recommendations;
}

module.exports = router;
