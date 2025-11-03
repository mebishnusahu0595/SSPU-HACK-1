import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import geoAIService from '../services/geoai.service';
import axios from 'axios';

const CropIntelligence = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Results
  const [analysis, setAnalysis] = useState(null);
  const [identification, setIdentification] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [issues, setIssues] = useState(null);
  const [yieldPrediction, setYieldPrediction] = useState(null);
  const [ndviStats, setNdviStats] = useState(null);

  // Fetch user properties
  useEffect(() => {
    if (isInitialized) {
      console.log('Already initialized, skipping fetch');
      return;
    }
    
    const fetchProperties = async () => {
      console.log('Starting to fetch properties - ONCE ONLY');
      setLoadingProperties(true);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/property', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const propertiesData = response.data.data || [];
        setProperties(propertiesData);
        
        if (propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0]);
        }
        
        console.log('Properties loaded successfully:', propertiesData.length);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again.');
        setIsInitialized(true); // Mark as initialized even on error
      } finally {
        setLoadingProperties(false);
      }
    };
    
    fetchProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Analyze Crop
  const handleAnalyzeCrop = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.analyzeCrop(selectedProperty._id, {
        cropStage: selectedProperty.cropStage || 'Vegetative'
      });
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze crop');
    } finally {
      setLoading(false);
    }
  };

  // Identify Crop
  const handleIdentifyCrop = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.identifyCrop(
        selectedProperty._id,
        geoAIService.getCurrentSeason()
      );
      setIdentification(result.identification);
    } catch (err) {
      setError(err.message || 'Failed to identify crop');
    } finally {
      setLoading(false);
    }
  };

  // Recommend Next Crop
  const handleRecommendCrop = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.recommendNextCrop(
        selectedProperty._id,
        selectedProperty.currentCrop || 'Unknown'
      );
      setRecommendation(result.recommendation);
    } catch (err) {
      setError(err.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  // Detect Issues
  const handleDetectIssues = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.detectIssues(
        selectedProperty._id,
        selectedProperty.currentCrop || 'Unknown',
        selectedProperty.cropStage || 'Vegetative'
      );
      setIssues(result.issueDetection);
    } catch (err) {
      setError(err.message || 'Failed to detect issues');
    } finally {
      setLoading(false);
    }
  };

  // Predict Yield
  const handlePredictYield = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.predictYield(
        selectedProperty._id,
        selectedProperty.currentCrop || 'Unknown',
        selectedProperty.cropStage || 'Grain Filling'
      );
      setYieldPrediction(result.yieldPrediction);
    } catch (err) {
      setError(err.message || 'Failed to predict yield');
    } finally {
      setLoading(false);
    }
  };

  // Get NDVI Stats
  const handleGetNDVI = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await geoAIService.getNDVIStats(selectedProperty._id);
      setNdviStats(result.data.statistics);
    } catch (err) {
      setError(err.message || 'Failed to get NDVI data');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  console.log('Current loadingProperties state:', loadingProperties);
  console.log('Properties array:', properties);
  
  // TEMPORARILY DISABLED LOADING CHECK FOR DEBUGGING
  // if (loadingProperties) {
  //   console.log('Showing loading screen');
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-xl text-gray-600">Loading properties...</p>
  //         <p className="text-sm text-gray-500 mt-2">loadingProperties: {String(loadingProperties)}</p>
  //       </div>
  //     </div>
  //   );
  // }

  // No properties state
  if (!loadingProperties && properties.length === 0) {
    console.log('Showing no properties screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <span className="text-6xl mb-4 block">🌾</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Properties Found</h2>
            <p className="text-gray-600 mb-6">You need to add a property before using Crop Intelligence features.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/property')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Add Property
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main component with', properties.length, 'properties');
  console.log('Selected property:', selectedProperty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0fdf4',
      padding: '24px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* VISIBILITY TEST */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        zIndex: 9999,
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        🚨 TEST: IF YOU SEE THIS, COMPONENT IS RENDERING! Properties: {properties.length}
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6" style={{ backgroundColor: 'white', marginTop: '80px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">🌾</span>
                Crop Intelligence Dashboard
              </h1>
              <p className="text-gray-600 mt-2">AI-powered crop analysis using satellite data & NDVI</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Property Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Property ({properties.length} available)
            </label>
            {selectedProperty && (
              <span className="text-sm text-green-600">✓ Property selected</span>
            )}
          </div>
          <select
            value={selectedProperty?._id || ''}
            onChange={(e) => {
              const prop = properties.find(p => p._id === e.target.value);
              setSelectedProperty(prop);
              // Reset results
              setAnalysis(null);
              setIdentification(null);
              setRecommendation(null);
              setIssues(null);
              setYieldPrediction(null);
              setNdviStats(null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {properties.length === 0 && (
              <option value="">No properties available</option>
            )}
            {properties.map(prop => (
              <option key={prop._id} value={prop._id}>
                {prop.propertyName || prop.surveyNumber} - {prop.area} hectares - {prop.currentCrop || 'No crop'}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'analyze', icon: '🔬', label: 'Analyze' },
              { id: 'identify', icon: '🔍', label: 'Identify Crop' },
              { id: 'recommend', icon: '💡', label: 'Recommend' },
              { id: 'issues', icon: '⚠️', label: 'Health Check' },
              { id: 'yield', icon: '📊', label: 'Predict Yield' },
              { id: 'ndvi', icon: '🌿', label: 'NDVI Stats' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-b-4 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <span className="text-xl mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                ⚠️ {error}
              </div>
            )}

            {/* Analyze Tab */}
            {activeTab === 'analyze' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Comprehensive Crop Analysis</h2>
                  <button
                    onClick={handleAnalyzeCrop}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
                  >
                    {loading ? '🔄 Analyzing...' : '🔬 Analyze Crop'}
                  </button>
                </div>

                {analysis && (
                  <div className="space-y-6">
                    {/* Crop Identification */}
                    {analysis.cropIdentification && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🌾 Crop Identification</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-green-600">
                              {analysis.cropIdentification.likelyCrop}
                            </span>
                            <span className="px-4 py-2 bg-green-600 text-white rounded-full">
                              {analysis.cropIdentification.confidence}% Confident
                            </span>
                          </div>
                          <p className="text-gray-700 mt-4">{analysis.cropIdentification.reasoning}</p>
                        </div>
                      </div>
                    )}

                    {/* Health Assessment */}
                    {analysis.healthAssessment && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">💚 Health Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Overall Health</p>
                            <p className="text-2xl font-bold text-green-600">
                              {analysis.healthAssessment.overallHealth}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Health Score</p>
                            <div className="flex items-end gap-2">
                              <p className="text-2xl font-bold text-blue-600">
                                {analysis.healthAssessment.healthScore}
                              </p>
                              <p className="text-gray-600">/100</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-4">{analysis.healthAssessment.ndviInterpretation}</p>
                      </div>
                    )}

                    {/* Detected Issues */}
                    {analysis.detectedIssues && analysis.detectedIssues.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Detected Issues</h3>
                        <div className="space-y-4">
                          {analysis.detectedIssues.map((issue, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border border-yellow-300">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{issue.issue}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  issue.severity === 'High' ? 'bg-red-100 text-red-700' :
                                  issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-gray-700">
                                <strong>Action:</strong> {issue.recommendation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crop Recommendation */}
                    {analysis.cropRecommendation && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Next Crop Recommendation</h3>
                        <div className="bg-white p-4 rounded-lg">
                          <h4 className="font-bold text-purple-600 text-xl mb-2">
                            {analysis.cropRecommendation.nextCrop}
                          </h4>
                          <p className="text-gray-700">{analysis.cropRecommendation.reasoning}</p>
                        </div>
                      </div>
                    )}

                    {/* Actionable Insights */}
                    {analysis.actionableInsights && analysis.actionableInsights.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">✨ Actionable Insights</h3>
                        <ul className="space-y-2">
                          {analysis.actionableInsights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-600 text-xl">→</span>
                              <span className="text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Identify Crop Tab */}
            {activeTab === 'identify' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Identify Crop Type</h2>
                  <button
                    onClick={handleIdentifyCrop}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? '🔄 Identifying...' : '🔍 Identify Crop'}
                  </button>
                </div>

                {identification && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-3xl font-bold text-green-700">
                          🌾 {identification.cropType}
                        </h3>
                        <span className="px-6 py-3 bg-green-600 text-white rounded-full text-lg font-bold">
                          {identification.confidence}% Sure
                        </span>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg mt-4">
                        <h4 className="font-bold text-gray-800 mb-2">📝 Why This Crop?</h4>
                        <p className="text-gray-700">{identification.reasoning}</p>
                      </div>

                      {identification.alternativeCrops && identification.alternativeCrops.length > 0 && (
                        <div className="bg-white p-6 rounded-lg mt-4">
                          <h4 className="font-bold text-gray-800 mb-3">🔄 Could Also Be:</h4>
                          <div className="flex flex-wrap gap-2">
                            {identification.alternativeCrops.map((crop, i) => (
                              <span key={i} className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {identification.cropCharacteristics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Pattern</p>
                            <p className="text-gray-800 font-medium">{identification.cropCharacteristics.pattern}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">NDVI Signature</p>
                            <p className="text-gray-800 font-medium">{identification.cropCharacteristics.ndviSignature}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Season Match</p>
                            <p className="text-gray-800 font-medium">{identification.cropCharacteristics.seasonalMatch}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommend Tab */}
            {activeTab === 'recommend' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Next Crop Recommendation</h2>
                  <button
                    onClick={handleRecommendCrop}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? '🔄 Analyzing...' : '💡 Get Recommendation'}
                  </button>
                </div>

                {recommendation && recommendation.primaryRecommendation && (
                  <div className="space-y-6">
                    {/* Primary Recommendation */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-3xl font-bold text-purple-700">
                          🌱 {recommendation.primaryRecommendation.cropName}
                        </h3>
                        <span className="px-6 py-3 bg-purple-600 text-white rounded-full text-lg font-bold">
                          {recommendation.primaryRecommendation.confidence}% Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Expected Yield</p>
                          <p className="text-lg font-bold text-purple-600">
                            {recommendation.primaryRecommendation.expectedYield}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Profitability</p>
                          <p className="text-lg font-bold text-green-600">
                            {recommendation.primaryRecommendation.profitability}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600">ROI</p>
                          <p className="text-lg font-bold text-blue-600">
                            {recommendation.estimatedROI}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">📝 Why This Crop?</h4>
                        <p className="text-gray-700">{recommendation.primaryRecommendation.reasoning}</p>
                      </div>
                    </div>

                    {/* Soil Preparation */}
                    {recommendation.soilPreparation && recommendation.soilPreparation.length > 0 && (
                      <div className="bg-brown-50 border border-brown-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🚜 Soil Preparation Steps</h3>
                        <ol className="space-y-2">
                          {recommendation.soilPreparation.map((step, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                                {i + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Water & Timing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-800 mb-2">💧 Water Requirement</h4>
                        <p className="text-2xl font-bold text-blue-600">{recommendation.waterRequirement}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-800 mb-2">📅 Best Planting Time</h4>
                        <p className="text-lg font-medium text-orange-600">{recommendation.seasonalTiming}</p>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {recommendation.riskFactors && recommendation.riskFactors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Risk Factors</h3>
                        <ul className="space-y-2">
                          {recommendation.riskFactors.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-600">⚠️</span>
                              <span className="text-gray-700">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Issues Tab */}
            {activeTab === 'issues' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Crop Health Check</h2>
                  <button
                    onClick={handleDetectIssues}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? '🔄 Scanning...' : '🔬 Scan for Issues'}
                  </button>
                </div>

                {issues && (
                  <div className="space-y-6">
                    {/* Health Status */}
                    <div className={`border-2 rounded-xl p-6 ${
                      issues.healthStatus === 'Healthy' ? 'bg-green-50 border-green-300' :
                      issues.healthStatus === 'At Risk' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Health Status: {issues.healthStatus}
                          </h3>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-gray-800">{issues.overallScore}</span>
                            <span className="text-2xl text-gray-600">/100</span>
                          </div>
                        </div>
                        <div className="text-6xl">
                          {issues.healthStatus === 'Healthy' ? '✅' :
                           issues.healthStatus === 'At Risk' ? '⚠️' : '🚨'}
                        </div>
                      </div>
                    </div>

                    {/* Detected Issues */}
                    {issues.detectedIssues && issues.detectedIssues.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">🔬 Detected Issues</h3>
                        {issues.detectedIssues.map((issue, i) => (
                          <div key={i} className={`border-l-4 rounded-lg p-6 ${
                            issue.severity === 'Critical' ? 'bg-red-50 border-red-500' :
                            issue.severity === 'High' ? 'bg-orange-50 border-orange-500' :
                            issue.severity === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-green-50 border-green-500'
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-xl font-bold text-gray-800">{issue.type}</h4>
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  issue.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                                  issue.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                                  issue.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-green-200 text-green-800'
                                }`}>
                                  {issue.severity}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {issue.confidence}% sure
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Affected Area</p>
                                <p className="font-medium">{issue.affectedArea}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-medium">{issue.location}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Urgency</p>
                                <p className="font-bold text-red-600">{issue.urgency}</p>
                              </div>
                            </div>

                            {issue.symptoms && issue.symptoms.length > 0 && (
                              <div className="bg-white p-4 rounded-lg">
                                <h5 className="font-bold text-gray-800 mb-2">Symptoms:</h5>
                                <ul className="space-y-1">
                                  {issue.symptoms.map((symptom, j) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <span className="text-red-500">•</span>
                                      <span className="text-gray-700">{symptom}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Recommendations */}
                        {issues.recommendations && issues.recommendations.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Recommended Actions</h3>
                            <div className="space-y-4">
                              {issues.recommendations.map((rec, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{rec.action}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {rec.priority} Priority
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-600">⏰ Timing:</span>
                                      <span className="ml-2 font-medium">{rec.timing}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">💰 Cost:</span>
                                      <span className="ml-2 font-medium">{rec.expectedCost}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">✓ Benefit:</span>
                                      <span className="ml-2 font-medium text-green-600">{rec.expectedBenefit}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">No Issues Detected!</h3>
                        <p className="text-gray-700">Your crop is healthy and doing well.</p>
                      </div>
                    )}

                    {/* Monitoring Advice */}
                    {issues.monitoringAdvice && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">👁️ Monitoring Advice</h3>
                        <p className="text-gray-700">{issues.monitoringAdvice}</p>
                      </div>
                    )}

                    {/* Yield Impact */}
                    {issues.yieldImpact && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">📉 Potential Yield Impact</h3>
                        <p className="text-gray-700">{issues.yieldImpact}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Yield Tab */}
            {activeTab === 'yield' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Yield Prediction</h2>
                  <button
                    onClick={handlePredictYield}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? '🔄 Predicting...' : '📊 Predict Yield'}
                  </button>
                </div>

                {yieldPrediction && yieldPrediction.predictedYield && (
                  <div className="space-y-6">
                    {/* Main Prediction */}
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-8 text-center">
                      <h3 className="text-lg text-gray-600 mb-2">Expected Yield</h3>
                      <div className="text-5xl font-bold text-green-700 mb-2">
                        {yieldPrediction.predictedYield.amount}
                      </div>
                      <p className="text-xl text-gray-700 mb-4">
                        ({yieldPrediction.predictedYield.perHectare})
                      </p>
                      <p className="text-gray-600">
                        Range: {yieldPrediction.predictedYield.confidenceInterval}
                      </p>
                      <p className="text-lg font-medium text-blue-600 mt-4">
                        {yieldPrediction.confidenceLevel}% Confidence
                      </p>
                    </div>

                    {/* Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">✅ Positive Factors</h3>
                        <ul className="space-y-2">
                          {yieldPrediction.factors?.positive?.map((factor, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600">✓</span>
                              <span className="text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Challenges</h3>
                        <ul className="space-y-2">
                          {yieldPrediction.factors?.negative?.map((factor, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-600">⚠️</span>
                              <span className="text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Comparison */}
                    {yieldPrediction.comparison && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Comparison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600">vs Average</p>
                            <p className="text-lg font-bold text-blue-600">
                              {yieldPrediction.comparison.vsAverage}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600">vs Potential</p>
                            <p className="text-lg font-bold text-purple-600">
                              {yieldPrediction.comparison.vsPotential}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600">vs Last Year</p>
                            <p className="text-lg font-bold text-green-600">
                              {yieldPrediction.comparison.vsLastYear}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Harvest & Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-800 mb-2">📅 Best Harvest Time</h4>
                        <p className="text-lg text-gray-700">{yieldPrediction.harvestTiming}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-800 mb-2">🏆 Quality Expectation</h4>
                        <p className="text-lg text-gray-700">{yieldPrediction.qualityExpectation}</p>
                      </div>
                    </div>

                    {/* Improvements */}
                    {yieldPrediction.improvements && yieldPrediction.improvements.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">💡 How to Improve Yield</h3>
                        <ul className="space-y-2">
                          {yieldPrediction.improvements.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600 text-xl">→</span>
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NDVI Stats Tab */}
            {activeTab === 'ndvi' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">NDVI Statistics</h2>
                  <button
                    onClick={handleGetNDVI}
                    disabled={loading || !selectedProperty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? '🔄 Loading...' : '🌿 Get NDVI Data'}
                  </button>
                </div>

                {ndviStats && (
                  <div className="space-y-6">
                    {/* Main Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Mean NDVI</p>
                        <p className="text-3xl font-bold text-green-600">{ndviStats.mean}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Median</p>
                        <p className="text-3xl font-bold text-blue-600">{ndviStats.median}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Min</p>
                        <p className="text-3xl font-bold text-purple-600">{ndviStats.min}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Max</p>
                        <p className="text-3xl font-bold text-orange-600">{ndviStats.max}</p>
                      </div>
                    </div>

                    {/* Health Distribution */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Vegetation Distribution</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-green-700">Healthy (NDVI &gt; 0.6)</span>
                            <span className="text-sm font-bold text-green-700">{ndviStats.healthyPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-green-600 h-4 rounded-full"
                              style={{ width: `${ndviStats.healthyPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-yellow-700">Moderate (0.3-0.6)</span>
                            <span className="text-sm font-bold text-yellow-700">{ndviStats.moderatePercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-yellow-500 h-4 rounded-full"
                              style={{ width: `${ndviStats.moderatePercentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-orange-700">Stressed (0-0.3)</span>
                            <span className="text-sm font-bold text-orange-700">{ndviStats.stressedPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-orange-500 h-4 rounded-full"
                              style={{ width: `${ndviStats.stressedPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-red-700">Bare/Water (&lt; 0)</span>
                            <span className="text-sm font-bold text-red-700">{ndviStats.barePercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-red-600 h-4 rounded-full"
                              style={{ width: `${ndviStats.barePercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interpretation */}
                    {ndviStats.interpretation && (
                      <div className={`border-2 rounded-xl p-6 ${
                        ndviStats.interpretation.status === 'Excellent' || ndviStats.interpretation.status === 'Good' 
                          ? 'bg-green-50 border-green-300' 
                          : ndviStats.interpretation.status === 'Fair' 
                          ? 'bg-yellow-50 border-yellow-300' 
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">
                            {ndviStats.interpretation.status === 'Excellent' ? '🌟' :
                             ndviStats.interpretation.status === 'Good' ? '✅' :
                             ndviStats.interpretation.status === 'Fair' ? '⚠️' : '🚨'}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                              Status: {ndviStats.interpretation.status}
                            </h3>
                            <p className="text-gray-700 text-lg">{ndviStats.interpretation.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NDVI Guide */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📚 NDVI Guide</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-green-600">NDVI &gt; 0.6:</strong> Dense, healthy vegetation (healthy crops)</p>
                        <p><strong className="text-yellow-600">NDVI 0.3-0.6:</strong> Moderate vegetation (growing crops, grassland)</p>
                        <p><strong className="text-orange-600">NDVI 0-0.3:</strong> Sparse vegetation (stressed crops, some plants on bare soil)</p>
                        <p><strong className="text-red-600">NDVI &lt; 0:</strong> Non-vegetated (water, bare soil, sand, desert, urban)</p>
                      </div>
                    </div>

                    {/* Pixel Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">🔢 Data Quality</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total Pixels</p>
                          <p className="text-xl font-bold text-gray-800">{ndviStats.totalPixels}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Valid Pixels</p>
                          <p className="text-xl font-bold text-green-600">{ndviStats.validPixels}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Healthy Pixels</p>
                          <p className="text-xl font-bold text-green-600">{ndviStats.healthyPixels}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Stressed Pixels</p>
                          <p className="text-xl font-bold text-orange-600">{ndviStats.stressedPixels}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropIntelligence;
