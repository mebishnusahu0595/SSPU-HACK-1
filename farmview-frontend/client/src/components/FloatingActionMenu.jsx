import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus, FaTimes, FaCalculator, FaTasks, FaRobot,
    FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

export default function FloatingActionMenu() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeIconIndex, setActiveIconIndex] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const {
        isTodoOpen, isCalculatorOpen, isChatbotOpen
    } = useUIStore();

    // Track scroll for "Back to Top"
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const actions = [
        {
            id: 'scroll',
            icon: <FaChevronUp />,
            label: 'Back to Top',
            color: 'bg-gray-500',
            onClick: () => {
                scrollToTop();
                setIsMenuOpen(false);
            }
        },
        {
            id: 'calculator',
            icon: <FaCalculator />,
            label: 'Calculator',
            color: 'bg-orange-500',
            onClick: () => {
                navigate('/crop-calculator');
                setIsMenuOpen(false);
            }
        },
        {
            id: 'todo',
            icon: <FaTasks />,
            label: 'Checklist',
            color: 'bg-blue-600',
            onClick: () => {
                navigate('/tasks');
                setIsMenuOpen(false);
            }
        },
        {
            id: 'chat',
            icon: <FaRobot />,
            label: 'AI Bot',
            color: 'bg-green-600',
            onClick: () => {
                navigate('/ai-chat');
                setIsMenuOpen(false);
            }
        }
    ];

    // Icon rotation logic (only for features, not scroll)
    const rotatingActions = actions.filter(a => a.id !== 'scroll');
    useEffect(() => {
        if (isMenuOpen || isTodoOpen || isCalculatorOpen || isChatbotOpen) return;

        const interval = setInterval(() => {
            setActiveIconIndex((prev) => (prev + 1) % rotatingActions.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [isMenuOpen, isTodoOpen, isCalculatorOpen, isChatbotOpen, rotatingActions.length]);

    const isActive = isTodoOpen || isCalculatorOpen || isChatbotOpen;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Action Items List */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="mb-4 space-y-3 flex flex-col items-end"
                    >
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-3"
                            >
                                <span className="bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold text-gray-700 pointer-events-none">
                                    {action.label}
                                </span>
                                <button
                                    onClick={action.onClick}
                                    className={`${action.color} text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-90 transition-transform`}
                                >
                                    {action.icon}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col space-y-3">
                {/* Independent Scroll Top Button (Show when scrolled down and menu is closed) */}
                {showScrollTop && !isMenuOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={scrollToTop}
                        className="bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-all border border-white/20"
                    >
                        <FaChevronUp />
                    </motion.button>
                )}

                {/* Main Toggle Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`${isMenuOpen || isActive ? 'bg-gray-800' : 'bg-primary-600'
                        } text-white p-4 rounded-full shadow-2xl transition-colors duration-300 relative`}
                    style={{ width: '64px', height: '64px', fontSize: '24px' }}
                >
                    <AnimatePresence mode="wait">
                        {isMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <FaTimes />
                            </motion.div>
                        ) : isActive ? (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <FaChevronDown />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={rotatingActions[activeIconIndex].id}
                                initial={{ y: 20, opacity: 0, rotate: -45 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: -20, opacity: 0, rotate: 45 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center justify-center"
                            >
                                {rotatingActions[activeIconIndex].icon}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Indicator Badge */}
                    {!isMenuOpen && !isActive && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500"></span>
                        </span>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
