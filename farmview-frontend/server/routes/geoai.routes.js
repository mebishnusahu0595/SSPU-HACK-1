/**
 * GeoAI Routes - Crop Intelligence API
 * Combines satellite data, NDVI, and Gemini AI for crop analysis
 */

const express = require('express');
const router = express.Router();
const geoAIService = require('../services/geoAIService');
const sentinelService = require('../services/sentinelService');
const Property = require('../models/Property.model');
const { protect } = require('../middleware/auth.middleware');

/**
 * POST /api/geoai/analyze-crop
 * Comprehensive crop analysis using GeoAI
 */
router.post('/analyze-crop', protect, async (req, res) => {
  try {
    const {
      propertyId,
      includeImage = true,
      weatherData,
      soilData,
      previousCrop,
      cropStage
    } = req.body;

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`🌾 Analyzing crop for property: ${property.surveyNumber}`);

    // Calculate NDVI data
    let ndviData, satelliteImage;
    
    if (property.boundary && property.boundary.coordinates) {
      const bbox = calculateBBox(property.boundary.coordinates[0]);
      
      // Get NDVI analysis
      ndviData = await sentinelService.calculateNDVI({
        bbox,
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 30
      });

      // Get satellite image if requested
      if (includeImage) {
        const imageResult = await sentinelService.getSatelliteImage({
          bbox,
          fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          toDate: new Date().toISOString().split('T')[0],
          cloudCoverage: 30
        });
        satelliteImage = imageResult.imageBuffer;
      }
    } else {
      return res.status(400).json({ error: 'Property has no valid boundary coordinates' });
    }

    // Analyze with GeoAI
    const analysis = await geoAIService.analyzeCropHealth({
      ndviData,
      satelliteImage,
      location: {
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
        region: property.district
      },
      weatherData: weatherData || {},
      soilData: soilData || property.soilType || {},
      previousCrop,
      cropStage
    });

    res.json({
      success: true,
      propertyId: property._id,
      surveyNumber: property.surveyNumber,
      analysis,
      ndviSummary: {
        mean: ndviData.mean,
        healthyPercentage: ndviData.healthyPercentage,
        stressedPercentage: ndviData.stressedPercentage
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Crop analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze crop',
      message: error.message
    });
  }
});

/**
 * POST /api/geoai/identify-crop
 * Identify crop type from satellite imagery + NDVI
 */
router.post('/identify-crop', protect, async (req, res) => {
  try {
    const { propertyId, seasonData } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`🔍 Identifying crop for property: ${property.surveyNumber}`);

    const bbox = calculateBBox(property.boundary.coordinates[0]);

    // Get satellite image and NDVI
    const [imageResult, ndviData] = await Promise.all([
      sentinelService.getSatelliteImage({
        bbox,
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 30
      }),
      sentinelService.calculateNDVI({
        bbox,
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 30
      })
    ]);

    // Identify crop with GeoAI
    const identification = await geoAIService.identifyCropType({
      satelliteImage: imageResult.imageBuffer,
      ndviData,
      location: {
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
        region: property.district
      },
      seasonData
    });

    res.json({
      success: true,
      propertyId: property._id,
      identification,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Crop identification error:', error);
    res.status(500).json({
      error: 'Failed to identify crop',
      message: error.message
    });
  }
});

/**
 * POST /api/geoai/recommend-crop
 * Get crop recommendation for next season
 */
router.post('/recommend-crop', protect, async (req, res) => {
  try {
    const {
      propertyId,
      currentCrop,
      weatherHistory,
      marketData
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`💡 Generating crop recommendation for: ${property.surveyNumber}`);

    // Get NDVI history (last 6 months)
    const bbox = calculateBBox(property.boundary.coordinates[0]);
    const ndviHistory = await getNDVIHistory(bbox, 6);

    // Get recommendation from GeoAI
    const recommendation = await geoAIService.recommendNextCrop({
      currentCrop,
      soilData: property.soilType || {},
      weatherHistory: weatherHistory || {},
      ndviHistory,
      location: {
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0]
      },
      farmSize: property.area,
      marketData
    });

    res.json({
      success: true,
      propertyId: property._id,
      recommendation,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Crop recommendation error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendation',
      message: error.message
    });
  }
});

/**
 * POST /api/geoai/detect-issues
 * Detect crop health issues (pests, disease, stress)
 */
router.post('/detect-issues', protect, async (req, res) => {
  try {
    const {
      propertyId,
      cropType,
      cropStage,
      weatherData
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`🔬 Detecting issues for: ${property.surveyNumber}`);

    const bbox = calculateBBox(property.boundary.coordinates[0]);

    // Get current data
    const [imageResult, ndviData, ndviHistory] = await Promise.all([
      sentinelService.getSatelliteImage({
        bbox,
        fromDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 30
      }),
      sentinelService.calculateNDVI({
        bbox,
        fromDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 30
      }),
      getNDVIHistory(bbox, 1) // Last month
    ]);

    // Detect issues with GeoAI
    const issueDetection = await geoAIService.detectCropIssues({
      satelliteImage: imageResult.imageBuffer,
      ndviData,
      ndviHistory,
      weatherData: weatherData || {},
      cropType,
      cropStage
    });

    res.json({
      success: true,
      propertyId: property._id,
      issueDetection,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Issue detection error:', error);
    res.status(500).json({
      error: 'Failed to detect issues',
      message: error.message
    });
  }
});

/**
 * POST /api/geoai/predict-yield
 * Predict crop yield based on NDVI and conditions
 */
router.post('/predict-yield', protect, async (req, res) => {
  try {
    const {
      propertyId,
      cropType,
      cropStage,
      weatherData,
      soilData
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log(`📊 Predicting yield for: ${property.surveyNumber}`);

    // Get NDVI history for the growing season
    const bbox = calculateBBox(property.boundary.coordinates[0]);
    const ndviHistory = await getNDVIHistory(bbox, 3);

    // Predict yield with GeoAI
    const yieldPrediction = await geoAIService.predictYield({
      cropType,
      ndviHistory,
      weatherData: weatherData || {},
      soilData: soilData || property.soilType || {},
      farmSize: property.area,
      cropStage
    });

    res.json({
      success: true,
      propertyId: property._id,
      yieldPrediction,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Yield prediction error:', error);
    res.status(500).json({
      error: 'Failed to predict yield',
      message: error.message
    });
  }
});

/**
 * POST /api/geoai/farming-advice
 * Get practical farming advice based on analysis
 */
router.post('/farming-advice', protect, async (req, res) => {
  try {
    const {
      cropType,
      issues,
      season,
      location,
      farmerExperience
    } = req.body;

    console.log(`💬 Generating farming advice for ${cropType}`);

    const advice = await geoAIService.generateFarmingAdvice({
      cropType,
      issues,
      season,
      location,
      farmerExperience
    });

    res.json({
      success: true,
      advice,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Advice generation error:', error);
    res.status(500).json({
      error: 'Failed to generate advice',
      message: error.message
    });
  }
});

/**
 * Helper: Calculate bounding box from coordinates
 */
function calculateBBox(coordinates) {
  let minLon = Infinity, minLat = Infinity;
  let maxLon = -Infinity, maxLat = -Infinity;

  coordinates.forEach(coord => {
    const [lon, lat] = coord;
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  });

  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Helper: Get NDVI history for multiple time periods
 */
async function getNDVIHistory(bbox, monthsBack = 3) {
  const history = [];
  const now = new Date();

  for (let i = 0; i < monthsBack; i++) {
    const toDate = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
    const fromDate = new Date(toDate.getTime() - 15 * 24 * 60 * 60 * 1000);

    try {
      const ndviData = await sentinelService.calculateNDVI({
        bbox,
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
        cloudCoverage: 50
      });

      history.push({
        date: toDate.toISOString().split('T')[0],
        mean: ndviData.mean,
        healthyPercentage: ndviData.healthyPercentage,
        stressedPercentage: ndviData.stressedPercentage
      });
    } catch (error) {
      console.warn(`⚠️ Failed to get NDVI for ${toDate.toISOString()}`);
    }
  }

  return history;
}

module.exports = router;
