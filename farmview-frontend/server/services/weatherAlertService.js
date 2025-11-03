const cron = require('node-cron');
const axios = require('axios');
const Property = require('../models/Property.model');
const WeatherAlert = require('../models/WeatherAlert.model');
const cropPrediction = require('../ml/cropPrediction');

class WeatherAlertService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  /**
   * Start the weather monitoring service
   * Runs every 6 hours to check weather and generate alerts
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Weather Alert Service is already running');
      return;
    }

    console.log('🌤️ Starting Weather Alert Service...');
    
    // Run immediately on start
    this.checkAllProperties();

    // Schedule to run every 6 hours: 0 0,6,12,18 * * *
    // For testing, you can use: */5 * * * * (every 5 minutes)
    this.checkInterval = cron.schedule('0 */6 * * *', () => {
      console.log('⏰ Running scheduled weather check...');
      this.checkAllProperties();
    });

    this.isRunning = true;
    console.log('✅ Weather Alert Service started successfully');
  }

  /**
   * Stop the weather monitoring service
   */
  stop() {
    if (this.checkInterval) {
      this.checkInterval.stop();
      this.isRunning = false;
      console.log('🛑 Weather Alert Service stopped');
    }
  }

  /**
   * Check all properties and generate alerts
   */
  async checkAllProperties() {
    try {
      console.log('🔍 Checking weather for all properties...');
      
      // Get all properties with active crops
      const properties = await Property.find({ currentCrop: { $ne: null } })
        .populate('farmer', 'farmerId email mobile preferredLanguage');

      console.log(`📍 Found ${properties.length} properties to monitor`);

      for (const property of properties) {
        try {
          await this.checkPropertyWeather(property);
        } catch (error) {
          console.error(`❌ Error checking property ${property._id}:`, error.message);
        }
      }

      console.log('✅ Weather check completed for all properties');
    } catch (error) {
      console.error('❌ Error in checkAllProperties:', error);
    }
  }

  /**
   * Check weather for a single property and generate alerts if needed
   */
  async checkPropertyWeather(property) {
    try {
      const { latitude, longitude } = property.centerCoordinates;
      
      // Fetch current weather
      const weatherResponse = await axios.get(
        `http://localhost:5000/api/weather/current`,
        {
          params: { latitude, longitude }
        }
      );

      const currentWeather = weatherResponse.data.data;

      // Fetch 5-day forecast
      const forecastResponse = await axios.get(
        `http://localhost:5000/api/weather/forecast`,
        {
          params: { latitude, longitude }
        }
      );

      const forecastWeather = forecastResponse.data.data;

      // Run ML prediction
      const prediction = await cropPrediction.predictCropDamage({
        cropType: property.currentCrop,
        currentWeather: {
          temperature: currentWeather.temperature,
          rainfall: currentWeather.rainfall || 0,
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windSpeed
        },
        forecastWeather: forecastWeather.slice(0, 5).map(day => ({
          temperature: day.temperature,
          rainfall: day.rainfall || 0,
          humidity: day.humidity
        })),
        soilType: property.soilType || 'Loamy',
        irrigationType: property.irrigationType || 'Rainfed',
        growthStage: this.estimateGrowthStage(property)
      });

      if (!prediction.success) {
        console.log(`⚠️ Prediction failed for property ${property._id}`);
        return;
      }

      // Generate alerts if risk is high
      const overallRisk = parseFloat(prediction.riskAssessment.overallRiskScore);
      
      if (overallRisk >= 5) {
        await this.createAlert(property, prediction, currentWeather);
      } else {
        console.log(`✅ Property ${property._id}: No alerts needed (Risk: ${overallRisk})`);
      }

    } catch (error) {
      console.error(`Error checking weather for property ${property._id}:`, error.message);
      throw error;
    }
  }

  /**
   * Create weather alert in database
   */
  async createAlert(property, prediction, currentWeather) {
    try {
      const riskLevel = prediction.riskAssessment.riskLevel;
      const overallRisk = parseFloat(prediction.riskAssessment.overallRiskScore);

      // Check if similar alert already exists in last 6 hours
      const recentAlert = await WeatherAlert.findOne({
        property: property._id,
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      });

      if (recentAlert) {
        console.log(`ℹ️ Recent alert exists for property ${property._id}, skipping`);
        return;
      }

      // Determine primary alert type
      const risks = prediction.riskAssessment.individualRisks;
      const highestRisk = Object.entries(risks)
        .sort((a, b) => parseFloat(b[1].score) - parseFloat(a[1].score))[0];

      const alertTypeMap = {
        waterlogging: 'Heavy Rainfall Warning',
        drought: 'Drought Alert',
        heatStress: 'Heat Wave Warning',
        coldStress: 'Cold Wave Warning',
        diseaseRisk: 'High Humidity Warning',
        windDamage: 'Strong Wind Alert'
      };

      // Get top 3 recommendations
      const topRecommendations = prediction.recommendations.slice(0, 3);

      const alert = new WeatherAlert({
        farmer: property.farmer._id,
        farmerId: property.farmer.farmerId,
        property: property._id,
        alertType: alertTypeMap[highestRisk[0]] || 'Crop Damage Risk',
        severity: riskLevel,
        weatherData: {
          temperature: currentWeather.temperature,
          rainfall: currentWeather.rainfall || 0,
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windSpeed || 0,
          conditions: currentWeather.conditions
        },
        affectedCrop: property.currentCrop,
        cropStage: this.estimateGrowthStage(property),
        title: `${riskLevel} Risk: ${property.currentCrop} Crop Alert`,
        message: this.generateAlertMessage(property, prediction, highestRisk),
        riskLevel: Math.round(overallRisk),
        predictedDamage: this.mapDamageSeverity(overallRisk),
        confidenceScore: parseFloat(prediction.riskAssessment.confidenceScore),
        recommendations: topRecommendations.map(rec => ({
          action: rec.action,
          priority: rec.priority,
          timeframe: rec.timeframe
        })),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
      });

      await alert.save();

      console.log(`🚨 Alert created for ${property.farmer.farmerId} - ${alert.alertType} (${riskLevel})`);

      // Send notifications (implement later)
      await this.sendNotifications(alert, property.farmer);

    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Generate alert message
   */
  generateAlertMessage(property, prediction, highestRisk) {
    const [riskType, riskData] = highestRisk;
    const crop = property.currentCrop;
    const riskScore = riskData.score;
    const level = riskData.level;

    const messages = {
      waterlogging: `🌧️ HEAVY RAIN ALERT!\n\nYour ${crop} crop at ${property.propertyName || 'your farm'} is at ${level} risk of waterlogging.\n\n📊 Risk Score: ${riskScore}/10\n💧 Rainfall: ${riskData.factors.rainfall}\n🌱 Soil: ${riskData.factors.soilDrainage}\n\n⚠️ Immediate Action Required!`,
      
      drought: `☀️ DROUGHT WARNING!\n\nYour ${crop} crop is experiencing water stress.\n\n📊 Risk Score: ${riskScore}/10\n💧 Rainfall: ${riskData.factors.rainfall}\n🌡️ Temperature: ${riskData.factors.temperature}\n💦 Irrigation: ${riskData.factors.irrigation}\n\n⚠️ Increase watering immediately!`,
      
      heatStress: `🌡️ HEAT WAVE ALERT!\n\nDangerous heat conditions for your ${crop} crop.\n\n📊 Risk Score: ${riskScore}/10\n🌡️ Current: ${riskData.factors.temperature}\n✅ Optimal: ${riskData.factors.optimal}\n💧 Humidity: ${riskData.factors.humidity}\n\n⚠️ Provide cooling measures!`,
      
      coldStress: `❄️ COLD WAVE WARNING!\n\n${riskData.factors.frostRisk ? '🚨 FROST DANGER! 🚨' : 'Cold stress risk for your'} ${crop} crop.\n\n📊 Risk Score: ${riskScore}/10\n🌡️ Current: ${riskData.factors.temperature}\n✅ Optimal: ${riskData.factors.optimal}\n\n⚠️ ${riskData.factors.frostRisk ? 'Implement frost protection NOW!' : 'Cold protection needed!'}`,
      
      diseaseRisk: `🦠 DISEASE RISK ALERT!\n\nHigh risk of fungal diseases for your ${crop} crop.\n\n📊 Risk Score: ${riskScore}/10\n💧 Humidity: ${riskData.factors.humidity}\n🌧️ Rainfall: ${riskData.factors.rainfall}\n⚠️ ${riskData.factors.conditions}\n\n⚠️ Monitor for disease symptoms!`,
      
      windDamage: `💨 STRONG WIND ALERT!\n\nHigh winds may damage your ${crop} crop.\n\n📊 Risk Score: ${riskScore}/10\n💨 Wind Speed: ${riskData.factors.windSpeed}\n🌱 Vulnerability: ${riskData.factors.vulnerability}\n\n⚠️ Provide structural support!`
    };

    return messages[riskType] || `Weather alert for your ${crop} crop. Risk level: ${level} (${riskScore}/10)`;
  }

  /**
   * Map risk score to damage severity
   */
  mapDamageSeverity(riskScore) {
    if (riskScore >= 8) return 'Severe';
    if (riskScore >= 6) return 'Moderate';
    if (riskScore >= 4) return 'Minor';
    return 'None';
  }

  /**
   * Estimate growth stage based on property creation date
   * (In real app, this should be tracked properly)
   */
  estimateGrowthStage(property) {
    if (!property.createdAt) return 'vegetative';
    
    const daysOld = Math.floor((Date.now() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simple estimation (should be crop-specific)
    if (daysOld < 30) return 'germination';
    if (daysOld < 60) return 'vegetative';
    if (daysOld < 90) return 'flowering';
    return 'maturity';
  }

  /**
   * Send notifications (placeholder for now)
   */
  async sendNotifications(alert, farmer) {
    try {
      // TODO: Implement email, SMS, push notifications
      console.log(`📧 Notification sent to ${farmer.email}`);
      
      // Mark notification as sent
      alert.notifications.inApp.sent = true;
      alert.notifications.inApp.sentAt = new Date();
      await alert.save();

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  /**
   * Manual check for a specific property (called from API)
   */
  async checkPropertyNow(propertyId) {
    try {
      const property = await Property.findById(propertyId)
        .populate('farmer', 'farmerId email mobile preferredLanguage');

      if (!property) {
        throw new Error('Property not found');
      }

      await this.checkPropertyWeather(property);
      
      return {
        success: true,
        message: 'Weather check completed for property'
      };
    } catch (error) {
      console.error('Error in manual property check:', error);
      throw error;
    }
  }

  /**
   * Get active alerts for a farmer
   */
  async getActiveAlerts(farmerId) {
    try {
      const alerts = await WeatherAlert.find({
        farmerId,
        isActive: true,
        validUntil: { $gte: new Date() }
      })
      .populate('property', 'propertyName currentCrop area')
      .sort({ severity: 1, createdAt: -1 });

      // Map severity to priority
      const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertRead(alertId) {
    try {
      const alert = await WeatherAlert.findByIdAndUpdate(
        alertId,
        { isRead: true },
        { new: true }
      );
      return alert;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  /**
   * Mark alert as acknowledged
   */
  async acknowledgeAlert(alertId) {
    try {
      const alert = await WeatherAlert.findByIdAndUpdate(
        alertId,
        { 
          isAcknowledged: true,
          acknowledgedAt: new Date()
        },
        { new: true }
      );
      return alert;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Deactivate expired alerts
   */
  async cleanupExpiredAlerts() {
    try {
      const result = await WeatherAlert.updateMany(
        {
          isActive: true,
          validUntil: { $lt: new Date() }
        },
        {
          isActive: false
        }
      );

      console.log(`🧹 Deactivated ${result.modifiedCount} expired alerts`);
      return result;
    } catch (error) {
      console.error('Error cleaning up alerts:', error);
      throw error;
    }
  }
}

// Create singleton instance
const weatherAlertService = new WeatherAlertService();

module.exports = weatherAlertService;
