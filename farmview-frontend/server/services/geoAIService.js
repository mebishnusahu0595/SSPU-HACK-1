/**
 * GeoAI Service - Crop Intelligence using Gemini AI + Satellite Data
 * Combines NDVI, satellite imagery, weather, and soil data for crop analysis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class GeoAIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Analyze crop type and health from satellite data + NDVI
   */
  async analyzeCropHealth({
    ndviData,
    satelliteImage,
    location,
    weatherData,
    soilData,
    previousCrop,
    cropStage
  }) {
    try {
      console.log('🌾 Starting GeoAI crop analysis...');

      // Prepare comprehensive prompt for Gemini
      const prompt = this.buildAnalysisPrompt({
        ndviData,
        location,
        weatherData,
        soilData,
        previousCrop,
        cropStage
      });

      let result;
      
      // If satellite image is provided, use vision model
      if (satelliteImage) {
        result = await this.analyzeWithImage(prompt, satelliteImage);
      } else {
        // Text-only analysis
        result = await this.model.generateContent(prompt);
      }

      const analysis = result.response.text();
      console.log('✅ GeoAI analysis completed');

      // Parse the structured response
      return this.parseAnalysisResponse(analysis);

    } catch (error) {
      console.error('❌ GeoAI analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Identify crop type from satellite imagery + NDVI patterns
   */
  async identifyCropType({
    satelliteImage,
    ndviData,
    location,
    seasonData
  }) {
    try {
      console.log('🔍 Identifying crop type with GeoAI...');

      const prompt = `
You are an expert agricultural scientist analyzing satellite imagery and vegetation data to identify crop types.

**Location Data:**
- Latitude: ${location.lat}
- Longitude: ${location.lng}
- Region: ${location.region || 'Unknown'}

**NDVI Analysis:**
- Mean NDVI: ${ndviData.mean?.toFixed(3) || 'N/A'}
- Min NDVI: ${ndviData.min?.toFixed(3) || 'N/A'}
- Max NDVI: ${ndviData.max?.toFixed(3) || 'N/A'}
- Std Dev: ${ndviData.stdDev?.toFixed(3) || 'N/A'}
- Healthy Vegetation %: ${ndviData.healthyPercentage?.toFixed(1) || 'N/A'}%

**Season/Time:** ${seasonData || 'Current season'}

**Task:**
1. Analyze the satellite image patterns (texture, color, arrangement)
2. Correlate NDVI values with typical crop signatures
3. Consider geographic location and season
4. Identify the most likely crop type

**Output Format (JSON):**
{
  "cropType": "Primary crop name",
  "confidence": 85,
  "alternativeCrops": ["Possible alternative 1", "Possible alternative 2"],
  "reasoning": "Detailed explanation of identification",
  "cropCharacteristics": {
    "pattern": "Field pattern description",
    "ndviSignature": "NDVI pattern interpretation",
    "seasonalMatch": "Season compatibility"
  }
}
`;

      const result = await this.analyzeWithImage(prompt, satelliteImage);
      const response = result.response.text();
      
      return this.parseJsonFromResponse(response);

    } catch (error) {
      console.error('❌ Crop identification failed:', error.message);
      throw error;
    }
  }

  /**
   * Get crop recommendation for the next season
   */
  async recommendNextCrop({
    currentCrop,
    soilData,
    weatherHistory,
    ndviHistory,
    location,
    farmSize,
    marketData
  }) {
    try {
      console.log('💡 Generating crop recommendation...');

      const prompt = `
You are an agricultural expert providing crop rotation and selection recommendations.

**Current Situation:**
- Current/Previous Crop: ${currentCrop || 'Unknown'}
- Location: ${location.lat}, ${location.lng}
- Farm Size: ${farmSize || 'N/A'} hectares

**Soil Analysis:**
${JSON.stringify(soilData, null, 2)}

**Weather History (Last 6 months):**
${JSON.stringify(weatherHistory, null, 2)}

**NDVI Performance History:**
${JSON.stringify(ndviHistory, null, 2)}

**Market Data (if available):**
${JSON.stringify(marketData, null, 2)}

**Task:**
Recommend the best crop(s) for the next planting season considering:
1. Crop rotation principles (avoid monoculture)
2. Soil nutrient recovery
3. Climate suitability
4. Water requirements vs availability
5. Market demand and profitability
6. Pest/disease risk management

**Output Format (JSON):**
{
  "primaryRecommendation": {
    "cropName": "Recommended crop",
    "confidence": 90,
    "expectedYield": "Estimated yield range",
    "profitability": "High/Medium/Low",
    "reasoning": "Why this crop is best"
  },
  "alternativeOptions": [
    {
      "cropName": "Alternative 1",
      "confidence": 75,
      "pros": ["Advantage 1", "Advantage 2"],
      "cons": ["Disadvantage 1"]
    }
  ],
  "soilPreparation": ["Step 1", "Step 2", "Step 3"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "estimatedROI": "Expected return on investment",
  "waterRequirement": "Low/Medium/High",
  "seasonalTiming": "Best planting window"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseJsonFromResponse(response);

    } catch (error) {
      console.error('❌ Crop recommendation failed:', error.message);
      throw error;
    }
  }

  /**
   * Detect crop issues (pests, diseases, drought, nutrient deficiency)
   */
  async detectCropIssues({
    satelliteImage,
    ndviData,
    ndviHistory,
    weatherData,
    cropType,
    cropStage
  }) {
    try {
      console.log('🔬 Detecting crop health issues...');

      const prompt = `
You are a plant pathologist analyzing crop health using satellite imagery and vegetation indices.

**Crop Information:**
- Crop Type: ${cropType || 'Unknown'}
- Growth Stage: ${cropStage || 'Unknown'}

**Current NDVI Analysis:**
- Mean NDVI: ${ndviData.mean?.toFixed(3)}
- NDVI Drop from Previous: ${ndviData.change || 'N/A'}
- Affected Area: ${ndviData.lowNDVIPercentage?.toFixed(1)}%

**NDVI Trend (Last 30 days):**
${JSON.stringify(ndviHistory, null, 2)}

**Weather Conditions:**
${JSON.stringify(weatherData, null, 2)}

**Task:**
Analyze the satellite image and data to detect:
1. Disease symptoms (discoloration, patches)
2. Pest damage patterns
3. Drought stress (low NDVI + high temp)
4. Waterlogging (low NDVI + excess rain)
5. Nutrient deficiency (yellowing, stunted growth)

**Output Format (JSON):**
{
  "healthStatus": "Healthy/At Risk/Critical",
  "overallScore": 75,
  "detectedIssues": [
    {
      "type": "Pest/Disease/Drought/Nutrient/Waterlogging",
      "severity": "Low/Medium/High/Critical",
      "confidence": 85,
      "affectedArea": "15% of field",
      "symptoms": ["Symptom 1", "Symptom 2"],
      "location": "Northern section, scattered patches",
      "urgency": "Immediate/Soon/Monitor"
    }
  ],
  "recommendations": [
    {
      "action": "Specific action to take",
      "priority": "High/Medium/Low",
      "timing": "When to act",
      "expectedCost": "Estimated cost",
      "expectedBenefit": "Expected outcome"
    }
  ],
  "preventiveMeasures": ["Prevention tip 1", "Prevention tip 2"],
  "yieldImpact": "Estimated yield loss if not treated",
  "monitoringAdvice": "How often to check and what to watch"
}
`;

      const result = await this.analyzeWithImage(prompt, satelliteImage);
      const response = result.response.text();
      
      return this.parseJsonFromResponse(response);

    } catch (error) {
      console.error('❌ Issue detection failed:', error.message);
      throw error;
    }
  }

  /**
   * Predict yield based on NDVI trends and conditions
   */
  async predictYield({
    cropType,
    ndviHistory,
    weatherData,
    soilData,
    farmSize,
    cropStage
  }) {
    try {
      console.log('📊 Predicting crop yield...');

      const prompt = `
You are an agricultural data scientist predicting crop yield using vegetation indices and environmental data.

**Crop Details:**
- Crop Type: ${cropType}
- Farm Size: ${farmSize} hectares
- Growth Stage: ${cropStage}

**NDVI Performance History:**
${JSON.stringify(ndviHistory, null, 2)}

**Weather Conditions:**
${JSON.stringify(weatherData, null, 2)}

**Soil Quality:**
${JSON.stringify(soilData, null, 2)}

**Task:**
Predict the final yield based on:
1. NDVI trends (health trajectory)
2. Weather impact (stress periods)
3. Soil fertility
4. Current crop stage progress

**Output Format (JSON):**
{
  "predictedYield": {
    "amount": "X tons or quintals",
    "perHectare": "Yield per hectare",
    "confidenceInterval": "Min - Max range"
  },
  "confidenceLevel": 80,
  "factors": {
    "positive": ["Factor helping yield"],
    "negative": ["Factor reducing yield"]
  },
  "comparison": {
    "vsAverage": "+15% above average",
    "vsPotential": "85% of potential yield",
    "vsLastYear": "Similar/Better/Worse"
  },
  "harvestTiming": "Optimal harvest window",
  "qualityExpectation": "Expected produce quality",
  "improvements": ["How to boost yield further"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseJsonFromResponse(response);

    } catch (error) {
      console.error('❌ Yield prediction failed:', error.message);
      throw error;
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  buildAnalysisPrompt({
    ndviData,
    location,
    weatherData,
    soilData,
    previousCrop,
    cropStage
  }) {
    return `
You are an expert agricultural AI analyzing crop health using satellite data, NDVI, and environmental factors.

**Location:**
- Coordinates: ${location.lat}, ${location.lng}
- Region: ${location.region || 'Unknown'}

**NDVI Vegetation Analysis:**
- Mean NDVI: ${ndviData.mean?.toFixed(3) || 'N/A'}
- Min NDVI: ${ndviData.min?.toFixed(3) || 'N/A'}
- Max NDVI: ${ndviData.max?.toFixed(3) || 'N/A'}
- Healthy Vegetation: ${ndviData.healthyPercentage?.toFixed(1) || 'N/A'}%
- Stressed Vegetation: ${ndviData.stressedPercentage?.toFixed(1) || 'N/A'}%
- Bare Soil/Water: ${ndviData.barePercentage?.toFixed(1) || 'N/A'}%

**Weather Conditions:**
${JSON.stringify(weatherData, null, 2)}

**Soil Information:**
${JSON.stringify(soilData, null, 2)}

**Crop Context:**
- Previous Crop: ${previousCrop || 'Unknown'}
- Current Stage: ${cropStage || 'Unknown'}

**Task:**
Provide comprehensive crop analysis including:
1. Likely crop type identification
2. Overall health assessment
3. Specific issues detected (pests, disease, stress)
4. Actionable recommendations
5. Next crop suggestions

**Output Format (JSON):**
{
  "cropIdentification": {
    "likelyCrop": "Crop name",
    "confidence": 85,
    "reasoning": "Why this crop"
  },
  "healthAssessment": {
    "overallHealth": "Excellent/Good/Fair/Poor/Critical",
    "healthScore": 75,
    "ndviInterpretation": "NDVI analysis summary"
  },
  "detectedIssues": [
    {
      "issue": "Problem type",
      "severity": "Low/Medium/High",
      "recommendation": "What to do"
    }
  ],
  "cropRecommendation": {
    "nextCrop": "Recommended crop for next season",
    "reasoning": "Why this crop is suitable"
  },
  "actionableInsights": ["Insight 1", "Insight 2", "Insight 3"]
}
`;
  }

  /**
   * Analyze with image using vision model
   */
  async analyzeWithImage(prompt, imageBuffer) {
    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      return result;

    } catch (error) {
      console.error('❌ Image analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse JSON from Gemini response (handles markdown code blocks)
   */
  parseJsonFromResponse(text) {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Find JSON object in text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.warn('⚠️ Failed to parse JSON, returning raw text');
      return { rawResponse: text };
    }
  }

  /**
   * Parse analysis response
   */
  parseAnalysisResponse(text) {
    try {
      return this.parseJsonFromResponse(text);
    } catch (error) {
      // If parsing fails, return structured fallback
      return {
        rawAnalysis: text,
        error: 'Failed to parse structured response'
      };
    }
  }

  /**
   * Generate farming advice based on GeoAI insights
   */
  async generateFarmingAdvice({
    cropType,
    issues,
    season,
    location,
    farmerExperience
  }) {
    try {
      const prompt = `
You are an agricultural extension officer providing practical farming advice to a ${farmerExperience || 'regular'} farmer.

**Situation:**
- Crop: ${cropType}
- Location: ${location}
- Season: ${season}
- Detected Issues: ${JSON.stringify(issues)}

Provide clear, actionable advice in simple language:
1. Immediate actions needed (if any)
2. Weekly maintenance tasks
3. What to watch for
4. Cost-effective solutions
5. Expected outcomes

Keep language simple and practical. Focus on what the farmer can actually do.

**Output Format (JSON):**
{
  "urgentActions": ["Action 1 with timeline"],
  "weeklyTasks": ["Task 1", "Task 2"],
  "monitoring": ["What to check daily/weekly"],
  "costEffectiveSolutions": ["Budget-friendly tip 1"],
  "expectedResults": "What farmer should see",
  "nextSteps": "What to do after following advice"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseJsonFromResponse(response);

    } catch (error) {
      console.error('❌ Advice generation failed:', error.message);
      throw error;
    }
  }
}

module.exports = new GeoAIService();
