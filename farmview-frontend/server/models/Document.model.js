const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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
  
  // Document Information
  documentType: {
    type: String,
    enum: [
      'PAN Card',
      'Aadhaar Card',
      'Land Documents',
      '7/12 Extract',
      'Insurance Policy',
      'Bank Passbook',
      'Ration Card',
      'Voter ID',
      'Driving License',
      'Passport',
      'Other'
    ],
    required: true
  },
  documentName: {
    type: String,
    required: true,
    trim: true
  },
  documentNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // File Information (MongoDB GridFS)
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  
  // Metadata
  category: {
    type: String,
    enum: ['Personal', 'Property', 'Insurance', 'Banking', 'Government', 'Other'],
    default: 'Other'
  },
  tags: [String],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  verificationRemarks: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'auto-verified'],
    default: 'pending'
  },
  verificationScore: Number,
  verificationMethod: {
    type: String,
    enum: ['manual', 'ocr-ai', 'digilocker'],
    default: 'manual'
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  },
  ocrConfidence: Number,
  
  // Expiry (for time-sensitive documents)
  expiryDate: Date,
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Archived', 'Pending Verification'],
    default: 'Active'
  },
  
  // DigiLocker Integration
  isFromDigilocker: {
    type: Boolean,
    default: false
  },
  digilockerUri: String,
  
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

// Check for expired documents
documentSchema.methods.checkExpiry = function() {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'Expired';
    return true;
  }
  return false;
};

module.exports = mongoose.model('Document', documentSchema);
