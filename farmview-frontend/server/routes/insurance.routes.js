const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Insurance = require('../models/Insurance.model');
const Property = require('../models/Property.model');

// @route   POST /api/insurance
// @desc    Create new insurance policy
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      policyNumber,
      policyType,
      provider,
      coverageAmount,
      premium,
      startDate,
      endDate,
      propertyId,
      autoRenewal,
      notes
    } = req.body;

    if (!policyNumber || !policyType || !provider || !coverageAmount || !premium || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if property exists (if provided)
    if (propertyId) {
      const property = await Property.findOne({
        _id: propertyId,
        farmer: req.farmer._id
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
    }

    const insurance = await Insurance.create({
      farmer: req.farmer._id,
      farmerId: req.farmer.farmerId,
      property: propertyId || null,
      policyNumber,
      policyType,
      provider,
      coverageAmount,
      premium,
      startDate,
      endDate,
      autoRenewal: autoRenewal || false,
      notes: notes || '',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Insurance policy created successfully',
      data: insurance
    });

  } catch (error) {
    console.error('Insurance Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create insurance policy',
      error: error.message
    });
  }
});

// @route   GET /api/insurance
// @desc    Get all insurance policies for farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, policyType } = req.query;
    
    const filter = { farmer: req.farmer._id };
    
    if (status) filter.status = status;
    if (policyType) filter.policyType = policyType;

    const insurances = await Insurance.find(filter)
      .populate('property', 'propertyName area')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: insurances.length,
      data: insurances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance policies',
      error: error.message
    });
  }
});

// @route   GET /api/insurance/:id
// @desc    Get single insurance policy
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const insurance = await Insurance.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    }).populate('property', 'propertyName area address');

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: insurance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance policy',
      error: error.message
    });
  }
});

// @route   POST /api/insurance/:id/claim
// @desc    Submit insurance claim
// @access  Private
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const {
      damageType,
      damageDescription,
      estimatedLoss,
      claimAmount,
      documents
    } = req.body;

    if (!damageType || !damageDescription || !claimAmount) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: damageType, damageDescription, claimAmount'
      });
    }

    const insurance = await Insurance.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    if (insurance.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit claim for inactive policy'
      });
    }

    const claimNumber = insurance.generateClaimNumber();

    const claim = {
      claimNumber,
      claimDate: new Date(),
      damageType,
      damageDescription,
      estimatedLoss: estimatedLoss || claimAmount,
      claimAmount,
      status: 'Submitted',
      documents: documents || []
    };

    insurance.claims.push(claim);
    await insurance.save();

    res.status(201).json({
      success: true,
      message: 'Insurance claim submitted successfully',
      data: {
        claimNumber,
        claim
      }
    });

  } catch (error) {
    console.error('Claim Submission Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit claim',
      error: error.message
    });
  }
});

// @route   GET /api/insurance/:id/claims
// @desc    Get all claims for insurance policy
// @access  Private
router.get('/:id/claims', protect, async (req, res) => {
  try {
    const insurance = await Insurance.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    res.status(200).json({
      success: true,
      count: insurance.claims.length,
      data: insurance.claims.sort((a, b) => b.claimDate - a.claimDate)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
});

// @route   PUT /api/insurance/:id
// @desc    Update insurance policy
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const insurance = await Insurance.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    const allowedUpdates = ['provider', 'premium', 'autoRenewal', 'notes', 'status'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedInsurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Insurance policy updated successfully',
      data: updatedInsurance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update insurance policy',
      error: error.message
    });
  }
});

// @route   DELETE /api/insurance/:id
// @desc    Delete insurance policy
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const insurance = await Insurance.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    await Insurance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Insurance policy deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete insurance policy',
      error: error.message
    });
  }
});

module.exports = router;
