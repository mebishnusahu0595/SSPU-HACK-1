import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFileAlt, FaMapMarkedAlt, FaShieldAlt, FaCloudSun, FaTrophy, FaCheckCircle, FaClock, FaCalculator } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import FarmTodo from '../components/FarmTodo';
import FloatingCalculator from '../components/FloatingCalculator';
import FloatingActionMenu from '../components/FloatingActionMenu';
import api from '../utils/api';

export default function Dashboard() {
  const { t } = useTranslation();
  const { farmer } = useAuthStore();
  const [stats, setStats] = useState({
    properties: 0,
    insurance: 0,
    documents: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, insuranceRes, documentsRes] = await Promise.all([
        api.get('/property').catch(() => ({ data: { data: [] } })),
        api.get('/insurance').catch(() => ({ data: { data: [] } })),
        api.get('/documents').catch(() => ({ data: { data: [] } }))
      ]);

      setStats({
        properties: propertiesRes.data?.data?.length || 0,
        insurance: insuranceRes.data?.data?.length || 0,
        documents: documentsRes.data?.data?.length || 0
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('/activity?limit=5');
      if (response.data?.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  };

  const quickActions = [
    {
      icon: <FaFileAlt className="text-4xl" />,
      title: t('nav.documents'),
      path: '/documents',
      color: 'from-blue-500 to-blue-600',
      description: t('nav.documents')
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: t('nav.property'),
      path: '/property',
      color: 'from-green-500 to-green-600',
      description: t('nav.property')
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: t('nav.insurance'),
      path: '/insurance',
      color: 'from-purple-500 to-purple-600',
      description: t('nav.insurance')
    },
    {
      icon: <FaCloudSun className="text-4xl" />,
      title: t('nav.weather'),
      path: '/weather',
      color: 'from-yellow-500 to-yellow-600',
      description: t('nav.weather')
    },
    {
      icon: <span className="text-4xl">🌾</span>,
      title: t('tools.cropIntelligence'),
      path: '/crop-intelligence',
      color: 'from-teal-500 to-teal-600',
      description: t('tools.cropIntelligenceDesc')
    },
    {
      icon: <FaCalculator className="text-4xl" />,
      title: t('tools.cropCalculator'),
      path: '/crop-calculator',
      color: 'from-orange-500 to-orange-600',
      description: t('tools.cropCalculatorDesc')
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-grow">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl shadow-xl p-5 sm:p-8 mb-6 sm:mb-8 text-white text-center sm:text-left"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2"
                >
                  {t('dashboard.welcome')}, {farmer?.name}! 🌾
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-primary-100 text-base sm:text-lg mb-4 sm:mb-0"
                >
                  {t('dashboard.farmerId')}: <span className="font-bold text-white">{farmer?.farmerId}</span>
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="mt-4 md:mt-0"
              >
                <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-block">
                  <div className="flex items-center space-x-2">
                    <FaTrophy className="text-yellow-300 text-lg sm:text-2xl" />
                    <span className="font-bold text-sm sm:text-lg">{t('tools.activeFarmer')}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { label: t('dashboard.totalProperties'), value: stats.properties, color: 'text-green-600', icon: '🏡', path: '/property' },
              { label: t('dashboard.activeInsurance'), value: stats.insurance, color: 'text-purple-600', icon: '🛡️', path: '/insurance' },
              { label: t('dashboard.documents'), value: stats.documents, color: 'text-blue-600', icon: '📄', path: '/documents' },
              { label: t('tools.status'), value: t('tools.active'), color: 'text-green-600', icon: '✅', path: '/profile' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Link to={stat.path || '#'} className="block card bg-white hover:shadow-2xl transition-all duration-300 p-4 border border-gray-100 h-full group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                    <div className="bg-gray-50 p-1 rounded-full group-hover:bg-primary-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${stat.color === 'text-green-600' ? 'bg-green-500' : stat.color === 'text-purple-600' ? 'bg-purple-500' : 'bg-blue-500'} animate-pulse`} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-primary-600 transition-colors">{stat.label}</h3>
                  <p className={`text-xl sm:text-3xl font-black ${stat.color}`}>
                    {loading ? (
                      <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
                    ) : stat.value}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between mb-6"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {t('dashboard.quickActions')}
              </h3>
              <div className="h-1 flex-1 bg-gray-100 mx-4 rounded-full hidden sm:block" />
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05, type: 'spring' }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={action.path}
                    className="block card p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 text-center group border border-gray-50 h-full"
                  >
                    <div className={`bg-gradient-to-br ${action.color} w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                      <span className="text-xl sm:text-3xl">{action.icon}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-xs sm:text-base mb-1 tracking-tight">{action.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="card bg-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {t('dashboard.recentActivity')}
              </h3>
              <FaClock className="text-blue-500 text-2xl" />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner w-8 h-8" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>{new Date(activity.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">{t('common.noData')}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {t('tools.startByAdding')}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Action Menu */}
      <FloatingActionMenu />

      <Footer />
    </div>
  );
}
