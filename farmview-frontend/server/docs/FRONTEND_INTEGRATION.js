/**
 * Frontend Integration Guide for GeoAI
 * How to call GeoAI APIs from React/Vue/Angular
 */

// ============================================
// 1. BASIC API CALL SETUP
// ============================================

// axios instance with auth
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// 2. REACT HOOKS EXAMPLE
// ============================================

import { useState } from 'react';

function useCropAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const analyzeCrop = async (propertyId, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/geoai/analyze-crop', {
        propertyId,
        includeImage: true,
        ...options
      });

      setAnalysis(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeCrop, analysis, loading, error };
}

// Usage in component:
function CropAnalysisPage({ propertyId }) {
  const { analyzeCrop, analysis, loading, error } = useCropAnalysis();

  const handleAnalyze = async () => {
    await analyzeCrop(propertyId, {
      weatherData: {
        temperature: 28,
        humidity: 65
      },
      cropStage: 'Vegetative'
    });
  };

  if (loading) return <div>Analyzing crop...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleAnalyze}>Analyze Crop</button>
      
      {analysis && (
        <div>
          <h2>Crop: {analysis.analysis.cropIdentification?.likelyCrop}</h2>
          <p>Health: {analysis.analysis.healthAssessment?.overallHealth}</p>
          <p>Score: {analysis.analysis.healthAssessment?.healthScore}/100</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// 3. CROP IDENTIFICATION COMPONENT
// ============================================

function CropIdentifier({ propertyId }) {
  const [identifying, setIdentifying] = useState(false);
  const [cropData, setCropData] = useState(null);

  const identifyCrop = async () => {
    setIdentifying(true);

    try {
      const { data } = await api.post('/geoai/identify-crop', {
        propertyId,
        seasonData: getCurrentSeason()
      });

      setCropData(data.identification);
    } catch (error) {
      console.error('Identification failed:', error);
    } finally {
      setIdentifying(false);
    }
  };

  return (
    <div className="crop-identifier">
      <button onClick={identifyCrop} disabled={identifying}>
        {identifying ? 'Identifying...' : 'Identify Crop'}
      </button>

      {cropData && (
        <div className="results">
          <h3>🌾 {cropData.cropType}</h3>
          <div className="confidence">
            Confidence: {cropData.confidence}%
          </div>
          
          <div className="reasoning">
            <strong>Why:</strong>
            <p>{cropData.reasoning}</p>
          </div>

          {cropData.alternativeCrops?.length > 0 && (
            <div className="alternatives">
              <strong>Could also be:</strong>
              <ul>
                {cropData.alternativeCrops.map((crop, i) => (
                  <li key={i}>{crop}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 4. CROP RECOMMENDATION WIDGET
// ============================================

function NextCropRecommendation({ propertyId, currentCrop }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRecommendation = async () => {
    setLoading(true);

    try {
      const { data } = await api.post('/geoai/recommend-crop', {
        propertyId,
        currentCrop,
        weatherHistory: {},
        marketData: {}
      });

      setRecommendation(data.recommendation);
    } catch (error) {
      console.error('Recommendation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const primary = recommendation?.primaryRecommendation;

  return (
    <div className="recommendation-card">
      <h3>💡 Next Crop Recommendation</h3>
      
      <button onClick={getRecommendation} disabled={loading}>
        Get Recommendation
      </button>

      {primary && (
        <div className="recommendation">
          <div className="primary-crop">
            <h4>🌱 {primary.cropName}</h4>
            <div className="confidence-bar">
              <div 
                className="fill" 
                style={{ width: `${primary.confidence}%` }}
              />
            </div>
            <p className="reasoning">{primary.reasoning}</p>
          </div>

          <div className="details">
            <div className="detail-item">
              <span className="label">Expected Yield:</span>
              <span className="value">{primary.expectedYield}</span>
            </div>
            <div className="detail-item">
              <span className="label">Profitability:</span>
              <span className={`value ${primary.profitability.toLowerCase()}`}>
                {primary.profitability}
              </span>
            </div>
          </div>

          {recommendation.alternativeOptions?.length > 0 && (
            <div className="alternatives">
              <h5>Alternative Options:</h5>
              {recommendation.alternativeOptions.map((alt, i) => (
                <div key={i} className="alternative">
                  <strong>{alt.cropName}</strong> ({alt.confidence}%)
                  <ul className="pros">
                    {alt.pros?.map((pro, j) => (
                      <li key={j}>✓ {pro}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {recommendation.soilPreparation?.length > 0 && (
            <div className="preparation">
              <h5>🚜 Soil Preparation:</h5>
              <ol>
                {recommendation.soilPreparation.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 5. HEALTH ISSUE DETECTION ALERT
// ============================================

function HealthIssueDetector({ propertyId, cropType, cropStage }) {
  const [issues, setIssues] = useState(null);
  const [scanning, setScanning] = useState(false);

  const detectIssues = async () => {
    setScanning(true);

    try {
      const { data } = await api.post('/geoai/detect-issues', {
        propertyId,
        cropType,
        cropStage,
        weatherData: await fetchWeatherData()
      });

      setIssues(data.issueDetection);

      // Show notification if critical issues found
      if (data.issueDetection.healthStatus === 'Critical') {
        showNotification('⚠️ Critical crop issues detected!');
      }
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="health-detector">
      <button onClick={detectIssues} className="scan-btn">
        {scanning ? 'Scanning...' : '🔬 Scan for Issues'}
      </button>

      {issues && (
        <div className="health-status">
          <div className={`status-badge ${issues.healthStatus.toLowerCase()}`}>
            {issues.healthStatus}
          </div>
          <div className="health-score">
            Score: {issues.overallScore}/100
          </div>

          {issues.detectedIssues?.length > 0 ? (
            <div className="issues-list">
              <h4>⚠️ Detected Issues:</h4>
              {issues.detectedIssues.map((issue, i) => (
                <div key={i} className={`issue-card ${issue.severity.toLowerCase()}`}>
                  <div className="issue-header">
                    <span className="issue-type">{issue.type}</span>
                    <span className="severity">{issue.severity}</span>
                  </div>
                  
                  <div className="issue-details">
                    <p><strong>Affected:</strong> {issue.affectedArea}</p>
                    <p><strong>Location:</strong> {issue.location}</p>
                    <p><strong>Urgency:</strong> {issue.urgency}</p>
                  </div>

                  {issue.symptoms && (
                    <div className="symptoms">
                      <strong>Symptoms:</strong>
                      <ul>
                        {issue.symptoms.map((symptom, j) => (
                          <li key={j}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              <div className="recommendations">
                <h4>📋 Recommended Actions:</h4>
                {issues.recommendations?.map((rec, i) => (
                  <div key={i} className={`recommendation priority-${rec.priority.toLowerCase()}`}>
                    <div className="action">{rec.action}</div>
                    <div className="rec-details">
                      <span>⏰ {rec.timing}</span>
                      <span>💰 {rec.expectedCost}</span>
                    </div>
                    <div className="benefit">✓ {rec.expectedBenefit}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-issues">
              ✅ No critical issues detected! Crop is healthy.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. YIELD PREDICTION CHART
// ============================================

function YieldPredictor({ propertyId, cropType, cropStage }) {
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const predictYield = async () => {
    setPredicting(true);

    try {
      const { data } = await api.post('/geoai/predict-yield', {
        propertyId,
        cropType,
        cropStage,
        weatherData: {},
        soilData: {}
      });

      setPrediction(data.yieldPrediction);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="yield-predictor">
      <h3>📊 Yield Prediction</h3>
      
      <button onClick={predictYield} disabled={predicting}>
        {predicting ? 'Predicting...' : 'Predict Yield'}
      </button>

      {prediction && (
        <div className="prediction-results">
          <div className="main-prediction">
            <h4>{prediction.predictedYield.amount}</h4>
            <p className="per-hectare">{prediction.predictedYield.perHectare}</p>
            <p className="range">Range: {prediction.predictedYield.confidenceInterval}</p>
          </div>

          <div className="confidence">
            Confidence: {prediction.confidenceLevel}%
          </div>

          <div className="factors">
            <div className="positive">
              <h5>✅ Positive Factors:</h5>
              <ul>
                {prediction.factors?.positive?.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>

            <div className="negative">
              <h5>⚠️ Challenges:</h5>
              <ul>
                {prediction.factors?.negative?.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="comparisons">
            <div className="comparison">
              <span>vs Average:</span>
              <strong>{prediction.comparison?.vsAverage}</strong>
            </div>
            <div className="comparison">
              <span>vs Potential:</span>
              <strong>{prediction.comparison?.vsPotential}</strong>
            </div>
          </div>

          <div className="harvest-info">
            <p><strong>Best Harvest Time:</strong> {prediction.harvestTiming}</p>
            <p><strong>Expected Quality:</strong> {prediction.qualityExpectation}</p>
          </div>

          {prediction.improvements?.length > 0 && (
            <div className="improvements">
              <h5>💡 How to Improve:</h5>
              <ul>
                {prediction.improvements.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 7. COMPLETE DASHBOARD INTEGRATION
// ============================================

function CropIntelligenceDashboard({ propertyId }) {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <div className="crop-intelligence-dashboard">
      <h2>🌾 Crop Intelligence Dashboard</h2>

      <div className="tabs">
        <button 
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button 
          className={activeTab === 'identify' ? 'active' : ''}
          onClick={() => setActiveTab('identify')}
        >
          Identify
        </button>
        <button 
          className={activeTab === 'recommend' ? 'active' : ''}
          onClick={() => setActiveTab('recommend')}
        >
          Recommend
        </button>
        <button 
          className={activeTab === 'issues' ? 'active' : ''}
          onClick={() => setActiveTab('issues')}
        >
          Health Check
        </button>
        <button 
          className={activeTab === 'yield' ? 'active' : ''}
          onClick={() => setActiveTab('yield')}
        >
          Predict Yield
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'analysis' && (
          <CropAnalysisPage propertyId={propertyId} />
        )}
        {activeTab === 'identify' && (
          <CropIdentifier propertyId={propertyId} />
        )}
        {activeTab === 'recommend' && (
          <NextCropRecommendation 
            propertyId={propertyId} 
            currentCrop="Wheat" 
          />
        )}
        {activeTab === 'issues' && (
          <HealthIssueDetector 
            propertyId={propertyId}
            cropType="Rice"
            cropStage="Flowering"
          />
        )}
        {activeTab === 'yield' && (
          <YieldPredictor 
            propertyId={propertyId}
            cropType="Wheat"
            cropStage="Grain Filling"
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// 8. HELPER FUNCTIONS
// ============================================

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'Kharif (Monsoon)';
  if (month >= 11 || month <= 2) return 'Rabi (Winter)';
  return 'Zaid (Summer)';
}

async function fetchWeatherData() {
  // Fetch from your weather API
  return {
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    windSpeed: 12
  };
}

function showNotification(message) {
  // Use your notification system
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FarmView Alert', { body: message });
  }
}

// ============================================
// EXPORT FOR USE
// ============================================

export {
  useCropAnalysis,
  CropIdentifier,
  NextCropRecommendation,
  HealthIssueDetector,
  YieldPredictor,
  CropIntelligenceDashboard
};
