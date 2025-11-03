import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { 
  FaSeedling, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaHome,
  FaFileAlt,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaCloudSun,
  FaRobot,
  FaExclamationCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { t } = useTranslation();
  const { farmer, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = isAuthenticated ? [
    { path: '/dashboard', icon: <FaHome />, label: t('nav.dashboard') || 'Dashboard' },
    { path: '/property', icon: <FaMapMarkedAlt />, label: t('nav.property') || 'Property' },
    { path: '/documents', icon: <FaFileAlt />, label: t('nav.documents') || 'Documents' },
    { path: '/insurance', icon: <FaShieldAlt />, label: t('nav.insurance') || 'Insurance' },
    { path: '/claims', icon: <FaExclamationCircle />, label: 'Claims' },
    { path: '/weather', icon: <FaCloudSun />, label: t('nav.weather') || 'Weather' },
    { path: '/field-advisor', icon: <FaRobot />, label: 'AI Advisor' }
  ] : [];

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'} 
            className="flex items-center space-x-2 group"
            onClick={closeMobileMenu}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center"
            >
              <FaSeedling className="text-white text-xl" />
            </motion.div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
              FarmView AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-600 text-white'
                      : link.highlight
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-md'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                  {link.highlight && !isActive(link.path) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-xs font-bold rounded text-gray-800">NEW</span>
                  )}
                </Link>
              ))}

              {/* User Menu */}
              <div className="flex items-center space-x-4 border-l pl-4 ml-2">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <FaUser className="text-lg" />
                  <span className="font-medium hidden lg:inline">{farmer?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="font-medium">{t('nav.logout') || 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-gray-700 hover:text-primary-600 transition-colors"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 bg-primary-50 rounded-lg mb-2">
                      <div className="flex items-center space-x-3">
                        <FaUser className="text-primary-600 text-xl" />
                        <div>
                          <p className="font-semibold text-gray-800">{farmer?.name}</p>
                          <p className="text-sm text-gray-600">{farmer?.farmerId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(link.path)
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-primary-50'
                        }`}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FaSignOutAlt className="text-xl" />
                      <span className="font-medium">{t('nav.logout') || 'Logout'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-center bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-center bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
