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

module.exports = router;
