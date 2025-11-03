/**
 * Document Validation Service
 * AI-powered validation of extracted data vs user-entered data
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ocrService = require('./ocrService');

class DocumentValidationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  
  /**
   * Validate document against user-provided data
   */
  async validateDocument(documentData, userData) {
    try {
      console.log('🤖 Starting AI validation...');
      
      // Extract fields from document using OCR
      const ocrResult = await ocrService.processDocument(
        documentData.path,
        documentData.mimetype
      );
      
      if (!ocrResult.success) {
        return {
          success: false,
          message: 'Failed to extract text from document',
          error: ocrResult.error
        };
      }
      
      // Compare extracted fields with user data
      const comparisonResult = await this.compareFields(
        ocrResult.extractedFields,
        userData,
        ocrResult.rawText
      );
      
      // Calculate overall match score
      const matchScore = this.calculateMatchScore(comparisonResult);
      
      // Auto-approve if score > 85%
      const status = matchScore >= 85 ? 'verified' : matchScore >= 70 ? 'review' : 'rejected';
      
      return {
        success: true,
        status: status,
        matchScore: matchScore,
        extractedFields: ocrResult.extractedFields,
        comparison: comparisonResult,
        message: this.getStatusMessage(status, matchScore),
        confidence: ocrResult.confidence
      };
      
    } catch (error) {
      console.error('❌ Validation Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Compare extracted fields with user data using AI
   */
  async compareFields(extractedFields, userData, rawText) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are a document verification AI. Compare the extracted data from a document with user-provided data.

**Extracted from Document (OCR):**
${JSON.stringify(extractedFields, null, 2)}

**User-Provided Data:**
- Name: ${userData.ownerName || 'N/A'}
- Survey Number: ${userData.surveyNumber || 'N/A'}
- Area: ${userData.area || 'N/A'} hectares
- Village: ${userData.village || 'N/A'}
- District: ${userData.district || 'N/A'}

**Raw Document Text (for context):**
${rawText.substring(0, 1000)}...

**Task:**
1. Compare each field (name, survey number, area, location)
2. Account for OCR errors (e.g., "0" vs "O", missing characters)
3. Consider variations (e.g., "Ram Kumar" vs "Ram")
4. Return match percentage (0-100) for each field
5. Provide overall validation result

**Response Format (JSON only):**
{
  "name": { "match": 95, "reason": "Exact match" },
  "surveyNumber": { "match": 100, "reason": "Exact match" },
  "area": { "match": 90, "reason": "Close match (10.5 vs 10.50)" },
  "location": { "match": 85, "reason": "Village name matches" },
  "overall": { "match": 92, "fraudRisk": "LOW", "recommendation": "APPROVE" }
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const comparison = JSON.parse(jsonMatch[0]);
        console.log('✅ AI Comparison Result:', comparison);
        return comparison;
      }
      
      // Fallback: Basic comparison
      return this.basicComparison(extractedFields, userData);
      
    } catch (error) {
      console.error('⚠️ AI comparison failed, using basic comparison');
      return this.basicComparison(extractedFields, userData);
    }
  }
  
  /**
   * Basic field comparison (fallback)
   */
  basicComparison(extractedFields, userData) {
    const comparison = {};
    
    // Name comparison
    if (extractedFields.name && userData.ownerName) {
      const nameSimilarity = this.stringSimilarity(
        extractedFields.name.toLowerCase(),
        userData.ownerName.toLowerCase()
      );
      comparison.name = {
        match: Math.round(nameSimilarity * 100),
        reason: nameSimilarity > 0.8 ? 'Good match' : 'Low similarity'
      };
    }
    
    // Survey number comparison
    if (extractedFields.surveyNumber && userData.surveyNumber) {
      const surveyMatch = extractedFields.surveyNumber === userData.surveyNumber;
      comparison.surveyNumber = {
        match: surveyMatch ? 100 : 0,
        reason: surveyMatch ? 'Exact match' : 'Mismatch'
      };
    }
    
    // Area comparison (allow 10% tolerance)
    if (extractedFields.area && userData.area) {
      const areaDiff = Math.abs(extractedFields.area - userData.area);
      const areaTolerance = userData.area * 0.1;
      const areaMatch = areaDiff <= areaTolerance;
      comparison.area = {
        match: areaMatch ? 95 : Math.max(0, 100 - (areaDiff / userData.area) * 100),
        reason: areaMatch ? 'Within tolerance' : 'Significant difference'
      };
    }
    
    // Location comparison
    if (extractedFields.village && userData.village) {
      const locationSimilarity = this.stringSimilarity(
        extractedFields.village.toLowerCase(),
        userData.village.toLowerCase()
      );
      comparison.location = {
        match: Math.round(locationSimilarity * 100),
        reason: locationSimilarity > 0.7 ? 'Match' : 'Different location'
      };
    }
    
    // Calculate overall
    const scores = Object.values(comparison).map(c => c.match);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    comparison.overall = {
      match: Math.round(avgScore),
      fraudRisk: avgScore >= 85 ? 'LOW' : avgScore >= 70 ? 'MEDIUM' : 'HIGH',
      recommendation: avgScore >= 85 ? 'APPROVE' : avgScore >= 70 ? 'REVIEW' : 'REJECT'
    };
    
    return comparison;
  }
  
  /**
   * Calculate overall match score
   */
  calculateMatchScore(comparison) {
    if (comparison.overall && comparison.overall.match) {
      return comparison.overall.match;
    }
    
    const scores = [];
    if (comparison.name) scores.push(comparison.name.match);
    if (comparison.surveyNumber) scores.push(comparison.surveyNumber.match);
    if (comparison.area) scores.push(comparison.area.match);
    if (comparison.location) scores.push(comparison.location.match);
    
    return scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }
  
  /**
   * Get status message
   */
  getStatusMessage(status, score) {
    switch (status) {
      case 'verified':
        return `✅ Document verified successfully! Match score: ${score}%`;
      case 'review':
        return `⚠️ Document needs review. Match score: ${score}%`;
      case 'rejected':
        return `❌ Document rejected. Match score: ${score}%. Please upload correct documents.`;
      default:
        return 'Unknown status';
    }
  }
  
  /**
   * String similarity (Levenshtein distance)
   */
  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Detect duplicate property registration
   */
  async checkDuplicateProperty(surveyNumber, district, village) {
    try {
      const Property = require('../models/Property.model');
      
      const duplicate = await Property.findOne({
        surveyNumber: surveyNumber,
        'address.district': district,
        'address.village': village
      });
      
      if (duplicate) {
        return {
          isDuplicate: true,
          existingProperty: duplicate,
          message: 'This property is already registered in the system'
        };
      }
      
      return {
        isDuplicate: false,
        message: 'No duplicate found'
      };
      
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return {
        isDuplicate: false,
        message: 'Could not check for duplicates'
      };
    }
  }
}

module.exports = new DocumentValidationService();
