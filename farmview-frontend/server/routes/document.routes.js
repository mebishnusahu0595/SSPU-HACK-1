const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const Document = require('../models/Document.model');
const documentValidationService = require('../services/documentValidationService');

// Initialize GridFS
let gridfsBucket;
const conn = mongoose.connection;

conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'documents'
  });
  console.log('✅ GridFS initialized for document storage');
});

// Use memory storage for multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// @route   POST /api/documents/upload
// @desc    Upload document
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType, documentName, documentNumber, description, category, tags } = req.body;

    if (!documentType || !documentName) {
      return res.status(400).json({
        success: false,
        message: 'Document type and name are required'
      });
    }

    // Upload file to GridFS manually
    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = gridfsBucket.openUploadStream(filename, {
      metadata: {
        farmerId: req.farmer.farmerId,
        documentType,
        originalName: req.file.originalname
      }
    });

    // Write buffer to GridFS
    uploadStream.end(req.file.buffer);

    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const document = await Document.create({
      farmer: req.farmer._id,
      farmerId: req.farmer.farmerId,
      documentType,
      documentName,
      documentNumber: documentNumber || '',
      description: description || '',
      fileId: uploadStream.id,
      filename: filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'Other',
      tags: tags ? JSON.parse(tags) : [],
      status: 'Pending Verification'
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// @route   GET /api/documents
// @desc    Get all documents for logged-in farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, status, documentType } = req.query;
    
    const filter = { farmer: req.farmer._id };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
});

// @route   GET /api/documents/file/:id
// @desc    Download/view document file
// @access  Private
router.get('/file/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const downloadStream = gridfsBucket.openDownloadStream(document.fileId);

    res.set('Content-Type', document.mimeType);
    res.set('Content-Disposition', `inline; filename="${document.filename}"`);

    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      res.status(404).json({
        success: false,
        message: 'File not found',
        error: error.message
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document details
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const allowedUpdates = ['documentName', 'documentNumber', 'description', 'category', 'tags', 'expiryDate'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from GridFS
    await gridfsBucket.delete(document.fileId);

    // Delete document record
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// @route   POST /api/documents/verify
// @desc    OCR + AI verification of document
// @access  Private
router.post('/verify', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded for verification'
      });
    }

    // Get user-provided data for comparison
    const userData = {
      ownerName: req.body.ownerName,
      surveyNumber: req.body.surveyNumber,
      area: parseFloat(req.body.area),
      village: req.body.village,
      district: req.body.district
    };

    console.log('🔍 Starting document verification...');
    console.log('User Data:', userData);

    // Save file temporarily for OCR processing
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Create document object for validation
    const documentData = {
      path: tempFilePath,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    };

    // Perform OCR + AI validation
    const validationResult = await documentValidationService.validateDocument(
      documentData,
      userData
    );

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
      const processedPath = tempFilePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp files:', cleanupError);
    }

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Verification failed',
        error: validationResult.error
      });
    }

    // Check for duplicate property
    if (userData.surveyNumber && userData.district && userData.village) {
      const duplicateCheck = await documentValidationService.checkDuplicateProperty(
        userData.surveyNumber,
        userData.district,
        userData.village
      );

      if (duplicateCheck.isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Property already registered',
          isDuplicate: true,
          existingProperty: duplicateCheck.existingProperty
        });
      }
    }

    // Upload document to GridFS if verified
    if (validationResult.status === 'verified') {
      const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
        metadata: {
          contentType: req.file.mimetype,
          farmerId: req.farmer._id.toString(),
          verified: true,
          verificationScore: validationResult.matchScore,
          extractedFields: validationResult.extractedFields
        }
      });

      uploadStream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      // Save document metadata
      const document = await Document.create({
        farmer: req.farmer._id,
        farmerId: req.farmer.farmerId,
        documentType: req.body.documentType || 'Land Document',
        documentName: req.file.originalname,
        fileId: uploadStream.id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'verified',
        verificationStatus: 'auto-verified',
        verificationScore: validationResult.matchScore,
        extractedData: validationResult.extractedFields,
        category: 'Land Records'
      });

      return res.status(200).json({
        success: true,
        message: validationResult.message,
        status: validationResult.status,
        matchScore: validationResult.matchScore,
        extractedFields: validationResult.extractedFields,
        comparison: validationResult.comparison,
        document: document,
        autoApproved: true
      });
    }

    // If not auto-verified, return verification details
    res.status(200).json({
      success: true,
      message: validationResult.message,
      status: validationResult.status,
      matchScore: validationResult.matchScore,
      extractedFields: validationResult.extractedFields,
      comparison: validationResult.comparison,
      autoApproved: false,
      requiresReupload: validationResult.status === 'rejected'
    });

  } catch (error) {
    console.error('❌ Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message
    });
  }
});

module.exports = router;
