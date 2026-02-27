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
  FaExclamationCircle,
  FaCalculator,
  FaGlobe
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };
  const { farmer, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = isAuthenticated ? [
    { path: '/dashboard', icon: <FaHome />, label: t('nav.dashboard') || 'Dashboard' },
    { path: '/property', icon: <FaMapMarkedAlt />, label: t('nav.property') || 'Property' },
    { path: '/documents', icon: <FaFileAlt />, label: t('nav.documents') || 'Documents' },
    { path: '/insurance', icon: <FaShieldAlt />, label: t('nav.insurance') },
    { path: '/claims', icon: <FaExclamationCircle />, label: t('nav.claims') },
    { path: '/weather', icon: <FaCloudSun />, label: t('nav.weather') },
  ] : [];

  const toolLinks = [
    { path: '/field-advisor', icon: <FaRobot />, label: t('nav.aiAdvisor') || 'AI Advisor' },
    { path: '/crop-calculator', icon: <FaCalculator />, label: t('nav.calculator') || 'Calculator' }
  ];

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center space-x-2 group flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200"
            >
              <FaSeedling className="text-white text-sm md:text-xl" />
            </motion.div>
            <div className="flex flex-col -space-y-1">
              <span className="text-base md:text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tighter">
                FarmView
              </span>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">AI TECH</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden xl:flex items-center space-x-0.5 lg:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-all duration-300 ${isActive(link.path)
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                >
                  <span className="text-base xl:text-lg">{link.icon}</span>
                  <span className="font-bold text-[13px] whitespace-nowrap tracking-tight">{link.label}</span>
                </Link>
              ))}

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-all duration-300 ${toolLinks.some(l => isActive(l.path))
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                >
                  <FaRobot className="text-base xl:text-lg" />
                  <span className="font-bold text-[13px] whitespace-nowrap tracking-tight">Tools</span>
                  <motion.span
                    animate={{ rotate: toolsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars className="text-[10px] ml-1 opacity-50" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      {toolLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setToolsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors ${isActive(link.path) ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                            }`}
                        >
                          <span className="text-lg text-primary-500">{link.icon}</span>
                          <span className="font-bold text-sm tracking-tight">{link.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all font-bold text-xs mr-2 group"
                title={i18n.language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
              >
                <div className="relative overflow-hidden w-4 h-4">
                  <motion.div
                    animate={{ y: i18n.language === 'en' ? 0 : -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <FaGlobe className="text-sm mb-[6px]" />
                    <FaGlobe className="text-sm" />
                  </motion.div>
                </div>
                <span className="uppercase tracking-wider min-w-[45px] text-center">
                  {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                </span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2 border-l border-gray-100 ml-2 pl-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors bg-gray-50 px-3 py-2 rounded-xl group"
                >
                  <FaUser className="text-xs text-gray-400 group-hover:text-primary-600" />
                  <span className="font-black text-xs hidden lg:inline tracking-wide">{farmer?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs group"
                >
                  <FaSignOutAlt className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="uppercase tracking-widest text-[10px]">{t('nav.logout') || 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden xl:flex items-center space-x-4">
              {/* Language Toggle Public Desktop */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all font-bold text-xs group mr-2"
                title={i18n.language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
              >
                <FaGlobe className={`text-sm transition-transform duration-500 ${i18n.language === 'hi' ? 'rotate-180' : ''}`} />
                <span className="uppercase tracking-wider min-w-[45px]">
                  {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                </span>
              </button>

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
            className="xl:hidden text-2xl text-gray-700 hover:text-primary-600 transition-colors"
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
              className="xl:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* Language Toggle Mobile */}
                    <div className="px-4 mb-2">
                      <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-bold transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FaGlobe className="text-xl" />
                          <span>{i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded shadow-sm">
                          {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                        </span>
                      </button>
                    </div>

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
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.path)
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
                    {/* Language Toggle Mobile Public */}
                    <div className="px-4 mb-2">
                      <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-lg font-bold transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FaGlobe className="text-xl" />
                          <span>{i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded shadow-sm">
                          {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                        </span>
                      </button>
                    </div>

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
