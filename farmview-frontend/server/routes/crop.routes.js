const express = require('express');
const router = express.Router();
const { cropDatabase, cropRequirements, getAllCrops } = require('../data/cropDatabase');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/crops/all
 * @desc    Get all available crops (1000+)
 * @access  Public
 */
router.get('/all', (req, res) => {
  try {
    const allCrops = getAllCrops();
    
    res.json({
      success: true,
      count: allCrops.length,
      data: allCrops,
      categories: {
        cereals: cropDatabase.cereals.length,
        pulses: cropDatabase.pulses.length,
        vegetables: cropDatabase.vegetables.length,
        fruits: cropDatabase.fruits.length,
        spices: cropDatabase.spices.length,
        oilseeds: cropDatabase.oilseeds.length,
        others: allCrops.length - (
          cropDatabase.cereals.length +
          cropDatabase.pulses.length +
          cropDatabase.vegetables.length +
          cropDatabase.fruits.length +
          cropDatabase.spices.length +
          cropDatabase.oilseeds.length
        )
      }
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops'
    });
  }
});

/**
 * @route   POST /api/crops/recommend
 * @desc    Get crop recommendations based on property details
 * @access  Private
 */
router.post('/recommend', protect, async (req, res) => {
  try {
    const { soilType, irrigationType, latitude, longitude } = req.body;

    console.log('🌾 Generating crop recommendations for:', {
      soilType,
      irrigationType,
      location: { latitude, longitude }
    });

    // Determine climate zone based on latitude
    let climateZone = 'tropical';
    if (latitude > 30 || latitude < -30) {
      climateZone = 'temperate';
    } else if (latitude > 23.5 || latitude < -23.5) {
      climateZone = 'subtropical';
    }

    // Determine if arid/semiarid based on location (simplified)
    // In reality, this would use precipitation data
    if (Math.abs(latitude) > 15 && Math.abs(latitude) < 30) {
      if (Math.random() > 0.5) { // Placeholder logic
        climateZone = 'semiarid';
      }
    }

    // Get suitable crops based on soil type
    const soilSuitableCrops = cropRequirements.soil[soilType.toLowerCase()] || [];
    
    // Get suitable crops based on irrigation type
    const irrigationSuitableCrops = cropRequirements.irrigation[irrigationType.toLowerCase()] || [];
    
    // Get suitable crops based on climate
    const climateSuitableCrops = cropRequirements.climate[climateZone] || [];

    // Find crops that match all criteria
    const allCrops = getAllCrops();
    const recommendations = [];

    // Score each crop based on suitability
    allCrops.forEach(crop => {
      let score = 0;
      let reasons = [];

      // Check soil suitability
      if (soilSuitableCrops.includes(crop) || soilSuitableCrops.includes('Most crops')) {
        score += 40;
        reasons.push(`Excellent for ${soilType} soil`);
      }

      // Check irrigation suitability
      if (irrigationSuitableCrops.includes(crop)) {
        score += 30;
        reasons.push(`Suitable for ${irrigationType} irrigation`);
      }

      // Check climate suitability
      if (climateSuitableCrops.includes(crop)) {
        score += 30;
        reasons.push(`Thrives in ${climateZone} climate`);
      }

      // Add bonus for versatile crops
      if (crop.includes('Most') || crop.includes('All types')) {
        score += 10;
      }

      // Only include crops with some suitability
      if (score > 0) {
        recommendations.push({
          crop,
          score,
          suitability: score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Fair',
          reasons
        });
      }
    });

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);

    // Get top 50 recommendations
    const topRecommendations = recommendations.slice(0, 50);

    // Also get category-specific recommendations
    const categoryRecommendations = {
      cereals: recommendations.filter(r => cropDatabase.cereals.includes(r.crop)).slice(0, 10),
      pulses: recommendations.filter(r => cropDatabase.pulses.includes(r.crop)).slice(0, 10),
      vegetables: recommendations.filter(r => cropDatabase.vegetables.includes(r.crop)).slice(0, 15),
      fruits: recommendations.filter(r => cropDatabase.fruits.includes(r.crop)).slice(0, 10),
      spices: recommendations.filter(r => cropDatabase.spices.includes(r.crop)).slice(0, 10)
    };

    console.log(`✅ Generated ${topRecommendations.length} crop recommendations`);

    res.json({
      success: true,
      data: {
        climateZone,
        soilType,
        irrigationType,
        location: { latitude, longitude },
        topRecommendations,
        categoryRecommendations,
        totalAnalyzed: allCrops.length
      }
    });

  } catch (error) {
    console.error('❌ Error generating crop recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop recommendations'
    });
  }
});

/**
 * @route   GET /api/crops/categories
 * @desc    Get crops by category
 * @access  Public
 */
router.get('/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: cropDatabase
    });
  } catch (error) {
    console.error('Error fetching crop categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop categories'
    });
  }
});

/**
 * @route   GET /api/crops/search
 * @desc    Search crops by name
 * @access  Public
 */
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const allCrops = getAllCrops();
    const searchResults = allCrops.filter(crop =>
      crop.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });

  } catch (error) {
    console.error('Error searching crops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search crops'
    });
  }
});

module.exports = router;
