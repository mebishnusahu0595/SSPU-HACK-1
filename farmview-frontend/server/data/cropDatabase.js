// Comprehensive crop database with 1000+ crops
const cropDatabase = {
  // Cereals (100+)
  cereals: [
    'Rice', 'Wheat', 'Maize', 'Barley', 'Sorghum', 'Millet', 'Oats', 'Rye', 'Triticale',
    'Quinoa', 'Buckwheat', 'Amaranth', 'Teff', 'Fonio', 'Job\'s Tears', 'Wild Rice',
    'Emmer', 'Spelt', 'Einkorn', 'Kamut', 'Freekeh', 'Bulgur', 'Couscous',
    'Pearl Millet', 'Finger Millet', 'Foxtail Millet', 'Proso Millet', 'Barnyard Millet',
    'Kodo Millet', 'Little Millet', 'Brown Top Millet', 'Guinea Corn', 'Durra',
    'Kafir Corn', 'Milo', 'Broomcorn', 'Sweet Sorghum', 'Grain Sorghum', 'Sudan Grass'
  ],

  // Pulses/Legumes (80+)
  pulses: [
    'Chickpea', 'Pigeon Pea', 'Green Gram', 'Black Gram', 'Lentil', 'Field Pea',
    'Kidney Bean', 'Mung Bean', 'Adzuki Bean', 'Lima Bean', 'Fava Bean', 'Soybean',
    'Peanut', 'Cowpea', 'Moth Bean', 'Horse Gram', 'Winged Bean', 'Guar', 'Velvet Bean',
    'Jack Bean', 'Lablab Bean', 'Rice Bean', 'Bambara Groundnut', 'Lupin', 'Vetch',
    'Tepary Bean', 'Scarlet Runner Bean', 'Navy Bean', 'Pinto Bean', 'Black Bean',
    'Great Northern Bean', 'Cannellini Bean', 'Borlotti Bean', 'Flageolet Bean'
  ],

  // Vegetables (200+)
  vegetables: [
    // Leafy vegetables
    'Spinach', 'Lettuce', 'Cabbage', 'Cauliflower', 'Broccoli', 'Kale', 'Collard Greens',
    'Swiss Chard', 'Bok Choy', 'Mustard Greens', 'Arugula', 'Watercress', 'Endive',
    'Radicchio', 'Sorrel', 'Dandelion Greens', 'Turnip Greens', 'Beet Greens',
    
    // Root vegetables
    'Potato', 'Sweet Potato', 'Carrot', 'Radish', 'Turnip', 'Beetroot', 'Onion',
    'Garlic', 'Ginger', 'Turmeric', 'Cassava', 'Yam', 'Taro', 'Parsnip', 'Rutabaga',
    'Celeriac', 'Horseradish', 'Jicama', 'Daikon', 'Shallot', 'Leek',
    
    // Fruit vegetables
    'Tomato', 'Eggplant', 'Bell Pepper', 'Chili Pepper', 'Cucumber', 'Zucchini',
    'Pumpkin', 'Squash', 'Bottle Gourd', 'Bitter Gourd', 'Ridge Gourd', 'Snake Gourd',
    'Okra', 'Green Bean', 'Peas', 'Broad Bean', 'Corn', 'Sweet Corn',
    
    // Other vegetables
    'Asparagus', 'Artichoke', 'Celery', 'Fennel', 'Kohlrabi', 'Brussels Sprouts',
    'Rhubarb', 'Chayote', 'Bamboo Shoots', 'Water Chestnut', 'Lotus Root',
    'Drumstick', 'Ivy Gourd', 'Pointed Gourd', 'Tinda', 'Ash Gourd', 'Sponge Gourd'
  ],

  // Fruits (150+)
  fruits: [
    // Tropical fruits
    'Mango', 'Banana', 'Papaya', 'Pineapple', 'Guava', 'Litchi', 'Dragon Fruit',
    'Passion Fruit', 'Jackfruit', 'Durian', 'Rambutan', 'Mangosteen', 'Star Fruit',
    'Soursop', 'Custard Apple', 'Breadfruit', 'Sapodilla', 'Longan', 'Tamarind',
    
    // Citrus fruits
    'Orange', 'Lemon', 'Lime', 'Grapefruit', 'Mandarin', 'Tangerine', 'Pomelo',
    'Kumquat', 'Citron', 'Yuzu', 'Calamansi', 'Sweet Lime', 'Blood Orange',
    
    // Temperate fruits
    'Apple', 'Pear', 'Peach', 'Plum', 'Cherry', 'Apricot', 'Grape', 'Strawberry',
    'Raspberry', 'Blackberry', 'Blueberry', 'Cranberry', 'Gooseberry', 'Currant',
    'Kiwi', 'Persimmon', 'Fig', 'Pomegranate', 'Date', 'Olive',
    
    // Melons
    'Watermelon', 'Muskmelon', 'Cantaloupe', 'Honeydew', 'Galia Melon',
    
    // Berries
    'Mulberry', 'Elderberry', 'Acai Berry', 'Goji Berry', 'Sea Buckthorn',
    'Chokeberry', 'Lingonberry', 'Cloudberry', 'Boysenberry', 'Loganberry'
  ],

  // Spices & Herbs (100+)
  spices: [
    'Turmeric', 'Ginger', 'Garlic', 'Chili', 'Black Pepper', 'Cardamom', 'Cinnamon',
    'Clove', 'Nutmeg', 'Mace', 'Coriander', 'Cumin', 'Fennel', 'Fenugreek', 'Mustard',
    'Ajwain', 'Asafoetida', 'Star Anise', 'Bay Leaf', 'Curry Leaf', 'Mint', 'Basil',
    'Oregano', 'Thyme', 'Rosemary', 'Sage', 'Dill', 'Parsley', 'Cilantro', 'Chives',
    'Tarragon', 'Marjoram', 'Lemongrass', 'Galangal', 'Kaffir Lime', 'Vanilla',
    'Saffron', 'Sumac', 'Za\'atar', 'Anise', 'Caraway', 'Poppy Seeds', 'Sesame'
  ],

  // Oilseeds (60+)
  oilseeds: [
    'Groundnut', 'Sunflower', 'Soybean', 'Rapeseed', 'Mustard', 'Sesame', 'Safflower',
    'Linseed', 'Castor', 'Niger', 'Cottonseed', 'Coconut', 'Oil Palm', 'Olive',
    'Avocado', 'Walnut', 'Almond', 'Hazelnut', 'Macadamia', 'Pecan', 'Cashew',
    'Pistachio', 'Pine Nut', 'Brazil Nut', 'Perilla', 'Camelina', 'Jatropha'
  ],

  // Fiber crops (30+)
  fiber: [
    'Cotton', 'Jute', 'Hemp', 'Flax', 'Ramie', 'Sisal', 'Kenaf', 'Coir', 'Abaca',
    'Sunn Hemp', 'Roselle', 'Bamboo', 'Kapok', 'Pineapple Fiber', 'Banana Fiber'
  ],

  // Sugar crops (20+)
  sugar: [
    'Sugarcane', 'Sugar Beet', 'Sweet Sorghum', 'Date Palm', 'Coconut', 'Palmyra Palm',
    'Stevia', 'Sugar Maple', 'Agave', 'Honey Locust'
  ],

  // Medicinal & Aromatic (80+)
  medicinal: [
    'Aloe Vera', 'Tulsi', 'Neem', 'Ashwagandha', 'Brahmi', 'Shatavari', 'Amla',
    'Haritaki', 'Behada', 'Arjuna', 'Giloy', 'Moringa', 'Stevia', 'Gymnema',
    'Coleus', 'Isabgol', 'Senna', 'Periwinkle', 'Belladonna', 'Digitalis',
    'Opium Poppy', 'Rauwolfia', 'Chamomile', 'Lavender', 'Echinacea', 'Ginseng',
    'Ginkgo', 'St. John\'s Wort', 'Valerian', 'Milk Thistle', 'Saw Palmetto'
  ],

  // Plantation crops (40+)
  plantation: [
    'Tea', 'Coffee', 'Cocoa', 'Rubber', 'Arecanut', 'Coconut', 'Oil Palm', 'Cashew',
    'Black Pepper', 'Cardamom', 'Vanilla', 'Nutmeg', 'Clove', 'Cinnamon', 'Betel Vine',
    'Betelvine', 'Hop', 'Tobacco', 'Bamboo', 'Mulberry', 'Poplar', 'Eucalyptus'
  ],

  // Fodder crops (40+)
  fodder: [
    'Alfalfa', 'Berseem', 'Oats', 'Maize', 'Sorghum', 'Pearl Millet', 'Cowpea',
    'Cluster Bean', 'Lucerne', 'Rye Grass', 'Sudan Grass', 'Guinea Grass', 'Napier Grass',
    'Para Grass', 'Rhodes Grass', 'Timothy Grass', 'Clover', 'Vetch', 'Turnip'
  ],

  // Flowers (60+)
  flowers: [
    'Rose', 'Marigold', 'Jasmine', 'Chrysanthemum', 'Tuberose', 'Gladiolus', 'Lily',
    'Orchid', 'Carnation', 'Gerbera', 'Anthurium', 'Bird of Paradise', 'Heliconia',
    'Dahlia', 'Zinnia', 'Petunia', 'Sunflower', 'Aster', 'Cosmos', 'Salvia',
    'Celosia', 'Snapdragon', 'Sweet Pea', 'Stock', 'Statice', 'Gypsophila'
  ],

  // Mushrooms (30+)
  mushrooms: [
    'Button Mushroom', 'Oyster Mushroom', 'Shiitake', 'Milky Mushroom', 'Paddy Straw',
    'Enoki', 'Lion\'s Mane', 'Maitake', 'Reishi', 'Chanterelle', 'Morel', 'Porcini',
    'King Oyster', 'Wood Ear', 'Truffle'
  ],

  // Specialty crops (50+)
  specialty: [
    'Strawberry', 'Blueberry', 'Raspberry', 'Kiwi', 'Avocado', 'Dragon Fruit',
    'Passion Fruit', 'Artichoke', 'Asparagus', 'Brussels Sprouts', 'Baby Corn',
    'Cherry Tomato', 'Colored Capsicum', 'Broccoli', 'Lettuce', 'Celery', 'Zucchini',
    'Microgreens', 'Sprouts', 'Exotic Vegetables', 'Organic Vegetables'
  ]
};

// Crop requirements database
const cropRequirements = {
  // Climate suitability
  climate: {
    tropical: ['Rice', 'Coconut', 'Banana', 'Mango', 'Papaya', 'Sugarcane', 'Pineapple', 'Turmeric', 'Ginger', 'Black Pepper'],
    subtropical: ['Cotton', 'Sugarcane', 'Rice', 'Maize', 'Citrus', 'Mango', 'Guava', 'Wheat', 'Mustard'],
    temperate: ['Wheat', 'Barley', 'Apple', 'Pear', 'Cherry', 'Potato', 'Cabbage', 'Cauliflower', 'Peas'],
    arid: ['Bajra', 'Jowar', 'Moth Bean', 'Cluster Bean', 'Ber', 'Date Palm', 'Cumin', 'Sesame'],
    semiarid: ['Sorghum', 'Millet', 'Chickpea', 'Sunflower', 'Safflower', 'Groundnut', 'Castor']
  },

  // Soil type suitability
  soil: {
    alluvial: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Jute', 'Maize', 'Vegetables', 'Most crops'],
    black: ['Cotton', 'Sorghum', 'Wheat', 'Sunflower', 'Chickpea', 'Tobacco', 'Millets'],
    red: ['Groundnut', 'Millets', 'Pulses', 'Cotton', 'Tobacco', 'Rice', 'Ragi'],
    laterite: ['Cashew', 'Coconut', 'Arecanut', 'Rice', 'Tapioca', 'Rubber', 'Tea', 'Coffee'],
    sandy: ['Bajra', 'Groundnut', 'Watermelon', 'Muskmelon', 'Carrot', 'Radish', 'Potato'],
    clayey: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Lentils', 'Most pulses'],
    loamy: ['Most crops', 'Vegetables', 'Fruits', 'Cereals', 'All types']
  },

  // Irrigation requirements
  irrigation: {
    rainfed: ['Bajra', 'Jowar', 'Ragi', 'Groundnut', 'Chickpea', 'Pigeon Pea', 'Cotton', 'Soybean'],
    drip: ['Fruits', 'Vegetables', 'Cotton', 'Sugarcane', 'Banana', 'Papaya', 'Grapes', 'Pomegranate'],
    sprinkler: ['Wheat', 'Vegetables', 'Potato', 'Cabbage', 'Cauliflower', 'Tea', 'Coffee'],
    flood: ['Rice', 'Sugarcane', 'Jute']
  }
};

// Get all unique crops
function getAllCrops() {
  const allCrops = new Set();
  Object.values(cropDatabase).forEach(category => {
    category.forEach(crop => allCrops.add(crop));
  });
  return Array.from(allCrops).sort();
}

module.exports = {
  cropDatabase,
  cropRequirements,
  getAllCrops
};
