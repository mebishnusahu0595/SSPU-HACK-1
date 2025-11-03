const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
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
    ref: 'Property'
  },
  
  // Insurance Details
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  policyType: {
    type: String,
    enum: [
      'Crop Insurance',
      'Weather-Based Insurance',
      'Livestock Insurance',
      'Farm Equipment Insurance',
      'Multi-Peril Crop Insurance',
      'Other'
    ],
    required: true
  },
  provider: {
    name: {
      type: String,
      required: true
    },
    contactNumber: String,
    email: String
  },
  
  // Coverage Information
  coverageAmount: {
    type: Number,
    required: true
  },
  premium: {
    amount: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['Annual', 'Semi-Annual', 'Quarterly', 'One-Time'],
      default: 'Annual'
    }
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Claims
  claims: [{
    claimNumber: {
      type: String,
      required: true,
      unique: true
    },
    claimDate: {
      type: Date,
      default: Date.now
    },
    damageType: {
      type: String,
      enum: ['Flood', 'Drought', 'Pest', 'Disease', 'Hail', 'Fire', 'Other']
    },
    damageDescription: String,
    estimatedLoss: Number,
    claimAmount: Number,
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'],
      default: 'Submitted'
    },
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }],
    reviewNotes: String,
    paymentDate: Date,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Policy Documents
  policyDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled', 'Pending'],
    default: 'Pending'
  },
  
  // Auto-renewal
  autoRenewal: {
    type: Boolean,
    default: false
  },
  
  // Notes
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if policy is expired
insuranceSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

// Generate unique claim number
insuranceSchema.methods.generateClaimNumber = function() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CLM${year}${randomNum}${this.farmerId.slice(-4)}`;
};

module.exports = mongoose.model('Insurance', insuranceSchema);
