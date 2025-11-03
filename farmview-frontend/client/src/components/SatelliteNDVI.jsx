import { useState } from 'react';
import api from '../utils/api';

export default function SatelliteNDVI({ propertyId, propertyName }) {
  const [loading, setLoading] = useState(false);
  const [ndviData, setNdviData] = useState(null);
  const [satelliteImage, setSatelliteImage] = useState(null);
  const [activeView, setActiveView] = useState('ndvi'); // 'ndvi' or 'satellite'
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
      }
    } catch (err) {
      console.error('NDVI fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch NDVI data');
    } finally {
      setLoading(false);
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

  const getNDVIColor = (value) => {
    // Color mapping for NDVI values
    if (value >= 0.6) return '#006400'; // Dark green - Healthy
    if (value >= 0.3) return '#90EE90'; // Light green - Moderate
    if (value >= 0.1) return '#FFA500'; // Orange - Stressed
    return '#FF0000'; // Red - Damaged
  };

  const getNDVILabel = (value) => {
    if (value >= 0.6) return 'Healthy Vegetation';
    if (value >= 0.3) return 'Moderate Vegetation';
    if (value >= 0.1) return 'Stressed Vegetation';
    return 'Damaged/Bare Soil';
  };

  return (
    <div className="card p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">🛰️ Satellite Analysis - {propertyName}</h2>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchNDVI}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading && activeView === 'ndvi' ? '⏳ Loading...' : '📊 Fetch NDVI Data'}
        </button>
        <button
          onClick={fetchSatelliteImage}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading && activeView === 'satellite' ? '⏳ Loading...' : '🌍 Fetch Satellite Image'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* NDVI Data Display */}
      {activeView === 'ndvi' && ndviData && (
        <div>
          <h3 className="text-xl font-semibold mb-4">NDVI Crop Health Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NDVI Image */}
            <div>
              <h4 className="font-semibold mb-2">NDVI Heatmap</h4>
              <img
                src={`data:image/png;base64,${ndviData.ndviData}`}
                alt="NDVI Heatmap"
                className="w-full border-2 border-gray-300 rounded"
              />
              <p className="text-sm text-gray-600 mt-2">
                Date Range: {ndviData.dateRange.from} to {ndviData.dateRange.to}
              </p>
            </div>

            {/* NDVI Legend & Info */}
            <div>
              <h4 className="font-semibold mb-3">NDVI Scale & Interpretation</h4>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: '#006400' }}></div>
                  <span className="text-sm">NDVI &gt; 0.6: {ndviData.interpretation.high}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: '#90EE90' }}></div>
                  <span className="text-sm">NDVI 0.3-0.6: {ndviData.interpretation.medium}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: '#FFA500' }}></div>
                  <span className="text-sm">NDVI &lt; 0.3: {ndviData.interpretation.low}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: '#FF0000' }}></div>
                  <span className="text-sm">NDVI &lt; 0: {ndviData.interpretation.negative}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h5 className="font-semibold mb-2">Current Crop: {ndviData.currentCrop || 'N/A'}</h5>
                <p className="text-sm text-gray-700">
                  <strong>NDVI</strong> (Normalized Difference Vegetation Index) measures vegetation health 
                  by analyzing near-infrared and red light reflection from plants.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Green areas</strong> indicate healthy crops, while <strong>red areas</strong> show 
                  stress, damage, or bare soil.
                </p>
              </div>

              <div className="mt-4">
                <h5 className="font-semibold mb-2">🔍 Analysis Tips:</h5>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Compare with previous months to track changes</li>
                  <li>Red zones may need immediate attention</li>
                  <li>Use for insurance claim verification</li>
                  <li>Monitor regularly during growing season</li>
                </ul>
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

      {/* Empty State */}
      {!ndviData && !satelliteImage && !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-xl text-gray-600 mb-2">🛰️ No satellite data loaded</p>
          <p className="text-gray-500">Click a button above to fetch satellite imagery or NDVI analysis</p>
        </div>
      )}
    </div>
  );
}
