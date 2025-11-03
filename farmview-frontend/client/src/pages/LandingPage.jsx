import { motion } from 'framer-motion';
import { FaSeedling, FaCloudSun, FaFileAlt, FaShieldAlt, FaMapMarkedAlt, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();
  const [counters, setCounters] = useState({
    farmers: 0,
    hectares: 0,
    claims: 0,
    uptime: 0
  });

  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      farmers: 10000,
      hectares: 50000,
      claims: 100,
      uptime: 99.9
    };

    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        farmers: Math.floor(targets.farmers * progress),
        hectares: Math.floor(targets.hectares * progress),
        claims: Math.floor(targets.claims * progress),
        uptime: parseFloat((targets.uptime * progress).toFixed(1))
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  const formatNumber = (num, type) => {
    if (type === 'farmers') {
      return num >= 1000 ? `${Math.floor(num / 1000)}K+` : `${num}+`;
    }
    if (type === 'hectares') {
      return num >= 1000 ? `${Math.floor(num / 1000)}K+` : `${num}+`;
    }
    if (type === 'claims') {
      return `₹${num}Cr+`;
    }
    if (type === 'uptime') {
      return `${num}%`;
    }
    return num;
  };
  const features = [
    {
      icon: <FaMapMarkedAlt className="text-5xl text-primary-600" />,
      title: t('landing.features.property.title'),
      description: t('landing.features.property.desc')
    },
    {
      icon: <FaFileAlt className="text-5xl text-primary-600" />,
      title: t('landing.features.documents.title'),
      description: t('landing.features.documents.desc')
    },
    {
      icon: <FaShieldAlt className="text-5xl text-primary-600" />,
      title: t('landing.features.insurance.title'),
      description: t('landing.features.insurance.desc')
    },
    {
      icon: <FaCloudSun className="text-5xl text-primary-600" />,
      title: t('landing.features.weather.title'),
      description: t('landing.features.weather.desc')
    },
    {
      icon: <FaChartLine className="text-5xl text-primary-600" />,
      title: t('landing.features.monitoring.title'),
      description: t('landing.features.monitoring.desc')
    },
    {
      icon: <FaSeedling className="text-5xl text-primary-600" />,
      title: t('landing.features.smart.title'),
      description: t('landing.features.smart.desc')
    }
  ];

  const benefits = [
    t('landing.benefits.satellite'),
    t('landing.benefits.claims'),
    t('landing.benefits.weather'),
    t('landing.benefits.documents'),
    t('landing.benefits.multilang'),
    t('landing.benefits.ai')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              🚀 {t('landing.geoaiBadge')}
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 mb-6 leading-tight">
            {t('landing.heroTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              {t('landing.heroTitleHighlight')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto btn-primary text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              {t('landing.getStartedFree')}
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto btn-outline text-lg px-10 py-4"
            >
              {t('landing.loginToDashboard')}
            </Link>
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {formatNumber(counters.farmers, 'farmers')}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">{t('landing.stats.farmers')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {formatNumber(counters.hectares, 'hectares')}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">{t('landing.stats.hectares')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {formatNumber(counters.claims, 'claims')}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">{t('landing.stats.claims')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {formatNumber(counters.uptime, 'uptime')}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">{t('landing.stats.uptime')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="card text-center p-8 hover:shadow-2xl transition-all duration-300 bg-white"
            >
              <motion.div 
                className="flex justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-10 rounded-lg text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                {t('landing.cta.createAccount')}
              </Link>
              <a 
                href="#features"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-10 rounded-lg text-lg transition-all"
              >
                {t('landing.cta.learnMore')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
