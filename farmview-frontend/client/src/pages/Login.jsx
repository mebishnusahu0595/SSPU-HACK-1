import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSeedling, FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or mobile number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { data } = response.data;
      
      login(data, data.token);
      toast.success(
        <div>
          <p className="font-bold">{t('auth.loginSuccess')}</p>
          <p className="text-sm">Welcome back, {data.name}!</p>
        </div>,
        { duration: 4000 }
      );
      
      // Smooth navigation with slight delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message, { duration: 5000 });
      
      // Show specific field errors if available
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
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
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
              Welcome Back
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              {t('auth.login')} to manage your farm
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Mobile Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')} or {t('auth.mobile')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`${errors.identifier ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.identifier ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter email or 10-digit mobile"
                    autoComplete="username"
                  />
                </div>
                {errors.identifier && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.identifier}
                  </motion.p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
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
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.loginButton')}</span>
                    <FaArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.dontHaveAccount')}{' '}
                <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                  {t('auth.signup')}
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-xs text-blue-800 font-medium mb-1">🎯 Demo Credentials:</p>
              <p className="text-xs text-blue-700">Email: demo@farmview.com | Password: demo123</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
