import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserShield, FaLock, FaSignInAlt } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/login', formData);
      
      if (res.data?.success) {
        // Store admin token and data
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminData', JSON.stringify(res.data.admin));
        
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-full mb-4"
          >
            <FaUserShield className="text-6xl text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-blue-200">FarmView Management System</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUserShield className="inline mr-2 text-blue-600" />
                Username or Email
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="inline mr-2 text-blue-600" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Login to Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-xs text-blue-800">
              <strong>Default Credentials:</strong><br />
              Username: <code className="bg-blue-200 px-2 py-1 rounded">admin</code><br />
              Password: <code className="bg-blue-200 px-2 py-1 rounded">Admin@123</code>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-200 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
