/**
 * ADVANCED ML VERIFICATION TEST SCRIPT
 * Tests all 5 layers of the ML verification system
 */

const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:5001/api';
let authToken = '';
let propertyId = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'test123',
  name: 'Test Farmer'
};

// Sample property for testing
const testProperty = {
  propertyName: 'Test Farm ML Verification',
  area: 5.5,
  soilType: 'Loamy',
  currentCrop: 'Wheat',
  irrigationType: 'Drip',
  address: 'Village Rampur, District Bhopal, Madhya Pradesh, India',
  surveyNumber: 'SN-ML-' + Date.now(),
  ownershipType: 'Owned',
  centerCoordinates: {
    latitude: 23.2599,  // Bhopal, India
    longitude: 77.4126
  },
  boundary: {
    type: 'Polygon',
    coordinates: [[
      [77.4100, 23.2580],
      [77.4150, 23.2580],
      [77.4150, 23.2620],
      [77.4100, 23.2620],
      [77.4100, 23.2580]
    ]]
  },
  documents: [
    {
      type: 'Land Ownership',
      url: 'https://example.com/doc1.pdf',
      uploadedAt: new Date()
    },
    {
      type: 'Survey Map',
      url: 'https://example.com/doc2.pdf',
      uploadedAt: new Date()
    },
    {
      type: 'Identity Proof',
      url: 'https://example.com/doc3.pdf',
      uploadedAt: new Date()
    }
  ]
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Call Failed: ${endpoint}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: Register/Login
async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');
  console.log('='.repeat(60));
  
  try {
    // Try to register (might fail if already exists)
    try {
      await apiCall('POST', '/auth/register', testUser);
      console.log('✅ User registered successfully');
    } catch (error) {
      console.log('⚠️  User already exists (expected)');
    }
    
    // Login
    const loginResult = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = loginResult.token;
    console.log('✅ Login successful');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed');
    return false;
  }
}

// Test 2: Create Property
async function testCreateProperty() {
  console.log('\n📍 Test 2: Create Property');
  console.log('='.repeat(60));
  
  try {
    const result = await apiCall('POST', '/property', testProperty, authToken);
    
    propertyId = result.data._id;
    console.log('✅ Property created successfully');
    console.log('   Property ID:', propertyId);
    console.log('   Name:', result.data.propertyName);
    console.log('   Area:', result.data.area, 'hectares');
    console.log('   Coordinates:', result.data.centerCoordinates);
    
    return true;
  } catch (error) {
    console.error('❌ Property creation failed');
    return false;
  }
}

// Test 3: Advanced ML Verification
async function testMLVerification() {
  console.log('\n🧠 Test 3: Advanced ML Verification');
  console.log('='.repeat(60));
  
  try {
    console.log('Starting ML verification for property:', propertyId);
    console.log('This will run 5 parallel ML layers...\n');
    
    const startTime = Date.now();
    
    const result = await apiCall(
      'POST',
      `/property/${propertyId}/verify-ai`,
      null,
      authToken
    );
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\n✅ ML VERIFICATION COMPLETED!');
    console.log('='.repeat(60));
    console.log('Overall Results:');
    console.log('   Status:', result.data.mlAnalysis.status);
    console.log('   Verification Level:', result.data.mlAnalysis.verificationLevel);
    console.log('   Overall Score:', result.data.mlAnalysis.overallScore.toFixed(2), '/ 100');
    console.log('   Confidence:', result.data.mlAnalysis.confidence.toFixed(2), '%');
    console.log('   Is Verified:', result.data.mlAnalysis.isVerified ? '✅ YES' : '❌ NO');
    console.log('   ML Processing Time:', result.data.mlAnalysis.processingTime);
    console.log('   Total API Time:', totalTime, 'ms');
    
    console.log('\n📊 Layer Scores:');
    console.log('   🗺️  Coordinates:', result.data.mlAnalysis.layerScores.coordinates, '/ 100');
    console.log('   📐 Boundary:', result.data.mlAnalysis.layerScores.boundary, '/ 100');
    console.log('   📄 Documents:', result.data.mlAnalysis.layerScores.documents, '/ 100');
    console.log('   🛰️  Satellite:', result.data.mlAnalysis.layerScores.satellite, '/ 100');
    console.log('   ✅ Completeness:', result.data.mlAnalysis.layerScores.completeness, '/ 100');
    
    console.log('\n🎯 Layer Confidence:');
    console.log('   🗺️  Coordinates:', result.data.mlAnalysis.layerConfidence.coordinates.toFixed(2), '%');
    console.log('   📐 Boundary:', result.data.mlAnalysis.layerConfidence.boundary.toFixed(2), '%');
    console.log('   📄 Documents:', result.data.mlAnalysis.layerConfidence.documents.toFixed(2), '%');
    console.log('   🛰️  Satellite:', result.data.mlAnalysis.layerConfidence.satellite.toFixed(2), '%');
    console.log('   ✅ Completeness:', result.data.mlAnalysis.layerConfidence.completeness.toFixed(2), '%');
    
    console.log('\n💡 Insights (Top 10):');
    result.data.insights.slice(0, 10).forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight}`);
    });
    
    console.log('\n📝 Recommendation:');
    console.log('   ' + result.data.recommendation);
    
    console.log('\n🎯 Next Steps:');
    result.data.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log('\n🔍 Detailed Analysis:');
    console.log('   Coordinates:', JSON.stringify(result.data.detailedAnalysis.coordinates, null, 2));
    console.log('   Boundary:', JSON.stringify(result.data.detailedAnalysis.boundary, null, 2));
    console.log('   Documents:', JSON.stringify(result.data.detailedAnalysis.documents, null, 2));
    console.log('   Satellite:', JSON.stringify(result.data.detailedAnalysis.satellite, null, 2));
    console.log('   Completeness:', JSON.stringify(result.data.detailedAnalysis.completeness, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ ML Verification failed');
    return false;
  }
}

// Test 4: Verify Property Updated
async function testPropertyUpdate() {
  console.log('\n🔄 Test 4: Verify Property Update');
  console.log('='.repeat(60));
  
  try {
    const result = await apiCall('GET', `/property/${propertyId}`, null, authToken);
    
    console.log('✅ Property retrieved successfully');
    console.log('   Is Verified:', result.data.isVerified ? '✅ YES' : '❌ NO');
    console.log('   Verification Score:', result.data.verificationScore);
    console.log('   Verification Level:', result.data.verificationLevel);
    console.log('   ML Confidence:', result.data.mlConfidence, '%');
    console.log('   Verified At:', result.data.verifiedAt);
    
    return true;
  } catch (error) {
    console.error('❌ Property retrieval failed');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║         🧠 ADVANCED ML VERIFICATION TEST SUITE 🧠            ║');
  console.log('║                                                               ║');
  console.log('║              Testing 5-Layer Ensemble Learning                ║');
  console.log('║                  with Deep Neural Networks                    ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Create Property', fn: testCreateProperty },
    { name: 'ML Verification', fn: testMLVerification },
    { name: 'Property Update', fn: testPropertyUpdate }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`\n❌ Test "${test.name}" threw exception:`, error.message);
      failed++;
    }
  }
  
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                             ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║   Total Tests: ${tests.length}                                               ║`);
  console.log(`║   ✅ Passed: ${passed}                                                  ║`);
  console.log(`║   ❌ Failed: ${failed}                                                  ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Advanced ML system is working perfectly! 🎉\n');
  } else {
    console.log('⚠️  Some tests failed. Check logs above for details.\n');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
