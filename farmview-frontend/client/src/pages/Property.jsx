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
import FarmTodo from '../components/FarmTodo';
import FloatingCalculator from '../components/FloatingCalculator';
import FloatingActionMenu from '../components/FloatingActionMenu';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Property() {
  const { t, i18n } = useTranslation();
  const mapRef = useRef(null);
  const drawLayerRef = useRef(null);
  const containerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India fallback
  const [polygon, setPolygon] = useState(null);
  const [area, setArea] = useState('');
  const [files, setFiles] = useState([]);
  const [propertyName, setPropertyName] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  const [isOtherCrop, setIsOtherCrop] = useState(false);
  const [soilType, setSoilType] = useState('Alluvial');
  const [irrigationType, setIrrigationType] = useState('Rainfed');
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // For satellite analysis

  // Crop recommendation states
  const [allCrops, setAllCrops] = useState([]);
  const [recommendedCrops, setRecommendedCrops] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

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

  // Fetch all available crops (1000+)
  const fetchAllCrops = async () => {
    try {
      const res = await api.get('/crops/all');
      if (res.data?.success) {
        setAllCrops(res.data.data);
        console.log(`✅ Loaded ${res.data.count} crops`);
      }
    } catch (err) {
      console.error('Failed to fetch crops', err);
    }
  };

  // Get crop recommendations based on property details
  const getCropRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setShowRecommendations(true);

      // Get center coordinates from polygon if available
      let latitude = center.lat;
      let longitude = center.lng;

      if (polygon && polygon.length > 0) {
        const lats = polygon.map(coord => coord[1]);
        const lngs = polygon.map(coord => coord[0]);
        latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
        longitude = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      }

      const res = await api.post('/crops/recommend', {
        soilType,
        irrigationType,
        latitude,
        longitude
      });

      if (res.data?.success) {
        setRecommendedCrops(res.data.data);
        console.log('✅ Got crop recommendations:', res.data.data.topRecommendations.length);
      }
    } catch (err) {
      console.error('Failed to get crop recommendations', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAllCrops();
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
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
              <FaMapMarkedAlt className="mr-3 text-primary-600" />
              {t('property.title')}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">{t('property.propertyDetails')}</p>
          </motion.div>

          {/* Property List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center justify-center sm:justify-start">
              <FaMapMarkedAlt className="mr-2 text-primary-600" />
              {t('property.title')}
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t('property.noProperties')}</h3>
                <p className="text-gray-600 mb-4">{t('property.startByCreating')}</p>
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
                              ✅ {t('property.verified')}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              ⏳ {t('property.pendingVerification')}
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
                          onClick={() => {
                            setSelectedProperty(prop);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="btn-primary w-full flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-transform duration-200"
                        >
                          <FaSatellite />
                          <span>{t('property.viewSatellite')}</span>
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
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <FaTimes className="text-base sm:text-xl" />
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center justify-center sm:justify-start">
              <FaPlus className="mr-2 text-primary-600" />
              {t('property.addProperty')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="card overflow-hidden p-0 sm:p-0">
                  <div id="property-map" className="h-[400px] sm:h-[500px] lg:h-[600px] w-full" />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="card bg-white p-5 sm:p-6">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-t-lg mb-6 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center">
                      <FaMapMarkedAlt className="mr-2" />
                      {t('property.propertyDetails')}
                    </h3>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaMapMarkedAlt className="mr-2 text-primary-600" />
                    {t('property.searchLocation')}
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
                      {searching ? (i18n.language === 'en' ? '🔍 Searching...' : '🔍 खोज रहे हैं...') : (i18n.language === 'en' ? '🔍 Search' : '🔍 खोजें')}
                    </motion.button>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700">{t('property.propertyName')} *</label>
                  <input
                    value={propertyName}
                    onChange={e => setPropertyName(e.target.value)}
                    className="input-field mb-4"
                    placeholder="e.g., North Field, Rice Paddy"
                  />

                  <label className="block mb-2 font-medium text-gray-700">{t('property.calculatedArea')}</label>
                  <div className="mb-4 p-3 bg-primary-50 border-2 border-primary-200 rounded-lg text-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {area || t('property.drawPolygon')}
                    </span>
                  </div>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaLeaf className="mr-2 text-green-600" />
                    {t('property.currentCrop')}
                  </label>
                  <div className="space-y-3 mb-4">
                    <select
                      value={isOtherCrop ? 'other' : currentCrop}
                      onChange={e => {
                        if (e.target.value === 'other') {
                          setIsOtherCrop(true);
                          setCurrentCrop('');
                        } else {
                          setIsOtherCrop(false);
                          setCurrentCrop(e.target.value);
                        }
                      }}
                      className="input-field w-full"
                    >
                      <option value="">{t('common.selectCrop')}</option>
                      <optgroup label="Common Crops">
                        <option value="Wheat">{t('calculator.crops.wheat')}</option>
                        <option value="Rice (Paddy)">{t('calculator.crops.rice')}</option>
                        <option value="Cotton">{t('calculator.crops.cotton')}</option>
                        <option value="Sugarcane">{t('calculator.crops.sugarcane')}</option>
                        <option value="Maize">{t('calculator.crops.maize')}</option>
                      </optgroup>
                      <option value="other">🔍 Other (Search 1000+ Crops)...</option>
                    </select>

                    {isOtherCrop && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="relative"
                      >
                        <input
                          value={currentCrop}
                          onChange={e => setCurrentCrop(e.target.value)}
                          className="input-field w-full"
                          placeholder={t('property.currentCrop')}
                          list="crop-suggestions"
                          autoComplete="off"
                        />
                        <datalist id="crop-suggestions">
                          {allCrops.map((crop, index) => (
                            <option key={index} value={crop} />
                          ))}
                        </datalist>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {t('property.cropSuggestions')}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaMountain className="mr-2 text-amber-700" />
                    {t('property.soilType')}
                  </label>
                  <select
                    value={soilType}
                    onChange={e => setSoilType(e.target.value)}
                    className="input-field mb-4"
                  >
                    <option value="Alluvial">{t('property.soilTypes.alluvial')}</option>
                    <option value="Black">{t('property.soilTypes.black')}</option>
                    <option value="Red">{t('property.soilTypes.red')}</option>
                    <option value="Laterite">{t('property.soilTypes.laterite')}</option>
                    <option value="Desert">{t('property.soilTypes.desert')}</option>
                    <option value="Mountain">{t('property.soilTypes.mountain')}</option>
                    <option value="Other">{t('property.soilTypes.other')}</option>
                  </select>

                  <label className="block mb-2 font-medium text-gray-700 flex items-center">
                    <FaTint className="mr-2 text-cyan-600" />
                    {t('property.irrigationType')}
                  </label>
                  <select
                    value={irrigationType}
                    onChange={e => setIrrigationType(e.target.value)}
                    className="input-field mb-4"
                  >
                    <option value="Rainfed">{t('property.irrigationTypes.rainfed')}</option>
                    <option value="Drip">{t('property.irrigationTypes.drip')}</option>
                    <option value="Sprinkler">{t('property.irrigationTypes.sprinkler')}</option>
                    <option value="Other">{t('property.irrigationTypes.other')}</option>
                  </select>

                  {/* Crop Recommendation Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getCropRecommendations}
                    disabled={loadingRecommendations || !soilType || !irrigationType}
                    className="w-full mb-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingRecommendations ? (
                      <>
                        <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('property.gettingRecommendations')}</span>
                      </>
                    ) : (
                      <>
                        <FaLeaf />
                        <span>{t('property.cropRecommendations')}</span>
                      </>
                    )}
                  </motion.button>

                  {/* Crop Recommendations Display */}
                  {showRecommendations && recommendedCrops && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-green-800 flex items-center">
                          <span className="mr-2">🌾</span>
                          {t('property.topRecommended')}
                        </h4>
                        <button
                          onClick={() => setShowRecommendations(false)}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Climate & Soil Info */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white p-3 rounded-lg shadow text-center">
                          <div className="text-2xl mb-1">🌡️</div>
                          <div className="text-xs text-gray-600">Climate</div>
                          <div className="font-bold text-green-700 capitalize">{recommendedCrops.climateZone}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow text-center">
                          <div className="text-2xl mb-1">🏔️</div>
                          <div className="text-xs text-gray-600">Soil</div>
                          <div className="font-bold text-amber-700">{recommendedCrops.soilType}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow text-center">
                          <div className="text-2xl mb-1">💧</div>
                          <div className="text-xs text-gray-600">Irrigation</div>
                          <div className="font-bold text-cyan-700">{recommendedCrops.irrigationType}</div>
                        </div>
                      </div>

                      {/* Top 10 Recommendations */}
                      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
                        <h5 className="font-bold text-green-700 mb-3">✨ Best Matches:</h5>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {recommendedCrops.topRecommendations.slice(0, 20).map((rec, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentCrop(rec.crop)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${currentCrop === rec.crop
                                ? 'border-green-500 bg-green-100'
                                : 'border-gray-200 hover:border-green-300 bg-white'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-sm">{rec.crop}</div>
                                  <div className={`text-xs ${rec.suitability === 'Excellent' ? 'text-green-600' :
                                    rec.suitability === 'Good' ? 'text-blue-600' :
                                      'text-yellow-600'
                                    }`}>
                                    {rec.suitability === 'Excellent' ? '⭐⭐⭐' :
                                      rec.suitability === 'Good' ? '⭐⭐' : '⭐'}
                                    {' '}{rec.suitability}
                                  </div>
                                </div>
                                <div className="text-2xl">
                                  {index < 3 ? '🏆' : index < 10 ? '🥇' : '✅'}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Category-wise Recommendations */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 shadow">
                          <h6 className="font-bold text-xs text-gray-700 mb-2">🌾 Cereals</h6>
                          <div className="space-y-1">
                            {recommendedCrops.categoryRecommendations.cereals.slice(0, 3).map((rec, i) => (
                              <div key={i} className="text-xs text-gray-600 cursor-pointer hover:text-green-600" onClick={() => setCurrentCrop(rec.crop)}>
                                • {rec.crop}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow">
                          <h6 className="font-bold text-xs text-gray-700 mb-2">🥬 Vegetables</h6>
                          <div className="space-y-1">
                            {recommendedCrops.categoryRecommendations.vegetables.slice(0, 3).map((rec, i) => (
                              <div key={i} className="text-xs text-gray-600 cursor-pointer hover:text-green-600" onClick={() => setCurrentCrop(rec.crop)}>
                                • {rec.crop}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow">
                          <h6 className="font-bold text-xs text-gray-700 mb-2">🍎 Fruits</h6>
                          <div className="space-y-1">
                            {recommendedCrops.categoryRecommendations.fruits.slice(0, 3).map((rec, i) => (
                              <div key={i} className="text-xs text-gray-600 cursor-pointer hover:text-green-600" onClick={() => setCurrentCrop(rec.crop)}>
                                • {rec.crop}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow">
                          <h6 className="font-bold text-xs text-gray-700 mb-2">🌶️ Spices</h6>
                          <div className="space-y-1">
                            {recommendedCrops.categoryRecommendations.spices.slice(0, 3).map((rec, i) => (
                              <div key={i} className="text-xs text-gray-600 cursor-pointer hover:text-green-600" onClick={() => setCurrentCrop(rec.crop)}>
                                • {rec.crop}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-gray-600 text-center">
                        Analyzed {recommendedCrops.totalAnalyzed} crops • Click any crop to select
                      </div>
                    </motion.div>
                  )}

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
                              <span className="font-bold text-green-800">{t('property.verified')}</span>
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
                            <span className="font-bold text-yellow-800">{t('property.noVerifiedDocs')}</span>
                          </div>
                          <p className="text-xs text-yellow-700 mb-2">
                            {t('property.verifyDocsWarning')}
                          </p>
                          <a
                            href="/documents"
                            className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                          >
                            → {t('property.verifyNow')}
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
                        <span>{t('property.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        <span>{t('property.createProperty')}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Chatbot */}
      {/* Floating Action Menu */}
      <FloatingActionMenu />

      <Footer />
    </div>
  );
}
