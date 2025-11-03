const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Serve static files (heatmaps, satellite images)
app.use('/heatmaps', express.static(path.join(__dirname, 'public/heatmaps')));

// Rate limiting - Increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
})
.then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const farmerRoutes = require('./routes/farmer.routes');
const documentRoutes = require('./routes/document.routes');
const weatherRoutes = require('./routes/weather.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const digilockerRoutes = require('./routes/digilocker.routes');
const propertyRoutes = require('./routes/property.routes');
const alertsRoutes = require('./routes/alerts.routes');
const satelliteRoutes = require('./routes/satellite.routes');
const claimRoutes = require('./routes/claim.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const geoaiRoutes = require('./routes/geoai.routes');
const cropRoutes = require('./routes/crop.routes');
const todoRoutes = require('./routes/todo.routes');
const activityRoutes = require('./routes/activity.routes');

// Import Services
const weatherAlertService = require('./services/weatherAlertService');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/digilocker', digilockerRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geoai', geoaiRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/activity', activityRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FarmView Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'FarmView AI Backend API',
    version: '1.0.0',
    features: {
      ml: 'Advanced ML-based Crop Damage Prediction',
      weather: 'Real-time Weather Monitoring',
      alerts: 'Automated Weather Alerts System',
      satellite: 'Sentinel Hub Satellite Imagery & NDVI',
      geoai: 'Gemini AI-powered Crop Intelligence & Recommendations'
    },
    endpoints: {
      auth: '/api/auth',
      farmer: '/api/farmer',
      documents: '/api/documents',
      weather: '/api/weather',
      insurance: '/api/insurance',
      digilocker: '/api/digilocker',
      property: '/api/property',
      alerts: '/api/alerts',
      satellite: '/api/satellite',
      geoai: '/api/geoai'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  
  // Start Weather Alert Service
  console.log('\n🤖 Starting ML-powered Weather Alert System...');
  weatherAlertService.start();
  console.log('✅ Weather monitoring active - checking properties every 6 hours');
  console.log('🌤️ Automatic weather fetch enabled when farmers add land\n');
});

module.exports = app;
