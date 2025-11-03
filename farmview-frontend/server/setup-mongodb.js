/**
 * FarmView AI - MongoDB Database Initialization Script
 * Creates collections and indexes for the FarmView platform
 */

const mongoose = require('mongoose');

// MongoDB Connection - Local MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/farmview_ai';

console.log('=' .repeat(60));
console.log('🌾 FarmView AI - MongoDB Database Setup');
console.log('='.repeat(60));

async function connectToMongoDB() {
  try {
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function createCollections(db) {
  console.log('\n📦 Creating collections...');
  const collections = [
    'farmers',
    'properties',
    'documents',
    'insurances',
    'weatheralerts',
    'cropweathers'
  ];
  
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);
  
  for (const collectionName of collections) {
    if (existingNames.includes(collectionName)) {
      console.log(`   ℹ️  Collection already exists: ${collectionName}`);
    } else {
      await db.createCollection(collectionName);
      console.log(`   ✅ Created collection: ${collectionName}`);
    }
  }
}

async function createIndexes(db) {
  console.log('\n🔍 Creating indexes...');
  
  // Farmers collection indexes
  await db.collection('farmers').createIndex({ farmerId: 1 }, { unique: true });
  await db.collection('farmers').createIndex({ email: 1 }, { unique: true });
  await db.collection('farmers').createIndex({ mobile: 1 }, { unique: true });
  console.log('   ✅ Farmers indexes created');
  
  // Properties collection indexes
  await db.collection('properties').createIndex({ farmer: 1 });
  await db.collection('properties').createIndex({ farmerId: 1 });
  await db.collection('properties').createIndex({ currentCrop: 1 });
  await db.collection('properties').createIndex({ location: '2dsphere' });
  console.log('   ✅ Properties indexes created');
  
  // Documents collection indexes
  await db.collection('documents').createIndex({ farmer: 1 });
  await db.collection('documents').createIndex({ documentType: 1 });
  console.log('   ✅ Documents indexes created');
  
  // Insurance collection indexes
  await db.collection('insurances').createIndex({ farmer: 1 });
  await db.collection('insurances').createIndex({ property: 1 });
  await db.collection('insurances').createIndex({ policyNumber: 1 }, { unique: true });
  console.log('   ✅ Insurance indexes created');
  
  // Weather Alerts collection indexes
  await db.collection('weatheralerts').createIndex({ farmer: 1 });
  await db.collection('weatheralerts').createIndex({ farmerId: 1 });
  await db.collection('weatheralerts').createIndex({ property: 1 });
  await db.collection('weatheralerts').createIndex({ isActive: 1 });
  await db.collection('weatheralerts').createIndex({ createdAt: -1 });
  console.log('   ✅ Weather Alerts indexes created');
  
  // Crop Weather collection indexes
  await db.collection('cropweathers').createIndex({ cropName: 1 });
  console.log('   ✅ Crop Weather indexes created');
}

async function seedCropData(db) {
  console.log('\n🌾 Seeding crop weather data...');
  
  const cropsData = [
    {
      cropName: 'Wheat',
      thresholds: {
        temperature: { min: 10, max: 40, optimal_min: 15, optimal_max: 25 },
        rainfall: { min_daily: 2, max_daily: 50, max_weekly: 150, optimal_daily: 4 },
        humidity: { min: 30, max: 90, optimal_min: 50, optimal_max: 70 },
        windSpeed: { max: 40, critical: 60 }
      },
      bestSeasons: ['Rabi'],
      damagePatterns: [
        {
          weatherCondition: 'Heavy Rain',
          description: 'Waterlogging damage to roots, fungal diseases',
          severity: 'High',
          preventiveMeasures: ['Improve drainage', 'Apply fungicide', 'Avoid irrigation']
        },
        {
          weatherCondition: 'Cold Wave',
          description: 'Frost damage to leaves and stems',
          severity: 'Critical',
          preventiveMeasures: ['Light irrigation', 'Smoke generation', 'Frost covers']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Rice',
      thresholds: {
        temperature: { min: 15, max: 42, optimal_min: 20, optimal_max: 35 },
        rainfall: { min_daily: 5, max_daily: 100, max_weekly: 300, optimal_daily: 12 },
        humidity: { min: 40, max: 95, optimal_min: 60, optimal_max: 80 },
        windSpeed: { max: 45, critical: 70 }
      },
      bestSeasons: ['Kharif'],
      damagePatterns: [
        {
          weatherCondition: 'Drought',
          description: 'Water stress leading to poor grain filling',
          severity: 'Critical',
          preventiveMeasures: ['Increase irrigation', 'Mulching', 'Drought-tolerant varieties']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Cotton',
      thresholds: {
        temperature: { min: 15, max: 45, optimal_min: 21, optimal_max: 35 },
        rainfall: { min_daily: 3, max_daily: 60, max_weekly: 180, optimal_daily: 6 },
        humidity: { min: 30, max: 85, optimal_min: 50, optimal_max: 70 },
        windSpeed: { max: 40, critical: 60 }
      },
      bestSeasons: ['Kharif'],
      damagePatterns: [
        {
          weatherCondition: 'High Humidity',
          description: 'Fungal diseases like boll rot',
          severity: 'High',
          preventiveMeasures: ['Fungicide spray', 'Proper spacing', 'Pruning']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Maize',
      thresholds: {
        temperature: { min: 12, max: 40, optimal_min: 18, optimal_max: 32 },
        rainfall: { min_daily: 3, max_daily: 55, max_weekly: 170, optimal_daily: 7 },
        humidity: { min: 35, max: 90, optimal_min: 55, optimal_max: 75 },
        windSpeed: { max: 45, critical: 65 }
      },
      bestSeasons: ['Kharif', 'Rabi'],
      damagePatterns: [
        {
          weatherCondition: 'Strong Wind',
          description: 'Lodging (falling) of tall plants',
          severity: 'Medium',
          preventiveMeasures: ['Staking', 'Wind breaks', 'Proper spacing']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Tomato',
      thresholds: {
        temperature: { min: 10, max: 38, optimal_min: 18, optimal_max: 27 },
        rainfall: { min_daily: 2, max_daily: 40, max_weekly: 120, optimal_daily: 5 },
        humidity: { min: 30, max: 85, optimal_min: 50, optimal_max: 70 },
        windSpeed: { max: 35, critical: 55 }
      },
      bestSeasons: ['Rabi', 'Zaid'],
      damagePatterns: [
        {
          weatherCondition: 'Heat Wave',
          description: 'Flower drop, poor fruit setting',
          severity: 'Critical',
          preventiveMeasures: ['Shade nets', 'Mulching', 'Frequent irrigation']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Potato',
      thresholds: {
        temperature: { min: 8, max: 35, optimal_min: 15, optimal_max: 25 },
        rainfall: { min_daily: 2, max_daily: 45, max_weekly: 140, optimal_daily: 5 },
        humidity: { min: 35, max: 90, optimal_min: 60, optimal_max: 75 },
        windSpeed: { max: 40, critical: 60 }
      },
      bestSeasons: ['Rabi'],
      damagePatterns: [
        {
          weatherCondition: 'Heavy Rain',
          description: 'Waterlogging, tuber rot',
          severity: 'High',
          preventiveMeasures: ['Improve drainage', 'Ridge planting', 'Avoid irrigation']
        }
      ],
      createdAt: new Date()
    },
    {
      cropName: 'Sugarcane',
      thresholds: {
        temperature: { min: 15, max: 40, optimal_min: 20, optimal_max: 30 },
        rainfall: { min_daily: 5, max_daily: 70, max_weekly: 220, optimal_daily: 10 },
        humidity: { min: 40, max: 90, optimal_min: 60, optimal_max: 80 },
        windSpeed: { max: 50, critical: 70 }
      },
      bestSeasons: ['Kharif'],
      damagePatterns: [
        {
          weatherCondition: 'Cold Wave',
          description: 'Growth retardation, reduced sugar content',
          severity: 'Medium',
          preventiveMeasures: ['Trash mulching', 'Avoid irrigation with cold water']
        }
      ],
      createdAt: new Date()
    }
  ];
  
  // Insert or update crop data
  for (const crop of cropsData) {
    const result = await db.collection('cropweathers').updateOne(
      { cropName: crop.cropName },
      { $set: crop },
      { upsert: true }
    );
    
    if (result.upsertedId) {
      console.log(`   ✅ Added crop data: ${crop.cropName}`);
    } else {
      console.log(`   ℹ️  Updated crop data: ${crop.cropName}`);
    }
  }
}

async function displayStats(db) {
  console.log('\n📊 Database Statistics:');
  console.log(`   Database: ${db.databaseName}`);
  
  const collections = ['farmers', 'properties', 'documents', 'insurances', 'weatheralerts', 'cropweathers'];
  for (const collectionName of collections) {
    const count = await db.collection(collectionName).countDocuments();
    console.log(`   📦 ${collectionName}: ${count} documents`);
  }
}

async function main() {
  try {
    const db = await connectToMongoDB();
    await createCollections(db);
    await createIndexes(db);
    await seedCropData(db);
    await displayStats(db);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('   1. Start your backend server: npm start');
    console.log('   2. Start your frontend: cd ../client && npm run dev');
    console.log('   3. Register farmers and add properties through the website');
    console.log('   4. Data will be automatically stored in MongoDB Atlas');
    console.log('\n🔗 MongoDB Atlas Dashboard:');
    console.log('   https://cloud.mongodb.com/');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
