import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaLeaf } from 'react-icons/fa';
import api from '../utils/api';
import { useUIStore } from '../store/uiStore';

export default function AIChatbot({ isPage = false }) {
  const { isChatbotOpen, toggleChatbot } = useUIStore();
  const shouldShow = isPage || isChatbotOpen;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🌾 Hello! I\'m your FarmView AI Assistant. I can help you with:\n\n• Crop recommendations based on your soil and climate\n• Farming best practices\n• Crop disease identification\n• Weather-based farming advice\n• General farming queries\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
        conversationHistory: messages
      });

      if (response.data?.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.data.data.response }
        ]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    '🌾 What crops are best for my area?',
    '💧 How much water does rice need?',
    '🌡️ Best crops for hot climate',
    '🏔️ Suitable crops for clay soil'
  ];

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={isPage ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={isPage ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`${isPage ? 'w-full h-full' : 'fixed bottom-24 right-6 z-50 w-96 h-[600px] shadow-2xl'} bg-white rounded-2xl flex flex-col overflow-hidden`}
            style={!isPage ? { maxWidth: 'calc(100vw - 3rem)' } : {}}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between ${isPage ? 'sm:p-6' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">FarmView AI</h3>
                  <p className="text-xs text-green-100">Ask About Crops, Weather, and More!</p>
                </div>
              </div>
              {!isPage && (
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChatbot}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                      }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <FaLeaf className="text-green-600" />
                        <span className="text-xs font-semibold text-green-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-2xl shadow-md">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-white border-t">
                <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about crops, farming, weather..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  disabled={loading}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
