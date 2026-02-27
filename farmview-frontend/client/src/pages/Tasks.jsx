import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FarmTodo from '../components/FarmTodo';
import { motion } from 'framer-motion';
import { FaTasks } from 'react-icons/fa';

export default function TasksPage() {
    // We can use the existing FarmTodo component but force it to be "open" or just render its content
    // However, FarmTodo is designed as a floating overlay. 
    // Let's create a wrapper that looks like a page.

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
                        <FaTasks className="mr-3 text-blue-600" />
                        Farm Checklist & Tasks
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your daily farming activities and schedules</p>
                </motion.div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px]">
                    {/* Render FarmTodo here. We might need to adjust FarmTodo to allow "always open" mode */}
                    <FarmTodo isPage={true} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
