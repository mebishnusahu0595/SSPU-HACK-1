import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudSun, FaTemperatureHigh, FaTint, FaWind, FaCompass, FaSun, FaBrain } from 'react-icons/fa';
import { WiHumidity, WiBarometer } from 'react-icons/wi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Weather() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => { fetchProperties(); }, []);

  async function fetchProperties() {
    try {
      const res = await api.get('/property');
      if (res.data?.success) setProperties(res.data.data || []);
    } catch (err) {
      console.error('Fetch props', err);
      toast.error('Failed to load properties');
    }
  }

  async function fetchWeatherFor(prop) {
    if (!prop) return;
    setLoading(true);
    setWeather(null);
    setPrediction(null);
    try {
      const lat = prop.centerCoordinates.latitude;
      const lon = prop.centerCoordinates.longitude;
      const res = await api.get('/weather/current', { params: { latitude: lat, longitude: lon } });
      if (res.data?.success) {
        setWeather(res.data.data);
        setSelected(prop);
        toast.success('Weather loaded!');
      }
    } catch (err) {
      console.error('Weather fetch', err);
      toast.error('Failed to fetch weather');
    } finally { setLoading(false); }
  }

  async function runPrediction() {
    if (!selected || !weather) {
      toast.error('Select property and load weather first');
      return;
    }
    setPredicting(true);
    try {
      const payload = {
        cropType: selected.currentCrop || 'Unknown',
        temperature: weather.current.temperature,
        rainfall: 0,
        humidity: weather.current.humidity,
        soilType: selected.soilType || 'Loamy',
        irrigationType: selected.irrigationType || 'Rainfed'
      };
      const res = await api.post('/alerts/predict', payload);
      if (res.data?.success) {
        setPrediction(res.data.data);
        toast.success('ML prediction completed!');
      }
    } catch (err) {
      console.error('Predict', err);
      toast.error('Prediction failed');
    } finally { setPredicting(false); }
  }

  const getWeatherIcon = (temp) => {
    if (temp >= 30) return <FaSun className="text-yellow-500 text-6xl" />;
    return <FaCloudSun className="text-blue-500 text-6xl" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              <FaCloudSun className="mr-3 text-blue-600" />Weather Monitoring
            </h1>
            <p className="text-gray-600">Real-time weather and AI predictions</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card bg-white sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FaCompass className="mr-2 text-green-600" />Your Properties</h2>
                {properties.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-600 mb-4">No properties found</p><p className="text-sm text-gray-500">Add a property first</p></div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {properties.map((p, index) => (
                      <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl cursor-pointer transition-all ${selected?._id === p._id ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => fetchWeatherFor(p)}>
                        <div className="font-semibold text-lg mb-1">{p.propertyName}</div>
                        <div className={`text-sm ${selected?._id === p._id ? 'text-primary-100' : 'text-gray-600'}`}>{p.area?.value} {p.area?.unit}</div>
                        {p.currentCrop && <div className={`text-sm mt-1 ${selected?._id === p._id ? 'text-white' : 'text-green-600'}`}>🌾 {p.currentCrop}</div>}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                  {loading ? (
                    <div className="flex justify-center py-20"><div className="spinner w-12 h-12 border-white" /></div>
                  ) : weather ? (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div><h2 className="text-3xl font-bold mb-2">{weather.location.name}, {weather.location.country}</h2><p className="text-blue-100 text-lg">{selected?.propertyName}</p></div>
                        {getWeatherIcon(weather.current.temperature)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"><FaTemperatureHigh className="text-4xl mx-auto mb-2" /><p className="text-5xl font-bold">{weather.current.temperature}°C</p><p className="text-blue-100 text-sm mt-1">Temperature</p></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"><WiHumidity className="text-5xl mx-auto mb-2" /><p className="text-4xl font-bold">{weather.current.humidity}%</p><p className="text-blue-100 text-sm mt-1">Humidity</p></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"><FaWind className="text-4xl mx-auto mb-2" /><p className="text-4xl font-bold">{weather.current.windSpeed}</p><p className="text-blue-100 text-sm mt-1">Wind (m/s)</p></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"><WiBarometer className="text-5xl mx-auto mb-2" /><p className="text-4xl font-bold">{weather.current.pressure || 'N/A'}</p><p className="text-blue-100 text-sm mt-1">Pressure</p></div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4"><p className="text-lg font-semibold mb-2">{weather.current.weather.description}</p></div>
                    </>
                  ) : (
                    <div className="text-center py-20"><FaCloudSun className="text-8xl mx-auto mb-4 opacity-50" /><p className="text-xl mb-2">Select a property to view weather</p><p className="text-blue-100">Choose from your properties</p></div>
                  )}
                </div>

                {weather && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center"><FaBrain className="mr-2 text-purple-600" />AI Crop Prediction</h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runPrediction} disabled={predicting} className="btn-primary px-6 py-3 disabled:opacity-50 flex items-center space-x-2">{predicting ? <><div className="spinner w-5 h-5" /><span>Predicting...</span></> : <><FaBrain /><span>Run Prediction</span></>}</motion.button>
                    </div>
                    {prediction ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6"><h4 className="text-lg font-bold text-gray-800 mb-4">Prediction Results</h4><pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm">{JSON.stringify(prediction, null, 2)}</pre></motion.div>
                    ) : (
                      <div className="text-center py-8 text-gray-600"><FaBrain className="text-5xl mx-auto mb-3 text-gray-300" /><p>Click "Run Prediction" to analyze conditions</p><p className="text-sm text-gray-500 mt-2">ML-powered farming insights</p></div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      <Footer />
    </div>
  );
}
