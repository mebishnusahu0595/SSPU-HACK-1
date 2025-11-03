const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'property_added',
      'property_updated',
      'document_uploaded',
      'document_verified',
      'insurance_applied',
      'claim_submitted',
      'claim_approved',
      'claim_rejected',
      'todo_created',
      'todo_completed',
      'weather_checked',
      'satellite_viewed',
      'crop_recommended'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  icon: {
    type: String,
    default: '📋'
  }
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ farmer: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
