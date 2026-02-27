import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaSeedling, FaLightbulb, FaBullseye, FaHandsHelping } from 'react-icons/fa';

export default function About() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 sm:pt-24 pb-8 sm:pb-12">
                <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full mb-4 sm:mb-6 shadow-xl"
                        >
                            <FaSeedling className="text-white text-3xl sm:text-5xl" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6"
                        >
                            About FarmView AI
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2"
                        >
                            Bridging the gap between cutting-edge space technology and ground-level farming to secure the future of Indian agriculture.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                        {/* The Idea Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                                <div className="p-3 sm:p-4 bg-yellow-100 rounded-2xl">
                                    <FaLightbulb className="text-yellow-600 text-2xl sm:text-3xl" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Idea</h2>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed mb-4">
                                The concept of FarmView AI was born out of a stark necessity. Every year, thousands of farmers face devastating crop losses due to unpredictable weather, pests, and environmental stress. Traditional methods of assessing crop damage are slow, manual, and often lead to delayed insurance claim settlements.
                            </p>
                            <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                                We envisioned a platform that utilizes <strong>Satellite Imagery (Sentinel Hub)</strong> and <strong>Artificial Intelligence (Gemini & Groq)</strong> to provide real-time, highly accurate insights into crop health. By calculating vegetation indices like NDVI from space, we can instantly detect crop stress and automate the insurance verification process.
                            </p>
                        </motion.div>

                        {/* Our Work Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-gray-100"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                                <div className="p-3 sm:p-4 bg-primary-100 rounded-2xl">
                                    <FaBullseye className="text-primary-600 text-2xl sm:text-3xl" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Work</h2>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                FarmView AI acts as a digital bridge between the farmer and the agricultural ecosystem. Our system connects farmers with intelligent "Field Advisors" that diagnose plant diseases using multi-spectral data, predict local weather impacts, and recommend optimal crop rotations.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Furthermore, we built an integrated dashboard that connects these predictive capabilities directly with insurance providers. When a natural disaster strikes, our backend validates the geographical extent of the damage automatically, reducing the dependency on physical surveys and getting financial aid into the hands of farmers faster than ever.
                            </p>
                        </motion.div>
                    </div>

                    {/* Our Mission */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <FaHandsHelping className="text-6xl mx-auto mb-6 opacity-90" />
                            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                            <p className="text-xl md:text-2xl font-light leading-relaxed">
                                "To democratize advanced agricultural technology, making satellite intelligence and AI accessible to every farmer, ensuring food security, and creating a financially resilient agricultural sector for India."
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
            <Footer />
        </>
    );
}
