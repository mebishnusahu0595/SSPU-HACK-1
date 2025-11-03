import { useState } from 'react';
import api from '../utils/api';
import SatelliteMapView from './SatelliteMapView';

export default function SatelliteNDVI({ propertyId, propertyName }) {
  const [loading, setLoading] = useState(false);
  const [ndviData, setNdviData] = useState(null);
  const [ndviStats, setNdviStats] = useState(null);
  const [satelliteImage, setSatelliteImage] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [activeView, setActiveView] = useState('ndvi'); // 'ndvi', 'satellite', or 'googlemap'
  const [error, setError] = useState(null);

  const fetchNDVI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching NDVI for property: ${propertyId}`);
      
      const res = await api.get(`/satellite/ndvi/${propertyId}`);
      
      if (res.data?.success) {
        setNdviData(res.data.data);
        setActiveView('ndvi');
        
        // Also fetch NDVI statistics
        fetchNDVIStats();
      }
    } catch (err) {
      console.error('NDVI fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch NDVI data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNDVIStats = async () => {
    try {
      const res = await api.get(`/satellite/ndvi-stats/${propertyId}`);
      if (res.data?.success) {
        setNdviStats(res.data.data.statistics);
      }
    } catch (err) {
      console.error('NDVI stats fetch error:', err);
    }
  };

  const fetchSatelliteImage = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching satellite image for property: ${propertyId}`);
      
      const res = await api.get(`/satellite/property/${propertyId}`);
      
      if (res.data?.success) {
        setSatelliteImage(res.data.data);
        setActiveView('satellite');
      }
    } catch (err) {
      console.error('Satellite image fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch satellite image');
    } finally {
      setLoading(false);
    }
  };

  const showGoogleMap = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching property data for Google Maps: ${propertyId}`);
      
      // Fetch property details including coordinates
      const res = await api.get(`/property/${propertyId}`);
      
      if (res.data?.data) {
        setPropertyData(res.data.data);
        setActiveView('googlemap');
      }
    } catch (err) {
      console.error('Property fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const getNDVIHealthStatus = (stats) => {
    if (!stats) return null;
    
    const healthPercentage = (stats.healthyPixels / stats.validPixels) * 100;
    
    if (healthPercentage >= 70) {
      return {
        status: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅',
        message: 'Your crops are in excellent health!'
      };
    } else if (healthPercentage >= 50) {
      return {
        status: 'Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '👍',
        message: 'Crops are doing well, monitor regularly'
      };
    } else if (healthPercentage >= 30) {
      return {
        status: 'Fair',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '⚠️',
        message: 'Some areas need attention'
      };
    } else {
      return {
        status: 'Poor',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🚨',
        message: 'Urgent action required!'
      };
    }
  };

  const healthStatus = ndviStats ? getNDVIHealthStatus(ndviStats) : null;

  return (
    <div className="card p-6 mt-6 bg-gradient-to-br from-white to-gray-50">
      <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800">
        <span className="text-4xl mr-3">🛰️</span>
        Satellite Analysis - {propertyName}
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={fetchNDVI}
          disabled={loading}
          className={`btn px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            activeView === 'ndvi' 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeView === 'ndvi' ? '⏳ Loading...' : '📊 NDVI Heatmap'}
        </button>
        <button
          onClick={fetchSatelliteImage}
          disabled={loading}
          className={`btn px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            activeView === 'satellite' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeView === 'satellite' ? '⏳ Loading...' : '🌍 Sentinel Image'}
        </button>
        <button
          onClick={showGoogleMap}
          disabled={loading}
          className={`btn px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            activeView === 'googlemap' 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeView === 'googlemap' ? '⏳ Loading...' : '🗺️ Google Maps Satellite'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl shadow-md mb-6 flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <strong className="font-bold">Error:</strong>
            <span className="block mt-1">{error}</span>
          </div>
        </div>
      )}

      {/* Health Status Banner */}
      {healthStatus && (
        <div className={`${healthStatus.bgColor} border-2 ${healthStatus.color} border-current rounded-xl p-6 mb-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">{healthStatus.icon}</span>
              <div>
                <h3 className={`text-2xl font-bold ${healthStatus.color}`}>
                  Field Health: {healthStatus.status}
                </h3>
                <p className="text-sm mt-1">{healthStatus.message}</p>
              </div>
            </div>
            {ndviStats && (
              <div className="text-right">
                <div className="text-3xl font-bold">{((ndviStats.healthyPixels / ndviStats.validPixels) * 100).toFixed(1)}%</div>
                <div className="text-sm">Healthy Coverage</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NDVI Data Display */}
      {activeView === 'ndvi' && ndviData && (
        <div>
          {/* NDVI Health Scale - pH Style */}
          {ndviStats && (
            <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
                🌱 Crop Health Indicator
              </h3>
              
              {/* pH-Style Scale */}
              <div className="relative">
                {/* Scale Bar */}
                <div className="h-16 rounded-full overflow-hidden shadow-lg flex">
                  <div className="flex-1 bg-gradient-to-r from-red-500 to-red-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-yellow-400 to-lime-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-lime-400 to-green-500"></div>
                  <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <div className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700"></div>
                </div>
                
                {/* Scale Labels */}
                <div className="flex justify-between mt-3 text-sm font-semibold text-gray-600">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
                
                {/* Pointer/Indicator */}
                <div 
                  className="absolute -top-2 transform -translate-x-1/2 transition-all duration-500"
                  style={{ 
                    left: `${Math.max(5, Math.min(95, ((ndviStats.mean + 1) / 2) * 100))}%`
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-20 bg-gray-800 shadow-lg"></div>
                    <div className="w-6 h-6 bg-gray-800 rounded-full border-4 border-white shadow-xl flex items-center justify-center -mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="mt-16 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl">
                      <div className="text-center">
                        <div className="text-xs font-semibold">Current NDVI</div>
                        <div className="text-2xl font-bold">{ndviStats.mean.toFixed(3)}</div>
                        <div className="text-xs mt-1">{healthStatus?.status}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Land Type Info */}
              <div className="mt-24 grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="font-bold text-green-700">Vegetation Health</div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {((ndviStats.healthyPixels / ndviStats.validPixels) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-bold text-blue-700">NDVI Range</div>
                  <div className="text-sm font-semibold text-blue-600 mt-2">
                    {ndviStats.min.toFixed(2)} to {ndviStats.max.toFixed(2)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">⚠️</div>
                  <div className="font-bold text-orange-700">Stressed Areas</div>
                  <div className="text-2xl font-bold text-orange-600 mt-2">
                    {((ndviStats.stressedPixels / ndviStats.validPixels) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* NDVI Heatmap Image - Larger */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-800">📊 NDVI Heatmap</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    Last 30 Days
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={`data:image/png;base64,${ndviData.ndviData}`}
                    alt="NDVI Heatmap"
                    className="w-full h-auto border-4 border-gray-200 rounded-lg shadow-md"
                    style={{ imageRendering: 'crisp-edges', maxHeight: '600px', objectFit: 'contain' }}
                  />
                  <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-lg shadow">
                    <p className="text-xs text-gray-600 font-medium">
                      📅 {ndviData.dateRange.from} to {ndviData.dateRange.to}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NDVI Statistics & Legend */}
            <div className="space-y-6">
              {/* NDVI Color Scale */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold mb-4 text-gray-800">🎨 NDVI Color Scale</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#006400' }}>
                    <span className="text-white font-semibold text-sm">NDVI &gt; 0.6</span>
                    <span className="text-white text-xs">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#32CD32' }}>
                    <span className="text-white font-semibold text-sm">0.4 - 0.6</span>
                    <span className="text-white text-xs">Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#FFD700' }}>
                    <span className="text-gray-800 font-semibold text-sm">0.2 - 0.4</span>
                    <span className="text-gray-800 text-xs">Fair</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#D2691E' }}>
                    <span className="text-white font-semibold text-sm">0.0 - 0.2</span>
                    <span className="text-white text-xs">Bare Soil</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: '#4169E1' }}>
                    <span className="text-white font-semibold text-sm">NDVI &lt; 0</span>
                    <span className="text-white text-xs">Water</span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h5 className="font-bold mb-3 text-blue-900 flex items-center">
                  <span className="mr-2">💡</span>
                  What is NDVI?
                </h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>NDVI</strong> (Normalized Difference Vegetation Index) measures plant health by analyzing 
                  how plants reflect near-infrared and red light. Values range from <strong>-1 to +1</strong>, 
                  where higher values indicate healthier, denser vegetation.
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h6 className="font-semibold text-sm text-blue-900 mb-2">🔍 Interpretation:</h6>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• <strong>Green zones:</strong> Healthy crops, good growth</li>
                    <li>• <strong>Yellow zones:</strong> Moderate stress, monitor closely</li>
                    <li>• <strong>Brown zones:</strong> Bare soil or stressed crops</li>
                    <li>• <strong>Blue zones:</strong> Water bodies or very low vegetation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Image Display */}
      {activeView === 'satellite' && satelliteImage && (
        <div>
          <h3 className="text-xl font-semibold mb-4">True Color Satellite Image</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={`data:image/png;base64,${satelliteImage.image}`}
                alt="Satellite Image"
                className="w-full border-2 border-gray-300 rounded"
              />
              <p className="text-sm text-gray-600 mt-2">
                Date Range: {satelliteImage.dateRange.from} to {satelliteImage.dateRange.to}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Image Details</h4>
              <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
                <p><strong>Property:</strong> {satelliteImage.propertyName}</p>
                <p><strong>Resolution:</strong> {satelliteImage.dimensions.width} x {satelliteImage.dimensions.height}px</p>
                <p><strong>Format:</strong> {satelliteImage.format}</p>
                <p><strong>Source:</strong> Sentinel-2 L2A (ESA)</p>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
                <h5 className="font-semibold mb-2">💡 Pro Tip:</h5>
                <p className="text-sm text-gray-700">
                  Use <strong>NDVI analysis</strong> for accurate crop health assessment. 
                  The true color image is useful for visual inspection of field conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Satellite View */}
      {activeView === 'googlemap' && propertyData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🗺️</span>
            Google Maps Satellite View
          </h3>
          <p className="text-gray-600 mb-4">
            High-resolution satellite imagery powered by Google Maps
          </p>
          <SatelliteMapView 
            propertyId={propertyId}
            propertyName={propertyName}
            coordinates={propertyData.location.coordinates}
          />
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold mb-2 flex items-center">
              <span className="mr-2">ℹ️</span>
              About Google Maps View
            </h5>
            <p className="text-sm text-gray-700">
              This interactive map uses <strong>Google Maps satellite imagery</strong> for better zoom levels 
              and clarity. You can zoom in/out, switch map types, and explore the surrounding area of your field.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!ndviData && !satelliteImage && !propertyData && !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-xl text-gray-600 mb-2">🛰️ No satellite data loaded</p>
          <p className="text-gray-500">Click a button above to fetch satellite imagery or NDVI analysis</p>
        </div>
      )}
    </div>
  );
}
