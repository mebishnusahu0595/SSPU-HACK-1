const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth.middleware');
const Property = require('../models/Property.model');

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// @route   POST /api/ai/field-advisor
// @desc    Get AI advice for a specific field
// @access  Private
router.post('/field-advisor', protect, async (req, res) => {
  console.log('🤖 Field Advisor Request Received');
  console.log('Request body:', req.body);
  
  try {
    const { propertyId, fieldContext, question, conversationHistory } = req.body;

    if (!question || !propertyId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Property ID and question are required'
      });
    }

    console.log(`🔍 Looking for property: ${propertyId} for farmer: ${req.farmer._id}`);

    // Verify property ownership
    const property = await Property.findOne({
      _id: propertyId,
      farmer: req.farmer._id
    });

    if (!property) {
      console.log('❌ Property not found');
      return res.status(404).json({
        success: false,
        message: 'Property not found or not owned by you'
      });
    }

    console.log('✅ Property found:', property.propertyName);

    // Build AI prompt with field context
    const systemPrompt = `You are an expert agricultural advisor helping a farmer with their specific field. You ONLY answer questions related to farming, agriculture, crops, soil, weather, irrigation, pests, diseases, and field management.

**Field Information:**
- Property Name: ${fieldContext.propertyName}
- Current Crop: ${fieldContext.crop}
- Area: ${fieldContext.area} hectares
- Soil Type: ${fieldContext.soilType}
- Irrigation Type: ${fieldContext.irrigationType}
- Location Coordinates: ${fieldContext.location}
- Field Status: ${fieldContext.verified ? 'Verified' : 'Pending Verification'}

**Your Role:**
- ONLY answer questions about farming, agriculture, and field management
- If the question is NOT about farming/agriculture, politely decline and redirect to farming topics
- Provide practical, actionable farming advice specific to the field details above
- Consider the specific crop, soil, and irrigation type mentioned
- Give location-appropriate recommendations for Indian agriculture
- Use simple language that Indian farmers can understand
- Include emojis to make advice engaging (🌾 🌱 💧 ☀️ 🌦️)
- Focus on sustainable and cost-effective practices
- Warn about common mistakes and suggest preventive measures

**Important Guidelines:**
- Keep responses concise (3-5 paragraphs max)
- Use bullet points for actionable steps
- Mention specific timings/seasons when relevant for Indian climate
- Include both traditional and modern techniques
- Address safety and environmental concerns
- If question is off-topic, say: "I'm your field advisor and can only help with farming questions about your field. Please ask me about crops, soil, irrigation, pests, or field management for ${fieldContext.propertyName}."

**Conversation History:**
${conversationHistory.slice(-4).map(msg => `${msg.role === 'user' ? 'Farmer' : 'Advisor'}: ${msg.content}`).join('\n')}

**Current Question from Farmer:**
${question}

Provide helpful, specific farming advice for this farmer's field. Remember: ONLY answer farming-related questions!`;

    // Call Groq AI with streaming
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural advisor who ONLY answers farming and agriculture-related questions. You help farmers with their specific fields."
        },
        {
          role: "user",
          content: systemPrompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Unable to generate response';

    // Generate follow-up suggestions based on the topic
    const suggestions = generateSuggestions(question, fieldContext);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        suggestions,
        timestamp: new Date(),
        model: 'llama-3.3-70b-versatile',
        provider: 'groq'
      }
    });

  } catch (error) {
    console.error('AI Field Advisor Error:', error);
    
    // Fallback response if AI fails
    const fallbackResponse = `I'm having trouble processing your question right now. 🌾

**Meanwhile, here are some general tips for ${req.body.fieldContext?.crop || 'your crop'}:**

🌱 **General Best Practices:**
- Monitor your field regularly for pests and diseases
- Ensure proper irrigation schedule based on crop stage
- Test soil health every season
- Use organic compost to improve soil fertility
- Keep records of sowing, fertilizer, and harvest dates

💧 **Water Management:**
- Water early morning or late evening to reduce evaporation
- Check soil moisture before irrigating
- Ensure proper drainage to prevent waterlogging

🐛 **Pest Control:**
- Inspect crops weekly for pest damage
- Use neem-based organic pesticides when possible
- Remove infected plants immediately
- Maintain field hygiene

📞 For specific urgent issues, consult your local agriculture extension officer or krishi vigyan kendra.

Please try asking your question again!`;

    res.json({
      success: true,
      data: {
        response: fallbackResponse,
        suggestions: [
          'What fertilizers should I use?',
          'How to prevent common pests?',
          'Best irrigation schedule?'
        ],
        fallback: true,
        timestamp: new Date()
      }
    });
  }
});

// Generate contextual follow-up suggestions
function generateSuggestions(question, fieldContext) {
  const lowerQuestion = question.toLowerCase();
  const crop = fieldContext.crop?.toLowerCase() || 'crop';
  
  const suggestionSets = {
    weather: [
      'What if there\'s too much rain?',
      'How to protect crops from extreme heat?',
      'Best practices during monsoon season?'
    ],
    water: [
      'Signs of over-watering?',
      'Drip irrigation vs sprinkler - which is better?',
      'How to conserve water during dry season?'
    ],
    pest: [
      'Organic pest control methods?',
      'How to identify pest damage early?',
      'Preventive measures against common pests?'
    ],
    fertilizer: [
      'NPK ratio for ' + crop + '?',
      'When to apply fertilizer?',
      'Organic vs chemical fertilizers - pros and cons?'
    ],
    disease: [
      'Common diseases in ' + crop + '?',
      'How to prevent fungal infections?',
      'Early symptoms of crop diseases?'
    ],
    yield: [
      'How to increase yield naturally?',
      'Best crop rotation practices?',
      'Post-harvest storage tips?'
    ],
    soil: [
      'How to improve ' + fieldContext.soilType + ' soil?',
      'Soil testing - how often?',
      'Benefits of cover crops?'
    ]
  };

  // Determine which suggestion set to use
  if (lowerQuestion.includes('weather') || lowerQuestion.includes('rain') || lowerQuestion.includes('temperature')) {
    return suggestionSets.weather;
  } else if (lowerQuestion.includes('water') || lowerQuestion.includes('irrigation')) {
    return suggestionSets.water;
  } else if (lowerQuestion.includes('pest') || lowerQuestion.includes('insect')) {
    return suggestionSets.pest;
  } else if (lowerQuestion.includes('fertilizer') || lowerQuestion.includes('nutrient')) {
    return suggestionSets.fertilizer;
  } else if (lowerQuestion.includes('disease') || lowerQuestion.includes('infection')) {
    return suggestionSets.disease;
  } else if (lowerQuestion.includes('yield') || lowerQuestion.includes('production')) {
    return suggestionSets.yield;
  } else if (lowerQuestion.includes('soil')) {
    return suggestionSets.soil;
  }

  // Default suggestions
  return [
    'What are the best practices for ' + crop + '?',
    'How to increase yield?',
    'Common problems and solutions?'
  ];
}

// @route   POST /api/ai/chat
// @desc    General AI chat for crop recommendations and farming advice
// @access  Private
router.post('/chat', protect, async (req, res) => {
  console.log('💬 AI Chat Request Received');
  
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Build conversation messages for Groq
    const messages = [
      {
        role: 'system',
        content: `You are FarmView AI Assistant, an expert agricultural advisor helping farmers in India. Your expertise includes:

🌾 CROP RECOMMENDATIONS:
- Suggest crops based on soil type, climate, water availability, and location
- Provide detailed information about crop requirements and growing seasons
- Recommend crop rotation strategies

💧 IRRIGATION & WATER MANAGEMENT:
- Advise on water requirements for different crops
- Suggest irrigation methods and schedules
- Water conservation techniques

🌡️ CLIMATE & WEATHER:
- Weather-based farming advice
- Climate-suitable crop selection
- Season-specific recommendations

🐛 PEST & DISEASE MANAGEMENT:
- Identify common pests and diseases
- Organic and chemical control methods
- Preventive measures

🌱 SOIL HEALTH:
- Soil type characteristics (Loamy, Clay, Sandy, Black, Red, Alluvial)
- Soil improvement techniques
- Fertilizer recommendations

🏆 BEST PRACTICES:
- Modern farming techniques
- Sustainable agriculture
- Yield optimization strategies

IMPORTANT GUIDELINES:
1. Keep answers concise and practical (2-4 paragraphs max)
2. Use simple language that farmers can understand
3. Include specific crop names when relevant
4. Provide actionable advice with steps when possible
5. Use emojis to make responses engaging
6. If asked about non-farming topics, politely redirect to farming questions
7. Always consider Indian farming context and conditions

Respond in a friendly, helpful tone as if talking to a farmer friend.`
      }
    ];

    // Add conversation history (last 6 messages for context)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('🤖 Calling Groq AI with', messages.length, 'messages');

    // Call Groq AI
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('✅ AI Response generated');

    res.json({
      success: true,
      data: {
        response: aiResponse
      }
    });

  } catch (error) {
    console.error('❌ AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

module.exports = router;
