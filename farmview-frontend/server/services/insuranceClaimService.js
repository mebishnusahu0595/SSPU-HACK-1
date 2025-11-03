/**
 * FarmView AI - Automated Insurance Claim Service
 * GeoAI-powered claim processing with fraud detection
 */

const axios = require('axios');
const Property = require('../models/Property.model');
const Insurance = require('../models/Insurance.model');
const sentinelService = require('./sentinelService');

class InsuranceClaimService {
  
  /**
   * Step A: Initiate Claim (Farmer's End)
   * Farmer clicks "Nuksaan ka Daava Karein" button
   */
  async initiateClaim(propertyId, farmerId, claimDetails) {
    try {
      console.log(`🔔 Claim Initiated by Farmer: ${farmerId} for Property: ${propertyId}`);
      
      // Fetch property and verify ownership
      const property = await Property.findById(propertyId);
      if (!property || property.farmer.toString() !== farmerId) {
        return {
          success: false,
          message: 'Invalid property or unauthorized access',
          eligible: false
        };
      }
      
      // Check if property has active insurance
      const insurance = await Insurance.findOne({
        property: propertyId,
        status: 'Active',
        endDate: { $gte: new Date() }
      });
      
      if (!insurance) {
        return {
          success: false,
          message: 'कोई सक्रिय बीमा पॉलिसी नहीं मिली। (No active insurance policy found)',
          eligible: false
        };
      }
      
      console.log(`✅ Farmer Eligible - Policy ID: ${insurance.policyNumber}`);
      
      // Proceed to Step B: GeoAI Evidence Generation
      const evidenceResult = await this.generateGeoAIEvidence(property, insurance, claimDetails);
      
      return evidenceResult;
      
    } catch (error) {
      console.error('❌ Error in initiateClaim:', error);
      throw error;
    }
  }
  
  /**
   * Step B: GeoAI Evidence Generation (System Core)
   * Automated satellite-based damage assessment in seconds
   */
  async generateGeoAIEvidence(property, insurance, claimDetails) {
    try {
      console.log('🛰️ Step B: Generating GeoAI Evidence...');
      
      // Extract coordinates from property GeoJSON
      const coordinates = property.location.coordinates[0];
      const bbox = this.calculateBoundingBox(coordinates);
      
      // Layer 1: Policy Data Verification
      const policyVerified = await this.verifyPolicyCoordinates(insurance.policyNumber, bbox);
      if (!policyVerified.valid) {
        return {
          success: false,
          message: 'Policy coordinates verification failed',
          fraudRisk: 'HIGH',
          reason: policyVerified.reason
        };
      }
      
      // Fetch current satellite data (NDVI analysis)
      const currentDate = new Date();
      const fromDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      console.log('📡 Fetching current NDVI data...');
      const currentNDVI = await sentinelService.getNDVI({
        bbox: bbox,
        fromDate: fromDate.toISOString(),
        toDate: currentDate.toISOString(),
        width: 512,
        height: 512
      });
      
      // Layer 2: Historical Baseline Check (90 days ago)
      console.log('📊 Fetching historical baseline (90 days ago)...');
      const historicalDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      const historicalFromDate = new Date(historicalDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const historicalNDVI = await sentinelService.getNDVI({
        bbox: bbox,
        fromDate: historicalFromDate.toISOString(),
        toDate: historicalDate.toISOString(),
        width: 512,
        height: 512
      });
      
      // Calculate damage percentage
      const damageAnalysis = this.calculateDamageScore(currentNDVI, historicalNDVI, property);
      
      // Anti-Fraud Check: Damage Consistency
      const fraudCheck = this.performFraudCheck(
        damageAnalysis,
        claimDetails.claimedDamagePercent,
        property
      );
      
      if (fraudCheck.fraudRisk === 'HIGH') {
        return {
          success: false,
          message: 'Claim flagged for manual review',
          fraudRisk: 'HIGH',
          reason: fraudCheck.reason,
          evidence: damageAnalysis
        };
      }
      
      // Step C: Generate Structured Report
      const structuredReport = this.generateStructuredReport(
        property,
        insurance,
        damageAnalysis,
        fraudCheck,
        claimDetails
      );
      
      // Step D: FinTech Integration & Payout
      const payoutResult = await this.submitClaimToInsurer(structuredReport);
      
      return {
        success: true,
        message: 'आपका दावा सफलतापूर्वक दर्ज हो गया है। (Claim filed successfully)',
        claimId: payoutResult.claimId,
        damageScore: damageAnalysis.damagePercent,
        estimatedPayout: payoutResult.estimatedPayout,
        processingTime: payoutResult.processingTime,
        status: payoutResult.status,
        evidence: {
          currentNDVI: damageAnalysis.currentAvgNDVI,
          historicalNDVI: damageAnalysis.historicalAvgNDVI,
          damageHeatmap: currentNDVI.ndviData,
          geoReference: bbox
        }
      };
      
    } catch (error) {
      console.error('❌ Error in generateGeoAIEvidence:', error);
      throw error;
    }
  }
  
  /**
   * Calculate bounding box from property coordinates
   */
  calculateBoundingBox(coordinates) {
    const lons = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    return [
      Math.min(...lons), // minLon
      Math.min(...lats), // minLat
      Math.max(...lons), // maxLon
      Math.max(...lats)  // maxLat
    ];
  }
  
  /**
   * Layer 1: Policy Data Verification
   * Mock API - In real system, this calls Insurer's CMS
   */
  async verifyPolicyCoordinates(policyNumber, bbox) {
    console.log(`🔍 Verifying Policy: ${policyNumber} with coordinates`);
    
    // Mock verification - In production, call Insurer's API
    // For hackathon, we simulate the verification
    
    // Anti-Fraud Check: Check if coordinates are valid land area
    const bboxArea = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
    
    if (bboxArea <= 0 || bboxArea > 1) { // Too small or too large
      return {
        valid: false,
        reason: 'Invalid land area detected - possible fake coordinates'
      };
    }
    
    return {
      valid: true,
      verifiedCoordinates: bbox,
      policyStatus: 'ACTIVE'
    };
  }
  
  /**
   * Calculate damage score from NDVI data
   */
  calculateDamageScore(currentNDVI, historicalNDVI, property) {
    // In production, parse actual NDVI values from image data
    // For now, simulate based on available data
    
    // Mock calculation - Real implementation would analyze pixel values
    const currentAvgNDVI = 0.35;  // Example: Current crop health
    const historicalAvgNDVI = 0.75; // Example: Healthy baseline
    
    const ndviDrop = historicalAvgNDVI - currentAvgNDVI;
    const damagePercent = Math.min(100, Math.round((ndviDrop / historicalAvgNDVI) * 100));
    
    return {
      currentAvgNDVI: currentAvgNDVI.toFixed(2),
      historicalAvgNDVI: historicalAvgNDVI.toFixed(2),
      ndviDrop: ndviDrop.toFixed(2),
      damagePercent: damagePercent,
      severity: damagePercent > 70 ? 'CRITICAL' : damagePercent > 40 ? 'HIGH' : 'MEDIUM',
      cropType: property.currentCrop,
      analysisDate: new Date().toISOString()
    };
  }
  
  /**
   * Layer 2: Anti-Fraud Check
   */
  performFraudCheck(damageAnalysis, claimedDamage, property) {
    console.log('🛡️ Performing Anti-Fraud Check...');
    
    const calculatedDamage = damageAnalysis.damagePercent;
    const damageDifference = Math.abs(calculatedDamage - claimedDamage);
    
    // Check 1: Historical Baseline Check
    if (damageAnalysis.historicalAvgNDVI < 0.3) {
      return {
        fraudRisk: 'HIGH',
        reason: 'No healthy crop detected in historical data - Fake Field suspected',
        confidence: 95
      };
    }
    
    // Check 2: Damage Consistency Check
    if (damageDifference > 30) {
      return {
        fraudRisk: 'HIGH',
        reason: `Exaggerated damage claim - Satellite shows ${calculatedDamage}% but claimed ${claimedDamage}%`,
        confidence: 90
      };
    }
    
    if (damageDifference > 15) {
      return {
        fraudRisk: 'MEDIUM',
        reason: 'Minor inconsistency detected - May require field verification',
        confidence: 70
      };
    }
    
    return {
      fraudRisk: 'LOW',
      reason: 'Damage claim consistent with satellite evidence',
      confidence: 98
    };
  }
  
  /**
   * Step C: Generate Structured Digital Report (JSON)
   */
  generateStructuredReport(property, insurance, damageAnalysis, fraudCheck, claimDetails) {
    return {
      claimMetadata: {
        claimId: `CLM-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      policyInformation: {
        policyNumber: insurance.policyNumber,
        policyType: insurance.insuranceType,
        insuredValue: insurance.sumInsured,
        validFrom: insurance.startDate,
        validTo: insurance.endDate
      },
      propertyInformation: {
        propertyId: property._id,
        location: property.location,
        area: property.area,
        cropType: property.currentCrop,
        soilType: property.soilType
      },
      damageEvidence: {
        source: 'Sentinel-2 Satellite (GeoAI)',
        analysisMethod: 'NDVI Comparison',
        currentNDVI: damageAnalysis.currentAvgNDVI,
        baselineNDVI: damageAnalysis.historicalAvgNDVI,
        damagePercentage: damageAnalysis.damagePercent,
        severity: damageAnalysis.severity,
        geoReference: property.location.coordinates
      },
      fraudAssessment: {
        riskLevel: fraudCheck.fraudRisk,
        confidence: fraudCheck.confidence,
        reason: fraudCheck.reason,
        autoApproved: fraudCheck.fraudRisk === 'LOW'
      },
      claimDetails: {
        claimedBy: claimDetails.farmerId,
        claimReason: claimDetails.reason,
        claimDate: new Date().toISOString()
      }
    };
  }
  
  /**
   * Step D: Submit claim to Insurer's CMS (Mock API)
   */
  async submitClaimToInsurer(structuredReport) {
    console.log('💰 Step D: Submitting claim to Insurer CMS...');
    
    // Mock API call - In production, this calls actual Insurer API
    // For hackathon, simulate the response
    
    const isAutoApproved = structuredReport.fraudAssessment.autoApproved;
    const damagePercent = structuredReport.damageEvidence.damagePercentage;
    const insuredValue = structuredReport.policyInformation.insuredValue;
    
    const estimatedPayout = Math.round((damagePercent / 100) * insuredValue);
    
    // Simulate processing time
    const processingTime = isAutoApproved ? '2 minutes' : '24-48 hours';
    
    return {
      claimId: structuredReport.claimMetadata.claimId,
      status: isAutoApproved ? 'AUTO_APPROVED' : 'PENDING_REVIEW',
      estimatedPayout: estimatedPayout,
      processingTime: processingTime,
      message: isAutoApproved 
        ? 'आपका दावा स्वीकृत हो गया है। राशि 2 मिनट में खाते में आ जाएगी। (Claim approved - Payout in 2 minutes)'
        : 'आपका दावा समीक्षा के लिए भेजा गया है। (Claim under review)',
      insurerReference: `INS-${Date.now()}`
    };
  }
  
  /**
   * Get claim status
   */
  async getClaimStatus(claimId) {
    // In production, fetch from database
    return {
      claimId: claimId,
      status: 'PROCESSING',
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new InsuranceClaimService();
