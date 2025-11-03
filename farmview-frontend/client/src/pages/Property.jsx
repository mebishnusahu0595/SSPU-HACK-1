import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaMapMarkedAlt, FaPlus, FaTimes, FaSatellite, FaLeaf, FaTint, FaMountain } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import api from '../utils/api';
import SatelliteNDVI from '../components/SatelliteNDVI';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Property() {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const drawLayerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India fallback
  const [polygon, setPolygon] = useState(null);
  const [area, setArea] = useState('');
  const [files, setFiles] = useState([]);
  const [propertyName, setPropertyName] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  const [soilType, setSoilType] = useState('Alluvial');
  const [irrigationType, setIrrigationType] = useState('Rainfed');
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // For satellite analysis

  // Fetch all properties for the farmer
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('Fetching properties...');
      const res = await api.get('/property');
      console.log('Properties response:', res.data);
      if (res.data?.data) {
        setProperties(res.data.data);
        console.log('Properties set:', res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('property-map').setView([center.lat, center.lng], 6);
      
      // Base layers
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });

      const hybridLayer = L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }),
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          opacity: 0.3
        })
      ]);

      // Add default layer
      streetLayer.addTo(map);

      // Layer control
      const baseMaps = {
        "Street Map": streetLayer,
        "Satellite": satelliteLayer,
        "Hybrid": hybridLayer
      };

      L.control.layers(baseMaps).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawLayerRef.current = drawnItems;

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          polyline: false,
          rectangle: true,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e) => {
        // Remove existing
        drawnItems.clearLayers();
        const layer = e.layer;
        drawnItems.addLayer(layer);
        const latlngs = layer.getLatLngs();
        setPolygon(latlngs);
        const centroid = computeCentroid(latlngs[0]);
        setCenter({ lat: centroid.lat, lng: centroid.lng });
        setArea(formatArea(calcPolygonArea(latlngs[0])));
      });

      map.on('draw:edited', (e) => {
        const layers = e.layers;
        layers.eachLayer(layer => {
          const latlngs = layer.getLatLngs();
          setPolygon(latlngs);
          const centroid = computeCentroid(latlngs[0]);
          setCenter({ lat: centroid.lat, lng: centroid.lng });
          setArea(formatArea(calcPolygonArea(latlngs[0])));
        });
      });

      mapRef.current = map;
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView([center.lat, center.lng], 14);
    }
  }, [center]);

  // Simple geocode using Nominatim
  async function geocodeAddress() {
    if (!address) return;
    setSearching(true);
    try {
      const q = encodeURIComponent(address);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
      const data = await res.json();
      if (data && data.length) {
        const place = data[0];
        setCenter({ lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
        mapRef.current.setView([parseFloat(place.lat), parseFloat(place.lon)], 16);
      }
    } catch (err) {
      console.error('Geocode error', err);
    } finally {
      setSearching(false);
    }
  }

  function handleFiles(e) {
    setFiles(Array.from(e.target.files));
  }

  function computeCentroid(latlngs) {
    let sumX = 0, sumY = 0;
    latlngs.forEach(p => { sumX += p.lat; sumY += p.lng; });
    return { lat: sumX / latlngs.length, lng: sumY / latlngs.length };
  }

  // approximate area in hectares using equirectangular projection
  function calcPolygonArea(latlngs) {
    if (!latlngs || latlngs.length < 3) return 0;
    const R = 6371000; // meters
    const coords = latlngs.map(p => [p.lat * Math.PI / 180, p.lng * Math.PI / 180]);
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[(i + 1) % coords.length];
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs(area) * (R * R) / 2.0; // in m^2
    return area / 10000; // hectares
  }

  function formatArea(ha) {
    if (!ha) return '0 ha';
    if (ha < 1) return `${(ha * 10000).toFixed(0)} m²`;
    return `${ha.toFixed(2)} ha`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!polygon || polygon.length === 0) {
      alert('Please draw your field boundary on the map');
      return;
    }

    // Check for verified documents
    const lastVerified = localStorage.getItem('lastVerifiedDocument');
    if (!lastVerified) {
      const confirmProceed = window.confirm(
        '⚠️ No verified documents found!\n\n' +
        'For fraud prevention, we recommend verifying your land documents using AI verification in the Documents page.\n\n' +
        'Do you want to proceed without verification?'
      );
      if (!confirmProceed) {
        alert('Please verify your documents first from the Documents page.');
        return;
      }
    } else {
      const verifiedData = JSON.parse(lastVerified);
      const verifiedTime = new Date(verifiedData.timestamp);
      const now = new Date();
      const hoursDiff = (now - verifiedTime) / (1000 * 60 * 60);
      
      // Check if verification is older than 24 hours
      if (hoursDiff > 24) {
        const confirmProceed = window.confirm(
          '⚠️ Your document verification is older than 24 hours.\n\n' +
          'We recommend re-verifying your documents for security.\n\n' +
          'Do you want to proceed anyway?'
        );
        if (!confirmProceed) {
          alert('Please re-verify your documents from the Documents page.');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('propertyName', propertyName || `Field ${new Date().toISOString()}`);
      formData.append('area', (calcPolygonArea(polygon[0]) || 0).toString());
      formData.append('areaUnit', 'hectares');
      
      // Add verification data if available
      const lastVerifiedDoc = localStorage.getItem('lastVerifiedDocument');
      if (lastVerifiedDoc) {
        const verifiedData = JSON.parse(lastVerifiedDoc);
        formData.append('verificationMethod', 'ocr-ai');
        formData.append('verificationScore', verifiedData.verificationScore || 0);
        formData.append('documentVerificationStatus', 'verified');
        formData.append('extractedDocumentData', JSON.stringify(verifiedData.extractedFields || {}));
        
        // Pre-fill from verified document if fields are empty
        if (verifiedData.extractedFields) {
          if (!propertyName && verifiedData.extractedFields.surveyNumber) {
            formData.set('propertyName', `Survey ${verifiedData.extractedFields.surveyNumber}`);
          }
        }
      } else {
        formData.append('verificationMethod', 'manual');
        formData.append('documentVerificationStatus', 'pending');
      }
      
      // Close the polygon by adding first point at the end (GeoJSON requirement)
      const coords = polygon[0].map(p => [p.lng, p.lat]);
      if (coords.length > 0) {
        coords.push(coords[0]); // Close the polygon
      }
      
      formData.append('coordinates', JSON.stringify([coords]));
      const centroid = computeCentroid(polygon[0]);
      formData.append('latitude', centroid.lat);
      formData.append('longitude', centroid.lng);
      formData.append('address', JSON.stringify({ address }));
      formData.append('soilType', soilType);
      formData.append('currentCrop', currentCrop);
      formData.append('irrigationType', irrigationType);

      files.forEach(f => formData.append('documents', f));

      const res = await api.post('/property', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        alert('✅ Property registered successfully!');
        
        // Clear verification data after successful registration
        localStorage.removeItem('lastVerifiedDocument');
        
        // Refresh property list and reset form
        await fetchProperties();
        setPropertyName('');
        setCurrentCrop('');
        setFiles([]);
        setPolygon(null);
        setArea('');
        if (drawLayerRef.current) {
          drawLayerRef.current.clearLayers();
        }
      } else {
        alert('Failed to create property');
      }

    } catch (err) {
      console.error('Submit error', err);
      alert(err.response?.data?.message || err.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              <FaMapMarkedAlt className="mr-3 text-primary-600" />
              Property Management
            </h1>
            <p className="text-gray-600">Manage your farm properties and view satellite analysis</p>
          </motion.div>

          {/* Property List Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaMapMarkedAlt className="mr-2 text-primary-600" />
              My Properties
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner w-12 h-12" />
              </div>
            ) : properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-gradient-to-br from-primary-50 to-secondary-50 p-8 text-center"
              >
                <FaMapMarkedAlt className="text-6xl text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first property below</p>
                <FaPlus className="text-primary-600 mx-auto text-3xl" />
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop, index) => (
                  <motion.div
                    key={prop._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative"
                  >
                    <div className="card bg-white hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full">
                      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-4 rounded-t-lg">
                        <h3 className="text-xl font-bold mb-1">{prop.propertyName}</h3>
                        <div className="flex items-center text-sm text-primary-100">
                          {prop.isVerified ? (
                            <span className="flex items-center">
                              ✅ Verified
                            </span>
                          ) : (
                            <span className="flex items-center">
                              ⏳ Pending Verification
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-center text-gray-700">
                          <FaLeaf className="text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-sm"><strong>Crop:</strong> {prop.currentCrop || 'Not specified'}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <FaMapMarkedAlt className="text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-sm"><strong>Area:</strong> {prop.area?.value ? `${prop.area.value.toFixed(2)} ${prop.area.unit || 'ha'}` : 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <FaMountain className="text-amber-700 mr-2 flex-shrink-0" />
                          <span className="text-sm"><strong>Soil:</strong> {prop.soilType}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <FaTint className="text-cyan-600 mr-2 flex-shrink-0" />
                          <span className="text-sm"><strong>Irrigation:</strong> {prop.irrigationType}</span>
                        </div>
                        
                        {prop.centerCoordinates?.latitude && prop.centerCoordinates?.longitude && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            📍 {prop.centerCoordinates.latitude.toFixed(4)}, {prop.centerCoordinates.longitude.toFixed(4)}
                          </div>
                        )}
                        
                        {prop.documents && prop.documents.length > 0 && (
                          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            📄 {prop.documents.length} document(s) attached
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => setSelectedProperty(prop)}
                          className="btn-primary w-full flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-transform duration-200"
                        >
                          <FaSatellite />
                          <span>View Satellite Analysis</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Satellite Analysis Section */}
          {selectedProperty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 relative"
            >
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <FaTimes className="text-xl" />
              </button>
              <SatelliteNDVI
                propertyId={selectedProperty._id}
                propertyName={selectedProperty.propertyName}
              />
            </motion.div>
          )}

          {/* Create Property Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaPlus className="mr-2 text-primary-600" />
              Add New Property
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="card overflow-hidden">
                  <div id="property-map" style={{ height: '600px' }} />
                </div>
              </div>

              <div className="col-span-1">
                <div className="card bg-white">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-t-lg mb-4 -m-6 mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <FaMapMarkedAlt className="mr-2" />
                      Property Details
                    </h3>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaMapMarkedAlt className="mr-2 text-primary-600" />
                    Search Location
                  </label>
                  <div className="flex mb-4">
                    <input 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="flex-1 input-field" 
                      placeholder="Type address (e.g., Mumbai, Maharashtra)" 
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={geocodeAddress}
                      disabled={searching}
                      className="btn-outline ml-2 px-4"
                    >
                      {searching ? '🔍 Searching...' : '🔍 Search'}
                    </motion.button>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700">Property Name *</label>
                  <input 
                    value={propertyName} 
                    onChange={e => setPropertyName(e.target.value)} 
                    className="input-field mb-4" 
                    placeholder="e.g., North Field, Rice Paddy" 
                  />

                  <label className="block mb-2 font-medium text-gray-700">Calculated Area</label>
                  <div className="mb-4 p-3 bg-primary-50 border-2 border-primary-200 rounded-lg text-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {area || '📐 Draw polygon on map'}
                    </span>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaLeaf className="mr-2 text-green-600" />
                    Current Crop
                  </label>
                  <input 
                    value={currentCrop} 
                    onChange={e => setCurrentCrop(e.target.value)} 
                    className="input-field mb-4" 
                    placeholder="e.g., Wheat, Rice, Cotton" 
                  />

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaMountain className="mr-2 text-amber-700" />
                    Soil Type
                  </label>
                  <select 
                    value={soilType} 
                    onChange={e => setSoilType(e.target.value)} 
                    className="input-field mb-4"
                  >
                    <option>Alluvial</option>
                    <option>Black</option>
                    <option>Red</option>
                    <option>Laterite</option>
                    <option>Desert</option>
                    <option>Mountain</option>
                    <option>Other</option>
                  </select>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaTint className="mr-2 text-cyan-600" />
                    Irrigation Type
                  </label>
                  <select 
                    value={irrigationType} 
                    onChange={e => setIrrigationType(e.target.value)} 
                    className="input-field mb-4"
                  >
                    <option>Rainfed</option>
                    <option>Drip</option>
                    <option>Sprinkler</option>
                    <option>Other</option>
                  </select>

              <label className="block mb-2 font-medium text-gray-700">Property Papers (images/PDF, max 5)</label>
              <input type="file" multiple onChange={handleFiles} className="mb-4 text-sm" accept="image/*,.pdf" />

              {/* Document Verification Status */}
              {(() => {
                const lastVerified = localStorage.getItem('lastVerifiedDocument');
                if (lastVerified) {
                  const verifiedData = JSON.parse(lastVerified);
                  return (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">✅</span>
                          <span className="font-bold text-green-800">Document Verified</span>
                        </div>
                        <span className="text-sm font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                          {verifiedData.verificationScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-green-700">
                        Your documents have been verified by AI. You can now register your property securely.
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">⚠️</span>
                        <span className="font-bold text-yellow-800">No Verified Documents</span>
                      </div>
                      <p className="text-xs text-yellow-700 mb-2">
                        We recommend verifying your land documents using AI for fraud prevention.
                      </p>
                      <a 
                        href="/documents" 
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                      >
                        → Verify Documents Now
                      </a>
                    </div>
                  );
                }
              })()}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="spinner w-5 h-5" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>Create Property</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
