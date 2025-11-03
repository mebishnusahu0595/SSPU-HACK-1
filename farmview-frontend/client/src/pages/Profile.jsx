import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLanguage, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCamera,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendarAlt,
  FaLock,
  FaCheckCircle
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { farmer, login } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    preferredLanguage: 'en'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        email: farmer.email || '',
        mobile: farmer.mobile || '',
        address: farmer.address || '',
        preferredLanguage: farmer.preferredLanguage || 'en'
      });
    }
  }, [farmer]);

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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', formData);
      if (response.data?.success) {
        const updatedFarmer = response.data.data;
        login(updatedFarmer, localStorage.getItem('token'));
        
        // Update language
        if (formData.preferredLanguage !== farmer.preferredLanguage) {
          i18n.changeLanguage(formData.preferredLanguage);
        }
        
        toast.success('Profile updated successfully!');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data?.success) {
        toast.success('Password changed successfully!');
        setPasswordMode(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: farmer.name || '',
      email: farmer.email || '',
      mobile: farmer.mobile || '',
      address: farmer.address || '',
      preferredLanguage: farmer.preferredLanguage || 'en'
    });
    setEditMode(false);
    setPasswordMode(false);
    setErrors({});
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPEG, PNG, GIF) are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        const updatedFarmer = response.data.data.farmer;
        login(updatedFarmer, localStorage.getItem('token'));
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!farmer?.profilePicture) return;

    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploadingPicture(true);
    try {
      const response = await api.delete('/auth/delete-profile-picture');
      
      if (response.data?.success) {
        const updatedFarmer = response.data.data.farmer;
        login(updatedFarmer, localStorage.getItem('token'));
        toast.success('Profile picture deleted successfully!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (farmer?.profilePicture) {
      return `http://localhost:5000/api/auth/profile-picture/${farmer.profilePicture}`;
    }
    return null;
  };

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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              👤 My Profile
            </h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card bg-gradient-to-br from-primary-600 to-secondary-600 text-white sticky top-24">
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    {getProfilePictureUrl() ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white">
                        <img 
                          src={getProfilePictureUrl()} 
                          alt={farmer?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-primary-600 text-5xl font-bold shadow-xl" style={{ display: 'none' }}>
                          {farmer?.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-primary-600 text-5xl font-bold shadow-xl">
                        {farmer?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Upload/Delete buttons */}
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                    <label
                      htmlFor="profilePictureInput"
                      className={`absolute bottom-0 right-0 w-10 h-10 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors cursor-pointer ${uploadingPicture ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingPicture ? (
                        <div className="spinner w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaCamera />
                      )}
                    </label>
                    
                    {farmer?.profilePicture && !uploadingPicture && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="absolute bottom-0 left-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        title="Delete profile picture"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-1">{farmer?.name}</h2>
                  <p className="text-primary-100 mb-4 flex items-center justify-center space-x-1">
                    <FaIdCard />
                    <span>ID: {farmer?.farmerId}</span>
                  </p>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <FaCalendarAlt />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <p className="font-semibold">
                      {farmer?.createdAt ? new Date(farmer.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {!editMode && !passwordMode && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditMode(true)}
                          className="w-full bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <FaEdit />
                          <span>Edit Profile</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPasswordMode(true)}
                          className="w-full bg-white/20 hover:bg-white/30 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <FaLock />
                          <span>Change Password</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <AnimatePresence mode="wait">
                {passwordMode ? (
                  /* Password Change Form */
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card bg-white"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaLock className="mr-2 text-primary-600" />
                        Change Password
                      </h3>
                      <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="text-2xl" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.currentPassword ? 'border-red-500' : ''}`}
                          placeholder="Enter current password"
                        />
                        {errors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.newPassword ? 'border-red-500' : ''}`}
                          placeholder="Enter new password (min 6 characters)"
                        />
                        {errors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePasswordUpdate}
                          disabled={loading}
                          className="btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="spinner w-5 h-5" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <FaSave />
                              <span>Update Password</span>
                            </>
                          )}
                        </motion.button>
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="btn-outline flex-1 py-3"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Profile Details Form */
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card bg-white"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {editMode ? 'Edit Profile Information' : 'Profile Information'}
                      </h3>
                      {editMode && (
                        <button
                          onClick={handleCancel}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaTimes className="text-2xl" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline mr-2 text-primary-600" />
                          Full Name *
                        </label>
                        {editMode ? (
                          <>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                              placeholder="Enter your full name"
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 font-medium">{farmer?.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaEnvelope className="inline mr-2 text-primary-600" />
                          Email Address *
                        </label>
                        {editMode ? (
                          <>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                              placeholder="your.email@example.com"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 font-medium">{farmer?.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaPhone className="inline mr-2 text-primary-600" />
                          Mobile Number *
                        </label>
                        {editMode ? (
                          <>
                            <input
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              className={`input-field ${errors.mobile ? 'border-red-500' : ''}`}
                              placeholder="10-digit mobile number"
                              maxLength="10"
                            />
                            {errors.mobile && (
                              <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 font-medium">{farmer?.mobile}</p>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline mr-2 text-primary-600" />
                          Address
                        </label>
                        {editMode ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter your address (Village, District, State)"
                            rows="3"
                          />
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 font-medium">
                              {farmer?.address || 'Not provided'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaLanguage className="inline mr-2 text-primary-600" />
                          Preferred Language
                        </label>
                        {editMode ? (
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
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 font-medium">
                              {languages.find(l => l.code === farmer?.preferredLanguage)?.name || 'English'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Farmer ID (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaIdCard className="inline mr-2 text-primary-600" />
                          Farmer ID
                        </label>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-800 font-bold text-lg">{farmer?.farmerId}</p>
                            <FaCheckCircle className="text-green-600 text-2xl" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">This ID is unique and cannot be changed</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {editMode && (
                        <div className="flex gap-4 pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={loading}
                            className="btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {loading ? (
                              <>
                                <div className="spinner w-5 h-5" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <FaSave />
                                <span>Save Changes</span>
                              </>
                            )}
                          </motion.button>
                          <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="btn-outline flex-1 py-3"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

