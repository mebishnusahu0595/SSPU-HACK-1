import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudSun, FaTemperatureHigh, FaTint, FaWind, FaCompass, FaSun, FaBrain, FaExclamationTriangle, FaLightbulb, FaClock } from 'react-icons/fa';
import { WiHumidity, WiBarometer } from 'react-icons/wi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import FarmTodo from '../components/FarmTodo';
import FloatingCalculator from '../components/FloatingCalculator';
import FloatingActionMenu from '../components/FloatingActionMenu';
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
      toast.error(t('common.error') || 'Failed to load properties');
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
        // Robust smooth scroll to top
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        toast.success(t('weather.weatherLoaded'));
      }
    } catch (err) {
      console.error('Weather fetch', err);
      toast.error(t('common.error') || 'Failed to fetch weather');
    } finally { setLoading(false); }
  }

  async function runPrediction() {
    if (!selected || !weather) {
      toast.error(t('weather.selectProperty'));
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
        toast.success(t('weather.predictionCompleted'));
      }
    } catch (err) {
      console.error('Predict', err);
      toast.error(t('common.error') || 'Prediction failed');
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
              <FaCloudSun className="mr-3 text-blue-600" />{t('weather.title')}
            </h1>
            <p className="text-gray-600">{t('weather.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card bg-white lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FaCompass className="mr-2 text-green-600" />{t('weather.yourProperties')}</h2>
                {properties.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-600 mb-4">{t('weather.noProperties')}</p><p className="text-sm text-gray-500">{t('weather.addPropertyFirst')}</p></div>
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
                <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl p-6 sm:p-8">
                  {loading ? (
                    <div className="flex justify-center py-20"><div className="spinner w-12 h-12 border-white" /></div>
                  ) : weather ? (
                    <>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <div>
                          <h2 className="text-2xl sm:text-4xl font-black mb-1">{weather.location.name}</h2>
                          <div className="flex items-center space-x-2 text-blue-100 font-bold">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{weather.location.country}</span>
                            <span className="text-sm">• {selected?.propertyName}</span>
                          </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                          {getWeatherIcon(weather.current.temperature)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                          <FaTemperatureHigh className="text-2xl sm:text-3xl mx-auto mb-2 opacity-80" />
                          <p className="text-3xl sm:text-4xl font-black">{weather.current.temperature}°C</p>
                          <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase mt-1">Temp</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                          <WiHumidity className="text-3xl sm:text-4xl mx-auto mb-2 opacity-80" />
                          <p className="text-3xl sm:text-4xl font-black">{weather.current.humidity}%</p>
                          <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase mt-1">Humidity</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                          <FaWind className="text-2xl sm:text-3xl mx-auto mb-2 opacity-80" />
                          <p className="text-2xl sm:text-3xl font-black">{weather.current.windSpeed}</p>
                          <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase mt-1">Wind m/s</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                          <WiBarometer className="text-3xl sm:text-4xl mx-auto mb-2 opacity-80" />
                          <p className="text-2xl sm:text-3xl font-black">{weather.current.pressure || '0'}</p>
                          <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase mt-1">hPa</p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <p className="text-base sm:text-lg font-bold flex items-center">
                          <span className="mr-2">✨</span> {weather.current.weather.description}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <FaCloudSun className="text-7xl sm:text-9xl mx-auto mb-6 opacity-30 animate-pulse" />
                      <p className="text-xl sm:text-2xl font-bold mb-2">{t('weather.selectProperty')}</p>
                      <p className="text-blue-100 text-sm">{t('weather.tapToLoad')}</p>
                    </div>
                  )}
                </div>

                {weather && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center"><FaBrain className="mr-2 text-purple-600" />{t('weather.aiPrediction')}</h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runPrediction} disabled={predicting} className="btn-primary px-6 py-3 disabled:opacity-50 flex items-center space-x-2">{predicting ? <><div className="spinner w-5 h-5" /><span>{t('weather.predicting')}</span></> : <><FaBrain /><span>{t('weather.runPrediction')}</span></>}</motion.button>
                    </div>
                    {prediction ? (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Summary Header */}
                        <div className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${prediction.riskAssessment.riskLevel === 'High' ? 'bg-red-50 border-red-200' :
                          prediction.riskAssessment.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                          <div className="text-center sm:text-left">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('weather.riskAssessment')}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                              <h4 className={`text-4xl font-black ${prediction.riskAssessment.riskLevel === 'High' ? 'text-red-600' :
                                prediction.riskAssessment.riskLevel === 'Medium' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>{prediction.riskAssessment.riskLevel}</h4>
                              <span className="text-gray-400 text-2xl font-light">|</span>
                              <p className="text-lg font-bold text-gray-700">{prediction.predictedDamage}</p>
                            </div>
                          </div>
                          <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/50 text-center shadow-sm">
                            <p className="text-xs font-bold text-gray-500 mb-1 uppercase">{t('weather.aiConfidence')}</p>
                            <p className="text-3xl font-black text-primary-600">{(prediction.riskAssessment.confidenceScore * 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        {/* Alerts Section */}
                        {prediction.alerts?.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-bold text-gray-800 flex items-center text-lg"><FaExclamationTriangle className="mr-2 text-red-500" /> {t('weather.activeAlerts')}</h5>
                            {prediction.alerts.map((alert, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-white border-l-8 border-red-500 shadow-sm rounded-xl flex items-start gap-4"
                              >
                                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                  <FaExclamationTriangle />
                                </div>
                                <div>
                                  <p className="font-black text-red-700 text-sm uppercase mb-1">{alert.type}: {alert.severity}</p>
                                  <p className="text-gray-700 leading-relaxed font-medium">{alert.message}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Recommendations */}
                        <div className="space-y-4">
                          <h5 className="font-bold text-gray-800 flex items-center text-lg"><FaLightbulb className="mr-2 text-yellow-500" /> {t('weather.recommendations')}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prediction.recommendations.map((rec, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${rec.priority === 'High' ? 'bg-red-600 text-white' :
                                    rec.priority === 'Medium' ? 'bg-yellow-500 text-white' :
                                      'bg-green-600 text-white'
                                    }`}>{rec.priority} PRIORITY</span>
                                  <span className="text-[10px] text-gray-500 flex items-center font-bold uppercase"><FaClock className="mr-1" /> {rec.timeframe}</span>
                                </div>
                                <h6 className="font-bold text-gray-800 text-lg mb-2">{rec.action}</h6>
                                <p className="text-sm text-gray-600 leading-relaxed italic">{rec.details}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Detailed Risk Score Breakdown */}
                        <div className="bg-gray-100/50 p-6 rounded-2xl border border-gray-200">
                          <h5 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">{t('weather.scientificBreakdown')}</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(prediction.riskAssessment.individualRisks).map(([key, data]) => (
                              <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <div className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</div>
                                <div className="flex flex-col items-center">
                                  <span className="text-2xl font-black text-gray-800 mb-1">{data.score}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${data.level === 'High' ? 'bg-red-100 text-red-600' :
                                    data.level === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                      'bg-green-100 text-green-600'
                                    }`}>{data.level}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8 text-gray-600"><FaBrain className="text-5xl mx-auto mb-3 text-gray-300" /><p>{t('weather.aiPrediction')}</p><p className="text-sm text-gray-500 mt-2">ML-powered farming insights</p></div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Menu */}
      <FloatingActionMenu />

      <Footer />
    </div>
  );
}
