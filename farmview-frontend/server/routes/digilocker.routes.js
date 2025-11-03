const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth.middleware');
const Document = require('../models/Document.model');

// @route   GET /api/digilocker/auth-url
// @desc    Get DigiLocker authorization URL
// @access  Private
router.get('/auth-url', protect, (req, res) => {
  try {
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return res.status(500).json({
        success: false,
        message: 'DigiLocker credentials not configured'
      });
    }

    const state = Buffer.from(JSON.stringify({
      farmerId: req.farmer.farmerId,
      userId: req.farmer._id
    })).toString('base64');

    const authUrl = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;

    res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate DigiLocker auth URL',
      error: error.message
    });
  }
});

// @route   POST /api/digilocker/callback
// @desc    Handle DigiLocker OAuth callback
// @access  Public
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code and state are required'
      });
    }

    // Decode state to get farmer info
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    const { farmerId, userId } = decodedState;

    // Exchange code for access token
    const tokenResponse = await axios.post('https://digilocker.meripehchaan.gov.in/public/oauth2/1/token', {
      code,
      grant_type: 'authorization_code',
      client_id: process.env.DIGILOCKER_CLIENT_ID,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
      redirect_uri: process.env.DIGILOCKER_REDIRECT_URI
    });

    const accessToken = tokenResponse.data.access_token;

    res.status(200).json({
      success: true,
      message: 'DigiLocker connected successfully',
      data: {
        accessToken,
        farmerId
      }
    });

  } catch (error) {
    console.error('DigiLocker Callback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect DigiLocker',
      error: error.message
    });
  }
});

// @route   GET /api/digilocker/documents
// @desc    Fetch documents from DigiLocker
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'DigiLocker access token is required'
      });
    }

    // Fetch issued documents
    const response = await axios.get('https://digilocker.meripehchaan.gov.in/public/oauth2/1/file/issued', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const documents = response.data.items || [];

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    console.error('DigiLocker Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents from DigiLocker',
      error: error.response?.data?.message || error.message
    });
  }
});

// @route   POST /api/digilocker/import
// @desc    Import document from DigiLocker to FarmView
// @access  Private
router.post('/import', protect, async (req, res) => {
  try {
    const { accessToken, uri, documentType, documentName } = req.body;

    if (!accessToken || !uri || !documentType || !documentName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: accessToken, uri, documentType, documentName'
      });
    }

    // Fetch document content from DigiLocker
    const response = await axios.get(`https://digilocker.meripehchaan.gov.in/public/oauth2/1/file/${uri}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      responseType: 'arraybuffer'
    });

    // Note: In a real implementation, you would:
    // 1. Save the file to GridFS
    // 2. Create a Document record
    // For now, we'll create a placeholder

    const document = await Document.create({
      farmer: req.farmer._id,
      farmerId: req.farmer.farmerId,
      documentType,
      documentName,
      description: 'Imported from DigiLocker',
      isFromDigilocker: true,
      digilockerUri: uri,
      category: 'Government',
      status: 'Active',
      // Note: fileId, filename, mimeType, fileSize would be set after GridFS upload
      fileId: null, // Placeholder
      filename: documentName,
      mimeType: 'application/pdf',
      fileSize: response.data.length
    });

    res.status(201).json({
      success: true,
      message: 'Document imported from DigiLocker successfully',
      data: document
    });

  } catch (error) {
    console.error('DigiLocker Import Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import document from DigiLocker',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
