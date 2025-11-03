const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  
  // Alert Information
  alertType: {
    type: String,
    enum: [
      'Heavy Rainfall Warning',
      'Drought Alert',
      'Heat Wave Warning',
      'Cold Wave Warning',
      'Frost Alert',
      'High Humidity Warning',
      'Strong Wind Alert',
      'Hailstorm Warning',
      'Crop Damage Risk'
    ],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Weather Data
  weatherData: {
    temperature: Number,
    rainfall: Number,
    humidity: Number,
    windSpeed: Number,
    conditions: String
  },
  
  // Crop Impact
  affectedCrop: {
    type: String,
    required: true
  },
  cropStage: String,
  
  // Alert Details
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  riskLevel: {
    type: Number, // 1-10 scale
    min: 1,
    max: 10,
    default: 5
  },
  
  // Predicted Impact
  predictedDamage: {
    type: String,
    enum: ['None', 'Minor', 'Moderate', 'Severe', 'Critical']
  },
  confidenceScore: {
    type: Number, // 0-1 scale (ML model confidence)
    default: 0.5
  },
  
  // Recommendations
  recommendations: [{
    action: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent']
    },
    timeframe: String
  }],
  
  // Alert Status
  isRead: {
    type: Boolean,
    default: false
  },
  isAcknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  
  // Alert Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Notification Status
  notifications: {
    inApp: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick queries
weatherAlertSchema.index({ farmer: 1, isActive: 1, createdAt: -1 });
weatherAlertSchema.index({ property: 1, alertType: 1 });

// Auto-deactivate expired alerts
weatherAlertSchema.methods.checkExpiry = function() {
  if (this.validUntil < new Date()) {
    this.isActive = false;
    return true;
  }
  return false;
};

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);
