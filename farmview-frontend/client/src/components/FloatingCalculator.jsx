import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaTimes, FaUndo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';

export default function FloatingCalculator() {
    const { t } = useTranslation();
    const { isCalculatorOpen, toggleCalculator } = useUIStore();
    const [inputs, setInputs] = useState({
        cropType: 'wheat', // Changed to key
        landArea: 1,
        seedCost: 2000,
        fertilizerCost: 5000,
        laborCost: 10000,
        marketPrice: 2200,
        expectedYield: 50
    });

    const [results, setResults] = useState(null);

    const crops = [
        { id: 'wheat', name: t('calculator.crops.wheat'), avgYield: 35, avgPrice: 2125 },
        { id: 'rice', name: t('calculator.crops.rice'), avgYield: 45, avgPrice: 2040 },
        { id: 'cotton', name: t('calculator.crops.cotton'), avgYield: 20, avgPrice: 6380 },
        { id: 'sugarcane', name: t('calculator.crops.sugarcane'), avgYield: 800, avgPrice: 305 },
        { id: 'maize', name: t('calculator.crops.maize'), avgYield: 30, avgPrice: 1962 },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const calculate = () => {
        const totalCost = parseFloat(inputs.seedCost) +
            parseFloat(inputs.fertilizerCost) +
            parseFloat(inputs.laborCost);

        const landSize = parseFloat(inputs.landArea);
        const totalInvestment = totalCost * landSize;
        const totalYield = parseFloat(inputs.expectedYield) * landSize;
        const totalRevenue = totalYield * parseFloat(inputs.marketPrice);
        const profit = totalRevenue - totalInvestment;
        const roi = (profit / totalInvestment) * 100;

        setResults({
            totalInvestment,
            totalRevenue,
            profit,
            roi
        });
    };

    useEffect(() => {
        if (isCalculatorOpen) calculate();
    }, [isCalculatorOpen, inputs]);

    return (
        <AnimatePresence>
            {isCalculatorOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="fixed bottom-24 right-6 z-[70] w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-orange-100"
                    style={{ maxWidth: 'calc(100vw - 3rem)' }}
                >
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FaCalculator />
                                <h3 className="font-bold">{t('calculator.title')}</h3>
                            </div>
                            <button onClick={toggleCalculator}><FaTimes /></button>
                        </div>
                    </div>

                    <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400">{t('calculator.cropArea')}</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <select name="cropType" value={inputs.cropType} onChange={handleInputChange} className="text-xs p-2 border rounded bg-gray-50">
                                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <input type="number" name="landArea" value={inputs.landArea} onChange={handleInputChange} className="text-xs p-2 border rounded bg-gray-50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400">{t('calculator.yield')}</label>
                                <input type="number" name="expectedYield" value={inputs.expectedYield} onChange={handleInputChange} className="text-xs p-2 border rounded bg-gray-100 w-full mt-1" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400">{t('calculator.price')}</label>
                                <input type="number" name="marketPrice" value={inputs.marketPrice} onChange={handleInputChange} className="text-xs p-2 border rounded bg-gray-100 w-full mt-1" />
                            </div>
                        </div>

                        {results && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-orange-600 font-bold uppercase">{t('calculator.profit')}</p>
                                        <p className={`text-2xl font-black ${results.profit >= 0 ? 'text-orange-700' : 'text-red-600'}`}>
                                            ₹{results.profit.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase">{t('calculator.roi')}</p>
                                        <p className="font-bold text-orange-600">{results.roi.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t flex justify-between">
                        <button
                            onClick={() => setInputs({
                                cropType: 'wheat', landArea: 1, seedCost: 2000, fertilizerCost: 5000, laborCost: 10000, marketPrice: 2200, expectedYield: 50
                            })}
                            className="text-xs text-gray-500 flex items-center space-x-1 hover:text-orange-600"
                        >
                            <FaUndo /> <span>{t('calculator.reset')}</span>
                        </button>
                        <a href="/crop-calculator" className="text-xs font-bold text-orange-600 hover:underline">{t('calculator.fullAnalysis')} →</a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
