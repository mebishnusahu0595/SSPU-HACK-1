import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalculator, FaLeaf, FaMoneyBillWave, FaChartLine,
    FaTools, FaPercentage, FaArrowRight, FaHistory, FaDownload
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import toast from 'react-hot-toast';

export default function CropCalculator() {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState({
        cropType: 'Wheat',
        landArea: 1,
        areaUnit: 'Hectares',
        seedCost: 2000,
        fertilizerCost: 5000,
        laborCost: 10000,
        miscCost: 2000,
        marketPrice: 2200, // per quintal
        expectedYield: 50, // quintals per hectare
    });

    const [results, setResults] = useState(null);

    const crops = [
        { name: 'Wheat', avgYield: 35, avgPrice: 2125 },
        { name: 'Rice (Paddy)', avgYield: 45, avgPrice: 2040 },
        { name: 'Cotton', avgYield: 20, avgPrice: 6380 },
        { name: 'Sugarcane', avgYield: 800, avgPrice: 305 },
        { name: 'Maize', avgYield: 30, avgPrice: 1962 },
        { name: 'Soybean', avgYield: 15, avgPrice: 4300 },
        { name: 'Mustard', avgYield: 15, avgPrice: 5450 },
        { name: 'Tur (Arhar)', avgYield: 10, avgPrice: 6600 },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const calculate = () => {
        const totalCost = parseFloat(inputs.seedCost) +
            parseFloat(inputs.fertilizerCost) +
            parseFloat(inputs.laborCost) +
            parseFloat(inputs.miscCost);

        // Convert to total for the whole land
        const landSize = parseFloat(inputs.landArea);
        const totalInvestment = totalCost * landSize;

        const totalYield = parseFloat(inputs.expectedYield) * landSize;
        const totalRevenue = totalYield * parseFloat(inputs.marketPrice);

        const profit = totalRevenue - totalInvestment;
        const roi = (profit / totalInvestment) * 100;

        setResults({
            totalInvestment,
            totalYield,
            totalRevenue,
            profit,
            roi,
            costPerUnit: totalInvestment / totalYield,
            profitability: profit > totalInvestment * 0.5 ? 'High' : profit > 0 ? 'Moderate' : 'Negative'
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Calculation updated!');
    };

    useEffect(() => {
        calculate();
    }, []);

    const getProfitColor = (status) => {
        if (status === 'High') return 'text-green-600 bg-green-100';
        if (status === 'Moderate') return 'text-blue-600 bg-blue-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center sm:text-left"
                    >
                        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center sm:justify-start">
                            <FaCalculator className="mr-3 text-primary-600" />
                            Crop Yield & Profit Calculator
                        </h1>
                        <p className="text-gray-600">Estimate your agricultural returns with precision</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-white p-6 shadow-xl border-t-4 border-primary-600">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <FaTools className="mr-2 text-primary-600" />
                                    Cost & Input Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Crop</label>
                                        <select
                                            name="cropType"
                                            value={inputs.cropType}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            {crops.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Land Area</label>
                                            <input
                                                type="number"
                                                name="landArea"
                                                value={inputs.landArea}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                                            <select
                                                name="areaUnit"
                                                value={inputs.areaUnit}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            >
                                                <option>Hectares</option>
                                                <option>Acres</option>
                                                <option>Bigha</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr className="my-4" />
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Costs (per {inputs.areaUnit.slice(0, -1)})</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Seeds (₹)</label>
                                            <input
                                                type="number"
                                                name="seedCost"
                                                value={inputs.seedCost}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Fertilizers (₹)</label>
                                            <input
                                                type="number"
                                                name="fertilizerCost"
                                                value={inputs.fertilizerCost}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Labor (₹)</label>
                                            <input
                                                type="number"
                                                name="laborCost"
                                                value={inputs.laborCost}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Others (₹)</label>
                                            <input
                                                type="number"
                                                name="miscCost"
                                                value={inputs.miscCost}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <hr className="my-4" />
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Expected Output</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Yield ({inputs.cropType === 'Sugarcane' ? 'Tons' : 'Quintals'}/{inputs.areaUnit.slice(0, -1)})</label>
                                            <input
                                                type="number"
                                                name="expectedYield"
                                                value={inputs.expectedYield}
                                                onChange={handleInputChange}
                                                className="input-field border-primary-200 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600">Price (₹/Unit)</label>
                                            <input
                                                type="number"
                                                name="marketPrice"
                                                value={inputs.marketPrice}
                                                onChange={handleInputChange}
                                                className="input-field border-primary-200 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={calculate}
                                        className="btn-primary w-full py-4 mt-6 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <FaCalculator />
                                        <span>Calculate Now</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Display */}
                        <div className="lg:col-span-2 space-y-6">
                            <AnimatePresence mode="wait">
                                {results && (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-6"
                                    >
                                        {/* Main Stats Card */}
                                        <div className="card bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-8 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <p className="text-primary-100 text-sm uppercase tracking-widest font-bold mb-1">Estimated Net Profit</p>
                                                        <h3 className={`text-6xl font-black ${results.profit >= 0 ? 'text-white' : 'text-red-300'}`}>
                                                            ₹{Math.abs(results.profit).toLocaleString()}
                                                            {results.profit < 0 && ' (Loss)'}
                                                        </h3>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${getProfitColor(results.profitability)}`}>
                                                        {results.profitability} Profitability
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                        <p className="text-xs text-primary-100 mb-1">Total Investment</p>
                                                        <p className="text-2xl font-bold">₹{results.totalInvestment.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                        <p className="text-xs text-primary-100 mb-1">Expected Revenue</p>
                                                        <p className="text-2xl font-bold">₹{results.totalRevenue.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                        <p className="text-xs text-primary-100 mb-1">Total Yield</p>
                                                        <p className="text-2xl font-bold">{results.totalYield} {inputs.cropType === 'Sugarcane' ? 'Tons' : 'Quintals'}</p>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                        <p className="text-xs text-primary-100 mb-1">Expected ROI</p>
                                                        <p className="text-2xl font-bold">{results.roi.toFixed(1)}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Analysis Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="card bg-white p-6 shadow-lg border border-gray-100"
                                            >
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <FaChartLine className="mr-2 text-blue-500" />
                                                    Break-even Analysis
                                                </h3>
                                                <div className="space-y-4">
                                                    <p className="text-gray-600 text-sm">
                                                        To cover your investment of <span className="font-bold">₹{results.totalInvestment.toLocaleString()}</span>, you need to sell at least:
                                                    </p>
                                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                                        <span className="text-3xl font-black text-blue-700">₹{results.costPerUnit.toFixed(2)}</span>
                                                        <p className="text-xs text-blue-600 font-semibold mt-1">per {inputs.cropType === 'Sugarcane' ? 'Ton' : 'Quintal'}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 italic">
                                                        Current market price is ₹{inputs.marketPrice}/Unit. Your margin is ₹{(inputs.marketPrice - results.costPerUnit).toFixed(2)} per unit.
                                                    </p>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="card bg-white p-6 shadow-lg border border-gray-100"
                                            >
                                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                                    <FaLeaf className="mr-2 text-green-500" />
                                                    Yield Optimization
                                                </h3>
                                                <div className="space-y-4">
                                                    <p className="text-gray-600 text-sm">
                                                        Increasing your yield by just <span className="font-bold text-green-600">10%</span> could increase your profit by:
                                                    </p>
                                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                                                        <span className="text-3xl font-black text-green-700">₹{(results.totalRevenue * 0.1).toLocaleString()}</span>
                                                        <p className="text-xs text-green-600 font-semibold mt-1">Additional Income</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        💡 Tip: Use <span className="font-bold">Field Advisor</span> for specific fertilizer recommendations to boost yield.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                            <button className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2">
                                                <FaDownload />
                                                <span>Download Report (PDF)</span>
                                            </button>
                                            <button className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2">
                                                <FaHistory />
                                                <span>Save to History</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <AIChatbot />
            <Footer />
        </div>
    );
}
