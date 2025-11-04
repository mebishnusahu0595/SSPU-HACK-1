const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Property = require('../models/Property.model');
const Activity = require('../models/Activity.model');
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

    // Log activity
    await Activity.create({
      farmer: req.farmer._id,
      type: 'property_added',
      title: 'New Property Added',
      description: `Added property: ${propertyName} (${area} ${areaUnit || 'acres'})`,
      icon: '🏡',
      metadata: { propertyId: property._id, propertyName }
    }).catch(err => console.error('Activity log error:', err));

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

// @route   POST /api/property/:id/verify-ai
// @desc    ADVANCED ML Property Verification - Ensemble Learning with Deep Validation
// @access  Private
router.post('/:id/verify-ai', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }

    // Find property - use 'farmer' field (ObjectId) not 'farmerId' (String)
    const property = await Property.findOne({ 
      _id: id, 
      farmer: req.farmer._id 
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or access denied'
      });
    }

    console.log(`\n🚀 ==========================================`);
    console.log(`   ADVANCED ML VERIFICATION INITIATED`);
    console.log(`   Property: ${property.propertyName}`);
    console.log(`   Property ID: ${id}`);
    console.log(`   Farmer: ${req.farmer.name || req.farmer.email}`);
    console.log(`==========================================\n`);

    // Import Advanced ML Verification System
    const AdvancedMLVerification = require('../ml/advancedPropertyVerification');

    // Perform Ensemble ML Verification
    const mlResult = await AdvancedMLVerification.performEnsembleVerification(property);

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: 'ML verification failed',
        error: mlResult.error
      });
    }

    // Update property with ML results
    property.isVerified = mlResult.isVerified;
    property.verificationScore = mlResult.verificationScore;
    property.verificationLevel = mlResult.verificationLevel;
    property.mlConfidence = mlResult.confidence;
    property.verificationDetails = mlResult.insights;
    property.verifiedAt = mlResult.isVerified ? new Date() : null;

    await property.save();

    // Log activity
    await Activity.create({
      farmer: req.farmer._id,
      type: 'document_verified',
      title: `Property Verified: ${property.propertyName}`,
      description: `Advanced ML verification completed with ${mlResult.verificationLevel} level (${mlResult.verificationScore.toFixed(1)}% score)`,
      metadata: {
        propertyId: property._id,
        score: mlResult.verificationScore,
        confidence: mlResult.confidence,
        status: mlResult.status,
        level: mlResult.verificationLevel,
        processingTime: mlResult.processingTime
      },
      icon: mlResult.verificationLevel === 'GOLD' ? '🥇' : 
            mlResult.verificationLevel === 'SILVER' ? '🥈' : 
            mlResult.verificationLevel === 'BRONZE' ? '🥉' : '⏳'
    });

    console.log(`\n✅ ==========================================`);
    console.log(`   ML VERIFICATION COMPLETED`);
    console.log(`   Status: ${mlResult.status}`);
    console.log(`   Score: ${mlResult.verificationScore.toFixed(2)}/100`);
    console.log(`   Confidence: ${mlResult.confidence.toFixed(2)}%`);
    console.log(`   Level: ${mlResult.verificationLevel}`);
    console.log(`   Processing Time: ${mlResult.processingTime}`);
    console.log(`==========================================\n`);

    res.json({
      success: true,
      message: 'Advanced ML verification completed',
      data: {
        property: {
          _id: property._id,
          propertyName: property.propertyName,
          isVerified: property.isVerified,
          verificationScore: property.verificationScore,
          verificationLevel: property.verificationLevel,
          mlConfidence: property.mlConfidence,
          verifiedAt: property.verifiedAt
        },
        mlAnalysis: {
          overallScore: mlResult.verificationScore,
          confidence: mlResult.confidence,
          status: mlResult.status,
          verificationLevel: mlResult.verificationLevel,
          isVerified: mlResult.isVerified,
          processingTime: mlResult.processingTime,
          layerScores: {
            coordinates: mlResult.layerResults.coordinates.score,
            boundary: mlResult.layerResults.boundary.score,
            documents: mlResult.layerResults.documents.score,
            satellite: mlResult.layerResults.satellite.score,
            completeness: mlResult.layerResults.completeness.score
          },
          layerConfidence: {
            coordinates: mlResult.layerResults.coordinates.confidence,
            boundary: mlResult.layerResults.boundary.confidence,
            documents: mlResult.layerResults.documents.confidence,
            satellite: mlResult.layerResults.satellite.confidence,
            completeness: mlResult.layerResults.completeness.confidence
          }
        },
        insights: mlResult.insights,
        recommendation: mlResult.recommendation,
        nextSteps: mlResult.nextSteps,
        detailedAnalysis: {
          coordinates: mlResult.layerResults.coordinates.details,
          boundary: mlResult.layerResults.boundary.details,
          documents: mlResult.layerResults.documents.details,
          satellite: mlResult.layerResults.satellite.details,
          completeness: mlResult.layerResults.completeness.details
        }
      }
    });

  } catch (error) {
    console.error('❌ ML Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Advanced ML verification failed',
      error: error.message
    });
  }
});

module.exports = router;
