const mongoose = require('mongoose');

const cropWeatherSchema = new mongoose.Schema({
  // Crop Information
  cropName: {
    type: String,
    required: true,
    enum: [
      'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean',
      'Chickpea', 'Pigeon Pea', 'Groundnut', 'Sunflower', 'Mustard',
      'Potato', 'Tomato', 'Onion', 'Chilli', 'Other'
    ]
  },
  
  // Weather Thresholds for Crop Damage
  thresholds: {
    // Temperature (°C)
    temperature: {
      min: { type: Number, default: 10 }, // Frost damage
      max: { type: Number, default: 40 }, // Heat stress
      optimal_min: { type: Number, default: 15 },
      optimal_max: { type: Number, default: 30 }
    },
    
    // Rainfall (mm)
    rainfall: {
      min_daily: { type: Number, default: 2 }, // Drought threshold
      max_daily: { type: Number, default: 50 }, // Flood risk
      max_weekly: { type: Number, default: 150 },
      optimal_daily: { type: Number, default: 5 }
    },
    
    // Humidity (%)
    humidity: {
      min: { type: Number, default: 30 }, // Too dry
      max: { type: Number, default: 90 }, // Fungal diseases
      optimal_min: { type: Number, default: 50 },
      optimal_max: { type: Number, default: 70 }
    },
    
    // Wind Speed (km/h)
    windSpeed: {
      max: { type: Number, default: 40 }, // Crop damage
      critical: { type: Number, default: 60 } // Severe damage
    }
  },
  
  // Growth Stages and Sensitivities
  growthStages: [{
    stage: String, // Germination, Vegetative, Flowering, Maturity
    durationDays: Number,
    sensitivityFactors: {
      rain: Number, // 1-10 scale
      heat: Number,
      cold: Number,
      humidity: Number
    }
  }],
  
  // Common Weather-Related Damages
  damagePatterns: [{
    weatherCondition: {
      type: String,
      enum: ['Heavy Rain', 'Drought', 'Heat Wave', 'Cold Wave', 'High Humidity', 'Strong Wind', 'Hailstorm']
    },
    description: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    preventiveMeasures: [String]
  }],
  
  // Seasonal Information
  bestSeasons: [{
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid']
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CropWeather', cropWeatherSchema);
