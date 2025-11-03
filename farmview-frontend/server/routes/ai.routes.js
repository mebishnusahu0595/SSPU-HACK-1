const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth.middleware');
const Property = require('../models/Property.model');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

// @route   POST /api/ai/field-advisor
// @desc    Get AI advice for a specific field
// @access  Private
router.post('/field-advisor', protect, async (req, res) => {
  try {
    const { propertyId, fieldContext, question, conversationHistory } = req.body;

    if (!question || !propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and question are required'
      });
    }

    // Verify property ownership
    const property = await Property.findOne({
      _id: propertyId,
      farmerId: req.farmer._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or not owned by you'
      });
    }

    // Build AI prompt with field context
    const systemPrompt = `You are an expert agricultural advisor helping a farmer with their field. 

**Field Information:**
- Property Name: ${fieldContext.propertyName}
- Current Crop: ${fieldContext.crop}
- Area: ${fieldContext.area} hectares
- Soil Type: ${fieldContext.soilType}
- Irrigation Type: ${fieldContext.irrigationType}
- Location Coordinates: ${fieldContext.location}
- Field Status: ${fieldContext.verified ? 'Verified' : 'Pending Verification'}

**Your Role:**
- Provide practical, actionable farming advice
- Consider the specific crop, soil, and irrigation type
- Give location-appropriate recommendations
- Use simple language that Indian farmers can understand
- Include emojis to make advice engaging
- Focus on sustainable and cost-effective practices
- Warn about common mistakes
- Suggest preventive measures

**Important Guidelines:**
- Keep responses concise (3-5 paragraphs max)
- Use bullet points for actionable steps
- Mention specific timings/seasons when relevant
- Include both traditional and modern techniques
- Address safety and environmental concerns

**Conversation History:**
${conversationHistory.slice(-6).map(msg => `${msg.role === 'user' ? 'Farmer' : 'Advisor'}: ${msg.content}`).join('\n')}

**Current Question from Farmer:**
${question}

Please provide helpful, specific advice for this farmer's field.`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const aiResponse = response.text();

    // Generate follow-up suggestions based on the topic
    const suggestions = generateSuggestions(question, fieldContext);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        suggestions,
        timestamp: new Date()
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

module.exports = router;
