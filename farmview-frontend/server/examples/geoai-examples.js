/**
 * GeoAI API Examples & Testing
 * Demonstrates how to use Gemini AI for crop intelligence
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Example auth token (you need to login first)
// Replace with actual token from login
const TEST_TOKEN = 'your_jwt_token_here';

// Example property ID (replace with your actual property ID)
const PROPERTY_ID = 'your_property_id_here';

/**
 * Example 1: Comprehensive Crop Analysis
 * Analyzes crop health, identifies crop type, detects issues
 */
async function analyzeCrop() {
  console.log('\n🌾 === EXAMPLE 1: Comprehensive Crop Analysis ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/analyze-crop`,
      {
        propertyId: PROPERTY_ID,
        includeImage: true,
        weatherData: {
          temperature: 28,
          humidity: 65,
          rainfall: 120,
          windSpeed: 12
        },
        soilData: {
          type: 'Loamy',
          pH: 6.5,
          nitrogen: 'Medium',
          phosphorus: 'High',
          potassium: 'Medium'
        },
        previousCrop: 'Rice',
        cropStage: 'Vegetative'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    console.log('✅ Analysis Result:');
    console.log(JSON.stringify(response.data, null, 2));

    const { analysis, ndviSummary } = response.data;

    console.log('\n📊 Key Insights:');
    console.log(`- Likely Crop: ${analysis.cropIdentification?.likelyCrop}`);
    console.log(`- Confidence: ${analysis.cropIdentification?.confidence}%`);
    console.log(`- Health Status: ${analysis.healthAssessment?.overallHealth}`);
    console.log(`- Health Score: ${analysis.healthAssessment?.healthScore}/100`);
    console.log(`- NDVI Mean: ${ndviSummary.mean?.toFixed(3)}`);
    console.log(`- Healthy Area: ${ndviSummary.healthyPercentage?.toFixed(1)}%`);

    if (analysis.detectedIssues?.length > 0) {
      console.log('\n⚠️ Detected Issues:');
      analysis.detectedIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.issue} (${issue.severity})`);
        console.log(`     Action: ${issue.recommendation}`);
      });
    }

    if (analysis.cropRecommendation) {
      console.log('\n💡 Next Crop Recommendation:');
      console.log(`- Crop: ${analysis.cropRecommendation.nextCrop}`);
      console.log(`- Reason: ${analysis.cropRecommendation.reasoning}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example 2: Crop Type Identification
 * Uses satellite imagery + NDVI to identify crop
 */
async function identifyCrop() {
  console.log('\n🔍 === EXAMPLE 2: Crop Type Identification ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/identify-crop`,
      {
        propertyId: PROPERTY_ID,
        seasonData: 'Kharif season (June-October)'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    const { identification } = response.data;

    console.log('✅ Crop Identified:');
    console.log(`\n🌾 Primary Crop: ${identification.cropType}`);
    console.log(`📊 Confidence: ${identification.confidence}%`);
    console.log(`\n📝 Reasoning:\n${identification.reasoning}`);

    if (identification.alternativeCrops?.length > 0) {
      console.log(`\n🔄 Alternative Possibilities:`);
      identification.alternativeCrops.forEach((crop, i) => {
        console.log(`  ${i + 1}. ${crop}`);
      });
    }

    console.log('\n🔬 Crop Characteristics:');
    console.log(`- Pattern: ${identification.cropCharacteristics?.pattern}`);
    console.log(`- NDVI Signature: ${identification.cropCharacteristics?.ndviSignature}`);
    console.log(`- Seasonal Match: ${identification.cropCharacteristics?.seasonalMatch}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example 3: Crop Recommendation for Next Season
 * Suggests best crop based on soil, weather, NDVI history
 */
async function recommendCrop() {
  console.log('\n💡 === EXAMPLE 3: Next Crop Recommendation ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/recommend-crop`,
      {
        propertyId: PROPERTY_ID,
        currentCrop: 'Wheat',
        weatherHistory: {
          averageTemp: 25,
          totalRainfall: 450,
          sunnyDays: 180,
          extremeEvents: ['heatwave in May']
        },
        marketData: {
          demandCrops: ['Pulses', 'Oilseeds', 'Vegetables'],
          priceTrends: {
            pulses: 'increasing',
            rice: 'stable',
            wheat: 'decreasing'
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    const { recommendation } = response.data;
    const primary = recommendation.primaryRecommendation;

    console.log('✅ Primary Recommendation:');
    console.log(`\n🌱 Crop: ${primary.cropName}`);
    console.log(`📊 Confidence: ${primary.confidence}%`);
    console.log(`📈 Expected Yield: ${primary.expectedYield}`);
    console.log(`💰 Profitability: ${primary.profitability}`);
    console.log(`\n📝 Reasoning:\n${primary.reasoning}`);

    if (recommendation.alternativeOptions?.length > 0) {
      console.log('\n🔄 Alternative Options:');
      recommendation.alternativeOptions.forEach((alt, i) => {
        console.log(`\n  ${i + 1}. ${alt.cropName} (${alt.confidence}% confidence)`);
        console.log(`     Pros: ${alt.pros?.join(', ')}`);
        console.log(`     Cons: ${alt.cons?.join(', ')}`);
      });
    }

    console.log('\n🚜 Soil Preparation Steps:');
    recommendation.soilPreparation?.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n⚠️ Risk Factors:');
    recommendation.riskFactors?.forEach((risk, i) => {
      console.log(`  - ${risk}`);
    });

    console.log(`\n💵 Estimated ROI: ${recommendation.estimatedROI}`);
    console.log(`💧 Water Requirement: ${recommendation.waterRequirement}`);
    console.log(`📅 Best Planting Time: ${recommendation.seasonalTiming}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example 4: Detect Crop Health Issues
 * Identifies pests, diseases, drought, nutrient deficiency
 */
async function detectIssues() {
  console.log('\n🔬 === EXAMPLE 4: Crop Health Issue Detection ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/detect-issues`,
      {
        propertyId: PROPERTY_ID,
        cropType: 'Rice',
        cropStage: 'Flowering',
        weatherData: {
          recentRainfall: 200,
          temperature: 32,
          humidity: 85,
          consecutiveDryDays: 5
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    const { issueDetection } = response.data;

    console.log(`✅ Health Status: ${issueDetection.healthStatus}`);
    console.log(`📊 Overall Score: ${issueDetection.overallScore}/100`);

    if (issueDetection.detectedIssues?.length > 0) {
      console.log('\n⚠️ Detected Issues:\n');
      
      issueDetection.detectedIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.type} (${issue.severity} severity)`);
        console.log(`   Confidence: ${issue.confidence}%`);
        console.log(`   Affected Area: ${issue.affectedArea}`);
        console.log(`   Location: ${issue.location}`);
        console.log(`   Urgency: ${issue.urgency}`);
        console.log(`   Symptoms:`);
        issue.symptoms?.forEach(symptom => {
          console.log(`     - ${symptom}`);
        });
        console.log('');
      });

      console.log('📋 Recommended Actions:\n');
      issueDetection.recommendations?.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.action}`);
        console.log(`   Priority: ${rec.priority}`);
        console.log(`   Timing: ${rec.timing}`);
        console.log(`   Cost: ${rec.expectedCost}`);
        console.log(`   Benefit: ${rec.expectedBenefit}\n`);
      });
    } else {
      console.log('\n✅ No critical issues detected!');
    }

    console.log('🛡️ Preventive Measures:');
    issueDetection.preventiveMeasures?.forEach(measure => {
      console.log(`  - ${measure}`);
    });

    console.log(`\n📉 Potential Yield Impact: ${issueDetection.yieldImpact}`);
    console.log(`👁️ Monitoring Advice: ${issueDetection.monitoringAdvice}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example 5: Yield Prediction
 * Predicts final crop yield based on NDVI trends
 */
async function predictYield() {
  console.log('\n📊 === EXAMPLE 5: Crop Yield Prediction ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/predict-yield`,
      {
        propertyId: PROPERTY_ID,
        cropType: 'Wheat',
        cropStage: 'Grain Filling',
        weatherData: {
          growingSeasonTemp: 22,
          totalRainfall: 380,
          sunlightHours: 2100
        },
        soilData: {
          fertility: 'Good',
          organic_matter: 'High',
          drainage: 'Adequate'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    const { yieldPrediction } = response.data;
    const prediction = yieldPrediction.predictedYield;

    console.log('✅ Yield Prediction:');
    console.log(`\n🌾 Expected Yield: ${prediction.amount}`);
    console.log(`📊 Per Hectare: ${prediction.perHectare}`);
    console.log(`📈 Confidence Range: ${prediction.confidenceInterval}`);
    console.log(`🎯 Confidence Level: ${yieldPrediction.confidenceLevel}%`);

    console.log('\n✅ Positive Factors:');
    yieldPrediction.factors?.positive?.forEach(factor => {
      console.log(`  + ${factor}`);
    });

    console.log('\n⚠️ Negative Factors:');
    yieldPrediction.factors?.negative?.forEach(factor => {
      console.log(`  - ${factor}`);
    });

    console.log('\n📊 Comparison:');
    console.log(`  vs Average: ${yieldPrediction.comparison?.vsAverage}`);
    console.log(`  vs Potential: ${yieldPrediction.comparison?.vsPotential}`);
    console.log(`  vs Last Year: ${yieldPrediction.comparison?.vsLastYear}`);

    console.log(`\n📅 Optimal Harvest: ${yieldPrediction.harvestTiming}`);
    console.log(`🏆 Quality Expectation: ${yieldPrediction.qualityExpectation}`);

    console.log('\n💡 Improvement Tips:');
    yieldPrediction.improvements?.forEach((tip, i) => {
      console.log(`  ${i + 1}. ${tip}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example 6: Get Practical Farming Advice
 * Simplified advice for farmers
 */
async function getFarmingAdvice() {
  console.log('\n💬 === EXAMPLE 6: Practical Farming Advice ===\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/geoai/farming-advice`,
      {
        cropType: 'Rice',
        issues: [
          { type: 'Brown spot disease', severity: 'Medium' },
          { type: 'Low NDVI in corner', severity: 'Low' }
        ],
        season: 'Kharif',
        location: 'Punjab',
        farmerExperience: 'intermediate'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );

    const { advice } = response.data;

    console.log('✅ Farming Advice:\n');

    if (advice.urgentActions?.length > 0) {
      console.log('🚨 URGENT ACTIONS:');
      advice.urgentActions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
      console.log('');
    }

    console.log('📅 Weekly Tasks:');
    advice.weeklyTasks?.forEach((task, i) => {
      console.log(`  ${i + 1}. ${task}`);
    });

    console.log('\n👁️ What to Monitor:');
    advice.monitoring?.forEach((item, i) => {
      console.log(`  - ${item}`);
    });

    console.log('\n💰 Cost-Effective Solutions:');
    advice.costEffectiveSolutions?.forEach((solution, i) => {
      console.log(`  ${i + 1}. ${solution}`);
    });

    console.log(`\n✅ Expected Results:\n   ${advice.expectedResults}`);
    console.log(`\n➡️ Next Steps:\n   ${advice.nextSteps}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🌾 ========================================');
  console.log('   GeoAI Crop Intelligence Demo');
  console.log('   Gemini AI + NDVI + Satellite Data');
  console.log('========================================\n');

  console.log('⚠️ Before running, please:');
  console.log('1. Login and get your JWT token');
  console.log('2. Create a property and get property ID');
  console.log('3. Update TEST_TOKEN and PROPERTY_ID constants\n');

  // Uncomment to run specific examples:
  
  // await analyzeCrop();           // Full crop analysis
  // await identifyCrop();          // Crop type identification
  // await recommendCrop();         // Next crop recommendation
  // await detectIssues();          // Health issue detection
  // await predictYield();          // Yield prediction
  // await getFarmingAdvice();      // Practical advice
}

// Export for testing
module.exports = {
  analyzeCrop,
  identifyCrop,
  recommendCrop,
  detectIssues,
  predictYield,
  getFarmingAdvice,
  runAllExamples
};

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
