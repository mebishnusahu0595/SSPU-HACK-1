# 🌾 GeoAI Crop Intelligence System

## Overview

The GeoAI system combines **Gemini AI**, **Sentinel Hub satellite imagery**, and **NDVI vegetation analysis** to provide comprehensive crop intelligence without training custom models.

## 🎯 Features

### 1. **Crop Type Identification**
- Analyzes satellite images and NDVI patterns
- Identifies crop type with confidence score
- Provides alternative crop possibilities
- Uses geographic location and seasonal context

### 2. **Crop Health Analysis**
- Real-time health assessment
- NDVI-based vegetation monitoring
- Issue detection (pests, diseases, stress)
- Health scoring (0-100)

### 3. **Issue Detection**
- **Pest & Disease Detection**: Visual pattern analysis
- **Drought Stress**: Low NDVI + high temperature
- **Waterlogging**: Low NDVI + excess rainfall
- **Nutrient Deficiency**: Yellowing, stunted growth
- **Disease Symptoms**: Discoloration, patches

### 4. **Crop Recommendation**
- Next season crop suggestions
- Based on:
  - Crop rotation principles
  - Soil health and nutrients
  - Weather patterns
  - Market demand
  - NDVI performance history

### 5. **Yield Prediction**
- Estimates final crop yield
- Uses NDVI trend analysis
- Considers weather impact
- Provides confidence intervals

### 6. **Farming Advice**
- Practical, actionable recommendations
- Simplified language for farmers
- Cost-effective solutions
- Urgent actions prioritized

## 🚀 Why Gemini API Instead of Training?

### ✅ Advantages:

1. **No Training Required**
   - No dataset collection
   - No model training time
   - No GPU requirements
   - No model maintenance

2. **Multimodal Understanding**
   - Can analyze satellite images
   - Can process structured data (NDVI, weather, soil)
   - Can combine visual + numerical analysis

3. **Natural Language Output**
   - Provides explanations, not just predictions
   - Generates actionable recommendations
   - Easy to understand for farmers

4. **Continuously Improving**
   - Model improves over time automatically
   - No need to retrain
   - Benefits from Google's updates

5. **Flexible & Adaptable**
   - Can handle any crop type
   - Works across different regions
   - Adapts to new crops without retraining

6. **Cost-Effective**
   - No training compute costs
   - No data storage for training
   - Pay only for API usage

## 📡 API Endpoints

### 1. Comprehensive Crop Analysis
```
POST /api/geoai/analyze-crop
```

**Request:**
```json
{
  "propertyId": "property_id",
  "includeImage": true,
  "weatherData": {
    "temperature": 28,
    "humidity": 65,
    "rainfall": 120
  },
  "soilData": {
    "type": "Loamy",
    "pH": 6.5,
    "nitrogen": "Medium"
  },
  "previousCrop": "Rice",
  "cropStage": "Vegetative"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "cropIdentification": {
      "likelyCrop": "Wheat",
      "confidence": 85,
      "reasoning": "..."
    },
    "healthAssessment": {
      "overallHealth": "Good",
      "healthScore": 75
    },
    "detectedIssues": [...],
    "cropRecommendation": {...}
  },
  "ndviSummary": {
    "mean": 0.65,
    "healthyPercentage": 78.5
  }
}
```

### 2. Crop Type Identification
```
POST /api/geoai/identify-crop
```

**Request:**
```json
{
  "propertyId": "property_id",
  "seasonData": "Kharif season"
}
```

**Response:**
```json
{
  "cropType": "Rice",
  "confidence": 90,
  "alternativeCrops": ["Wheat", "Maize"],
  "reasoning": "...",
  "cropCharacteristics": {
    "pattern": "Dense vegetation in grid pattern",
    "ndviSignature": "High NDVI (0.7-0.8) consistent with healthy rice",
    "seasonalMatch": "Matches Kharif rice planting season"
  }
}
```

### 3. Next Crop Recommendation
```
POST /api/geoai/recommend-crop
```

**Request:**
```json
{
  "propertyId": "property_id",
  "currentCrop": "Wheat",
  "weatherHistory": {...},
  "marketData": {...}
}
```

**Response:**
```json
{
  "primaryRecommendation": {
    "cropName": "Pulses (Moong Dal)",
    "confidence": 90,
    "expectedYield": "8-12 quintals/hectare",
    "profitability": "High",
    "reasoning": "..."
  },
  "alternativeOptions": [...],
  "soilPreparation": [...],
  "riskFactors": [...],
  "estimatedROI": "150-200%",
  "waterRequirement": "Low",
  "seasonalTiming": "March-April"
}
```

### 4. Crop Issue Detection
```
POST /api/geoai/detect-issues
```

**Request:**
```json
{
  "propertyId": "property_id",
  "cropType": "Rice",
  "cropStage": "Flowering",
  "weatherData": {...}
}
```

**Response:**
```json
{
  "healthStatus": "At Risk",
  "overallScore": 65,
  "detectedIssues": [
    {
      "type": "Disease",
      "severity": "Medium",
      "confidence": 85,
      "affectedArea": "15% of field",
      "symptoms": ["Brown spots", "Leaf discoloration"],
      "location": "Northern section",
      "urgency": "Soon"
    }
  ],
  "recommendations": [
    {
      "action": "Apply fungicide (Copper oxychloride)",
      "priority": "High",
      "timing": "Within 3 days",
      "expectedCost": "₹800-1200/acre",
      "expectedBenefit": "Prevent 20-30% yield loss"
    }
  ],
  "yieldImpact": "Could reduce yield by 25% if untreated",
  "monitoringAdvice": "Check daily, spray in evening"
}
```

### 5. Yield Prediction
```
POST /api/geoai/predict-yield
```

**Response:**
```json
{
  "predictedYield": {
    "amount": "45-52 quintals",
    "perHectare": "25 quintals/hectare",
    "confidenceInterval": "43-54 quintals"
  },
  "confidenceLevel": 80,
  "factors": {
    "positive": ["Good NDVI trend", "Adequate rainfall"],
    "negative": ["Heat stress in May"]
  },
  "comparison": {
    "vsAverage": "+15% above average",
    "vsPotential": "85% of potential",
    "vsLastYear": "Better"
  },
  "harvestTiming": "Mid-April to early May",
  "qualityExpectation": "Good to excellent",
  "improvements": ["Apply potassium for better grain filling"]
}
```

### 6. Farming Advice
```
POST /api/geoai/farming-advice
```

**Response:**
```json
{
  "urgentActions": [
    "Apply fungicide spray within 2 days"
  ],
  "weeklyTasks": [
    "Check for pest larvae under leaves",
    "Monitor irrigation - keep soil moist",
    "Remove weeds around field edges"
  ],
  "monitoring": [
    "Check leaves daily for new spots",
    "Monitor NDVI weekly"
  ],
  "costEffectiveSolutions": [
    "Use neem oil spray (₹200/acre)",
    "Set up yellow sticky traps"
  ],
  "expectedResults": "Should see improvement in 5-7 days",
  "nextSteps": "If no improvement, soil test recommended"
}
```

## 🔧 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Request                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│               GeoAI API Routes                      │
│              /api/geoai/*                           │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│ Sentinel Service │    │  Property Data   │
│ - Satellite Img  │    │  - Coordinates   │
│ - NDVI Calc      │    │  - Soil Info     │
└────────┬─────────┘    └──────┬───────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   GeoAI Service      │
         │   (Gemini AI)        │
         │                      │
         │  - Image Analysis    │
         │  - Data Processing   │
         │  - Prompt Engineering│
         │  - Response Parsing  │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Structured Output  │
         │   - Crop ID          │
         │   - Health Analysis  │
         │   - Recommendations  │
         └──────────────────────┘
```

## 🎨 Data Flow

1. **Input Collection**
   - Property coordinates → Calculate bounding box
   - Fetch satellite imagery (Sentinel-2)
   - Calculate NDVI from imagery
   - Gather weather, soil, historical data

2. **GeoAI Processing**
   - Convert image to base64
   - Build comprehensive prompt with all data
   - Send to Gemini API (vision + text model)
   - Receive AI-generated analysis

3. **Output Parsing**
   - Extract JSON from response
   - Validate structure
   - Add metadata (timestamp, property info)
   - Return to frontend

## 📊 NDVI Integration

NDVI (Normalized Difference Vegetation Index) is calculated from satellite data:

```
NDVI = (NIR - Red) / (NIR + Red)
```

**Interpretation:**
- **0.7 - 1.0**: Dense, healthy vegetation
- **0.4 - 0.7**: Moderate vegetation (crops, grassland)
- **0.2 - 0.4**: Sparse vegetation
- **0.0 - 0.2**: Bare soil, water, urban areas
- **< 0.0**: Water bodies

## 🔑 Environment Setup

Add to `.env`:
```bash
# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# Sentinel Hub (for satellite data)
SENTINEL_CLIENT_ID=your_sentinel_id
SENTINEL_CLIENT_SECRET=your_sentinel_secret
```

## 📦 Dependencies

Already installed in `package.json`:
```json
{
  "@google/generative-ai": "^0.24.1",
  "axios": "^1.6.2",
  "sharp": "^0.34.4"
}
```

## 🧪 Testing

Run examples:
```bash
cd server
node examples/geoai-examples.js
```

## 💡 Use Cases

### 1. **Crop Insurance**
- Verify crop type before issuing policy
- Assess damage after weather events
- Automate claim validation

### 2. **Precision Agriculture**
- Identify underperforming areas
- Optimize fertilizer application
- Predict harvest timing

### 3. **Early Warning System**
- Detect pest/disease outbreaks
- Alert farmers to drought stress
- Prevent crop losses

### 4. **Agricultural Advisory**
- Recommend suitable crops
- Provide farming tips
- Optimize crop rotation

## 🎯 Benefits Over Traditional ML

| Aspect | Traditional ML | GeoAI (Gemini) |
|--------|---------------|----------------|
| Training Time | Weeks/Months | None |
| Data Required | Thousands of labeled images | None |
| Model Updates | Manual retraining | Automatic |
| Crop Types | Limited to trained crops | Any crop |
| Explanations | Black box | Natural language |
| Setup Complexity | High | Low |
| Maintenance | Ongoing | Minimal |
| Adaptability | Rigid | Flexible |

## 🚀 Future Enhancements

1. **Time-series Analysis**: Track NDVI changes over entire growing season
2. **Multi-field Comparison**: Compare performance across multiple properties
3. **Prescription Maps**: Generate variable-rate application maps
4. **Disease Image Library**: Build reference database from detected issues
5. **Weather Integration**: Combine real-time weather forecasts with predictions

## 📝 Notes

- **Image Quality**: Better satellite images (less cloud cover) = better analysis
- **NDVI Timing**: Most accurate during active growing season
- **Location Context**: Analysis improves with regional agricultural knowledge
- **Validation**: Always validate AI recommendations with local agricultural experts

## 🤝 Contributing

To improve GeoAI prompts or add new features:
1. Edit `/services/geoAIService.js`
2. Update prompt templates for better accuracy
3. Add new analysis functions
4. Test with real satellite data

---

**Built for SSPU Hackathon 2025** 🏆
