import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-grow container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                        <FaRobot className="mr-3 text-green-600" />
                        FarmView AI Assistant
                    </h1>
                    <p className="text-gray-600 mt-2">Get instant answers about crops, weather, and farming techniques</p>
                </motion.div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[700px]">
                    <AIChatbot isPage={true} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
