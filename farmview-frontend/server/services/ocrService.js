/**
 * OCR Service - Document Text Extraction
 * Extracts text from images and PDFs using Tesseract OCR
 */

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const pdf = require('pdf-parse');
const fs = require('fs').promises;

class OCRService {
  
  /**
   * Extract text from image (JPG, PNG, JPEG)
   */
  async extractFromImage(imagePath) {
    try {
      console.log('📄 Starting OCR on image:', imagePath);
      
      // Preprocess image for better OCR accuracy
      const preprocessedPath = await this.preprocessImage(imagePath);
      
      // Perform OCR
      const result = await Tesseract.recognize(
        preprocessedPath,
        'eng+hin', // English and Hindi
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('✅ OCR completed successfully');
      
      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.map(w => ({
          text: w.text,
          confidence: w.confidence
        }))
      };
      
    } catch (error) {
      console.error('❌ OCR Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Extract text from PDF
   */
  async extractFromPDF(pdfPath) {
    try {
      console.log('📑 Extracting text from PDF:', pdfPath);
      
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);
      
      console.log('✅ PDF text extracted successfully');
      
      return {
        success: true,
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
      
    } catch (error) {
      console.error('❌ PDF Extraction Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Preprocess image for better OCR accuracy
   * - Convert to grayscale
   * - Increase contrast
   * - Sharpen
   * - Resize if too small
   */
  async preprocessImage(imagePath) {
    try {
      const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');
      
      await sharp(imagePath)
        .greyscale()
        .normalize() // Auto-adjust contrast
        .sharpen()
        .resize({
          width: 2000,
          height: 2000,
          fit: 'inside',
          withoutEnlargement: false
        })
        .toFile(outputPath);
      
      console.log('✅ Image preprocessed successfully');
      return outputPath;
      
    } catch (error) {
      console.error('⚠️ Preprocessing failed, using original image');
      return imagePath;
    }
  }
  
  /**
   * Extract specific fields from document
   */
  extractFields(text) {
    const fields = {};
    
    // Extract Aadhaar number (12 digits)
    const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    if (aadhaarMatch) {
      fields.aadhaar = aadhaarMatch[0].replace(/\s/g, '');
    }
    
    // Extract name (after keywords like "Name:", "नाम:")
    const nameMatch = text.match(/(?:Name|नाम|NAME)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (nameMatch) {
      fields.name = nameMatch[1].trim();
    }
    
    // Extract survey number (variations)
    const surveyMatch = text.match(/(?:Survey\s*No|Survey\s*Number|सर्वे\s*नं|S\.?No\.?)\s*:?\s*(\d+[-\/]?\d*)/i);
    if (surveyMatch) {
      fields.surveyNumber = surveyMatch[1];
    }
    
    // Extract area (hectares/acres)
    const areaMatch = text.match(/(?:Area|क्षेत्रफल)\s*:?\s*([\d.]+)\s*(Hectare|Acre|हेक्टर|एकड़)/i);
    if (areaMatch) {
      fields.area = parseFloat(areaMatch[1]);
      fields.areaUnit = areaMatch[2];
    }
    
    // Extract village/location
    const villageMatch = text.match(/(?:Village|गाव|Village\s*Name)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (villageMatch) {
      fields.village = villageMatch[1].trim();
    }
    
    // Extract district
    const districtMatch = text.match(/(?:District|जिल्हा|Dist\.?)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (districtMatch) {
      fields.district = districtMatch[1].trim();
    }
    
    // Extract dates
    const dateMatch = text.match(/(?:Date|तारीख|Date\s*of\s*Issue)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (dateMatch) {
      fields.date = dateMatch[1];
    }
    
    console.log('📋 Extracted Fields:', fields);
    return fields;
  }
  
  /**
   * Process document and extract relevant information
   */
  async processDocument(filePath, fileType) {
    try {
      let extractionResult;
      
      // Determine file type and extract text
      if (fileType === 'application/pdf') {
        extractionResult = await this.extractFromPDF(filePath);
      } else if (fileType.startsWith('image/')) {
        extractionResult = await this.extractFromImage(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
      
      if (!extractionResult.success) {
        return extractionResult;
      }
      
      // Extract structured fields
      const fields = this.extractFields(extractionResult.text);
      
      return {
        success: true,
        rawText: extractionResult.text,
        extractedFields: fields,
        confidence: extractionResult.confidence || 'N/A'
      };
      
    } catch (error) {
      console.error('❌ Document Processing Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OCRService();
