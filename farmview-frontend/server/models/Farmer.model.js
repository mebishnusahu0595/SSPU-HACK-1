const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  // Unique Farmer ID
  farmerId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  
  // Additional Information
  address: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },
  
  // Language Preference
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'mr', 'te', 'ta', 'kn', 'gu', 'bn', 'pa'],
    default: 'en'
  },
  
  // Profile
  profilePicture: {
    type: String,
    default: null
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
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

// Generate unique Farmer ID and hash password before saving
farmerSchema.pre('save', async function(next) {
  try {
    // Generate farmerId if not exists
    if (!this.farmerId) {
      const count = await mongoose.model('Farmer').countDocuments();
      const year = new Date().getFullYear();
      this.farmerId = `FV${year}${String(count + 1).padStart(6, '0')}`;
    }
    
    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
farmerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update lastLogin
farmerSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('Farmer', farmerSchema);
