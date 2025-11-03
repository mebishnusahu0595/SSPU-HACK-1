import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaPaperPlane, 
  FaMapMarkedAlt, 
  FaLeaf,
  FaCloudSun,
  FaTint,
  FaSeedling,
  FaExclamationTriangle,
  FaLightbulb,
  FaChartLine
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FieldAdvisor() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/property');
      if (res.data?.data) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
      toast.error('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat when property is selected
  useEffect(() => {
    if (selectedProperty) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hello! 🌾 I'm your AI Field Advisor for **${selectedProperty.propertyName}**. 

I can help you with:
- 🌱 Crop recommendations and best practices
- 🌦️ Weather-based farming advice
- 💧 Irrigation and soil management
- 🐛 Pest and disease prevention
- 📈 Yield optimization strategies

Feel free to ask me anything about your field!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedProperty]);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProperty) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // Prepare context about the field
      const fieldContext = {
        propertyName: selectedProperty.propertyName,
        crop: selectedProperty.currentCrop || 'Not specified',
        area: selectedProperty.area?.value || 'Unknown',
        soilType: selectedProperty.soilType,
        irrigationType: selectedProperty.irrigationType,
        location: `${selectedProperty.centerCoordinates?.latitude}, ${selectedProperty.centerCoordinates?.longitude}`,
        verified: selectedProperty.isVerified
      };

      // Call AI API
      const response = await api.post('/ai/field-advisor', {
        propertyId: selectedProperty._id,
        fieldContext,
        question: inputMessage,
        conversationHistory: messages.slice(-10) // Last 10 messages for context
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.data.response,
        timestamp: new Date(),
        suggestions: response.data.data.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { icon: <FaCloudSun />, text: "What's the best time to plant based on weather?", color: "text-yellow-600" },
    { icon: <FaTint />, text: "How much water does my crop need?", color: "text-blue-600" },
    { icon: <FaLeaf />, text: "What are common pests for my crop?", color: "text-green-600" },
    { icon: <FaSeedling />, text: "How can I improve my soil quality?", color: "text-amber-700" },
    { icon: <FaChartLine />, text: "Tips to increase crop yield?", color: "text-purple-600" },
    { icon: <FaExclamationTriangle />, text: "What diseases should I watch for?", color: "text-red-600" }
  ];

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
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              <FaRobot className="mr-3 text-primary-600" />
              Know Your Field - AI Advisor
            </h1>
            <p className="text-gray-600">Get personalized farming advice powered by AI for your specific field</p>
          </motion.div>

          {/* Property Selection */}
          {!selectedProperty ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card bg-white mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <FaMapMarkedAlt className="mr-2 text-primary-600" />
                  Select a Field to Get Started
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="spinner w-12 h-12" />
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkedAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You don't have any properties yet.</p>
                    <a href="/property" className="btn-primary">
                      Add Your First Property
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((prop, index) => (
                      <motion.div
                        key={prop._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handlePropertySelect(prop)}
                        className="cursor-pointer"
                      >
                        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 transition-all duration-300 border-2 border-transparent hover:border-primary-600">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{prop.propertyName}</h3>
                            {prop.isVerified && <span className="text-green-600">✅</span>}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center">
                              <FaLeaf className="text-green-600 mr-2" />
                              <span><strong>Crop:</strong> {prop.currentCrop || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkedAlt className="text-blue-600 mr-2" />
                              <span><strong>Area:</strong> {prop.area?.value?.toFixed(2) || 'N/A'} {prop.area?.unit || 'ha'}</span>
                            </div>
                            <div className="flex items-center">
                              <FaTint className="text-cyan-600 mr-2" />
                              <span><strong>Soil:</strong> {prop.soilType}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button className="btn-primary w-full text-sm">
                              Chat About This Field →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Chat Interface */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Sidebar - Field Info */}
              <div className="lg:col-span-1">
                <div className="card bg-white sticky top-24">
                  <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-4 rounded-t-lg -m-6 mb-4">
                    <h3 className="text-lg font-bold mb-1">{selectedProperty.propertyName}</h3>
                    {selectedProperty.isVerified && <span className="text-xs">✅ Verified Property</span>}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaLeaf className="mr-2 text-green-600" />
                        <strong>Current Crop</strong>
                      </div>
                      <p className="ml-6 text-gray-800">{selectedProperty.currentCrop || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaMapMarkedAlt className="mr-2 text-blue-600" />
                        <strong>Area</strong>
                      </div>
                      <p className="ml-6 text-gray-800">
                        {selectedProperty.area?.value?.toFixed(2) || 'N/A'} {selectedProperty.area?.unit || 'hectares'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaTint className="mr-2 text-amber-700" />
                        <strong>Soil Type</strong>
                      </div>
                      <p className="ml-6 text-gray-800">{selectedProperty.soilType}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaTint className="mr-2 text-cyan-600" />
                        <strong>Irrigation</strong>
                      </div>
                      <p className="ml-6 text-gray-800">{selectedProperty.irrigationType}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="btn-outline w-full mt-6"
                  >
                    ← Change Field
                  </button>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="lg:col-span-3">
                <div className="card bg-white h-[calc(100vh-250px)] flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg p-4 ${
                                msg.role === 'user'
                                  ? 'bg-primary-600 text-white'
                                  : msg.isError
                                  ? 'bg-red-50 text-red-800 border border-red-200'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {msg.role === 'assistant' && !msg.isError && (
                                <div className="flex items-center mb-2">
                                  <FaRobot className="text-primary-600 mr-2" />
                                  <span className="font-semibold text-primary-600">AI Advisor</span>
                                </div>
                              )}
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                              
                              {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold mb-2 flex items-center">
                                    <FaLightbulb className="mr-1" /> Related Topics:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.suggestions.map((sug, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setInputMessage(sug)}
                                        className="text-xs bg-white text-gray-700 px-2 py-1 rounded hover:bg-gray-50 border border-gray-300"
                                      >
                                        {sug}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {sending && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <div className="spinner w-4 h-4" />
                            <span className="text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {messages.length <= 1 && (
                    <div className="px-6 pb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FaLightbulb className="mr-2 text-yellow-600" />
                        Quick Questions:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickQuestions.map((q, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setInputMessage(q.text)}
                            className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2 transition-all"
                          >
                            <span className={`${q.color} mr-1`}>{q.icon}</span>
                            {q.text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything about your field... (Press Enter to send)"
                        className="flex-1 input-field resize-none"
                        rows="2"
                        disabled={sending}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={sending || !inputMessage.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="spinner w-5 h-5" />
                        ) : (
                          <FaPaperPlane />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Be specific! Mention your concerns, observations, or goals for better advice.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
