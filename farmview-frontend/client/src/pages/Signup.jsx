import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaGlobe, FaSeedling, FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile must be 10 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        preferredLanguage: formData.preferredLanguage
      });

      const { data } = response.data;
      login(data, data.token);
      
      toast.success(
        <div>
          <p className="font-bold">{t('auth.signupSuccess')}</p>
          <p className="text-sm">Your Farmer ID: <span className="font-bold">{data.farmerId}</span></p>
        </div>,
        { duration: 5000 }
      );
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message, { duration: 5000 });
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full mb-4 shadow-xl"
            >
              <FaSeedling className="text-white text-4xl" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-gray-800 mb-2"
            >
              Join FarmView AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              Create your farmer account and start smart farming
            </motion.p>
          </div>


          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.name')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className={`${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.mobile')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className={`${errors.mobile ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.mobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.mobile && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                      {errors.mobile}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGlobe className="inline mr-2" />
                  Preferred Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="input-field"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={`${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Min. 6 characters"
                      minLength="6"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.confirmPassword')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={`${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.signupButton')}</span>
                    <FaArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                  {t('auth.login')}
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
