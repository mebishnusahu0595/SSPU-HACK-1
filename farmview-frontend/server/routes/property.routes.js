const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Property = require('../models/Property.model');
const multer = require('multer');
const mongoose = require('mongoose');
const axios = require('axios');
const cropPrediction = require('../ml/cropPrediction');
const weatherAlertService = require('../services/weatherAlertService');

// Use memory storage for multer (files handled manually with GridFS)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GridFS bucket (initialized after connection)
let gridfsBucket;
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents'
  });
});

// @route   POST /api/property
// @desc    Add new property
// @access  Private
router.post('/', protect, upload.array('documents', 5), async (req, res) => {
  try {
    const {
      propertyName,
      propertyType,
      area,
      areaUnit,
      coordinates,
      latitude,
      longitude,
      address,
      soilType,
      currentCrop,
      irrigationType
    } = req.body;

    if (!propertyName || !area || !coordinates || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: propertyName, area, coordinates, latitude, longitude'
      });
    }

    // Parse coordinates (should be GeoJSON polygon)
    const parsedCoordinates = JSON.parse(coordinates);

    // Upload files to GridFS manually if any
    const uploadedDocs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = `property-${Date.now()}-${file.originalname}`;
        const uploadStream = gridfsBucket.openUploadStream(filename, {
          metadata: {
            farmerId: req.farmer.farmerId,
            documentType: 'Land Ownership',
            originalName: file.originalname
          }
        });

        uploadStream.end(file.buffer);

        await new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });

        uploadedDocs.push({
          documentType: 'Land Ownership',
          documentName: file.originalname,
          fileId: uploadStream.id,
          uploadedAt: new Date()
        });
      }
    }

    const property = await Property.create({
      farmer: req.farmer._id,
      farmerId: req.farmer.farmerId,
      propertyName,
      propertyType: propertyType || 'Agricultural Land',
      area: {
        value: parseFloat(area),
        unit: areaUnit || 'acres'
      },
      location: {
        type: 'Polygon',
        coordinates: parsedCoordinates
      },
      centerCoordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      address: address ? JSON.parse(address) : {},
      soilType,
      currentCrop,
      irrigationType,
      documents: uploadedDocs
    });

    // ✨ AUTO-FETCH WEATHER FOR THIS LOCATION ✨
    let weatherData = null;
    let mlPrediction = null;
    
    try {
      console.log(`🌤️ Fetching weather for new property at ${latitude}, ${longitude}...`);
      
      // Fetch current weather for property location
      const weatherResponse = await axios.get(
        `http://localhost:5000/api/weather/current`,
        {
          params: { 
            latitude: parseFloat(latitude), 
            longitude: parseFloat(longitude) 
          }
        }
      );
      
      weatherData = weatherResponse.data.data;
      console.log(`✅ Weather fetched: ${weatherData.temperature}°C, ${weatherData.conditions}`);

      // If crop is specified, run ML prediction
      if (currentCrop) {
        console.log(`🤖 Running ML prediction for ${currentCrop} crop...`);
        
        // Fetch forecast for prediction
        const forecastResponse = await axios.get(
          `http://localhost:5000/api/weather/forecast`,
          {
            params: { 
              latitude: parseFloat(latitude), 
              longitude: parseFloat(longitude) 
            }
          }
        );

        mlPrediction = await cropPrediction.predictCropDamage({
          cropType: currentCrop,
          currentWeather: {
            temperature: weatherData.temperature,
            rainfall: weatherData.rainfall || 0,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed || 0
          },
          forecastWeather: forecastResponse.data.data.slice(0, 5).map(day => ({
            temperature: day.temperature,
            rainfall: day.rainfall || 0,
            humidity: day.humidity
          })),
          soilType: soilType || 'Loamy',
          irrigationType: irrigationType || 'Rainfed',
          growthStage: 'germination'
        });

        console.log(`✅ ML Prediction: Risk Level ${mlPrediction.riskAssessment?.riskLevel}, Score ${mlPrediction.riskAssessment?.overallRiskScore}`);

        // If risk is high, create immediate alert
        if (mlPrediction.success && parseFloat(mlPrediction.riskAssessment.overallRiskScore) >= 5) {
          console.log('⚠️ High risk detected! Creating alert...');
          // Alert will be created by weatherAlertService in next check cycle
        }
      }

    } catch (weatherError) {
      console.error('⚠️ Weather fetch failed (non-critical):', weatherError.message);
      // Don't fail property creation if weather fetch fails
    }

    res.status(201).json({
      success: true,
      message: 'Property added successfully',
      data: property,
      weather: weatherData,
      mlAnalysis: mlPrediction ? {
        riskLevel: mlPrediction.riskAssessment?.riskLevel,
        overallRisk: mlPrediction.riskAssessment?.overallRiskScore,
        alerts: mlPrediction.alerts,
        recommendations: mlPrediction.recommendations?.slice(0, 3)
      } : null
    });

  } catch (error) {
    console.error('Property Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add property',
      error: error.message
    });
  }
});

// @route   GET /api/property
// @desc    Get all properties for logged-in farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('GET /api/property - Farmer ID:', req.farmer._id);
    const properties = await Property.find({ farmer: req.farmer._id }).sort({ createdAt: -1 });
    console.log('Found properties:', properties.length);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
});

// @route   GET /api/property/:id
// @desc    Get single property
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
});

// @route   PUT /api/property/:id
// @desc    Update property
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Prevent updates if verified
    if (property.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify verified property. Please contact support if changes are needed.'
      });
    }

    const allowedUpdates = [
      'propertyName', 'propertyType', 'area', 'soilType', 
      'currentCrop', 'irrigationType', 'address'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
});

// @route   DELETE /api/property/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Prevent deletion if verified
    if (property.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete verified property. Contact support for assistance.'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
});

module.exports = router;
