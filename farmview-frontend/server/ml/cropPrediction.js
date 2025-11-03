/**
 * ML-based Crop Damage Prediction Algorithm
 * Predicts crop health risks based on weather conditions
 */

class CropDamagePrediction {
  constructor() {
    // Crop vulnerability profiles based on agricultural research
    this.cropProfiles = {
      'Wheat': {
        optimalTemp: { min: 15, max: 25 },
        optimalRain: { min: 3, max: 5 },
        sensitivities: {
          waterlogging: 9, // 1-10 scale (10 = most sensitive)
          drought: 7,
          heat: 6,
          cold: 8,
          humidity: 5
        },
        stages: {
          germination: { rain: 8, heat: 6, cold: 9 },
          vegetative: { rain: 7, heat: 5, cold: 7 },
          flowering: { rain: 9, heat: 8, cold: 9 },
          maturity: { rain: 8, heat: 7, cold: 6 }
        }
      },
      'Rice': {
        optimalTemp: { min: 20, max: 35 },
        optimalRain: { min: 10, max: 15 },
        sensitivities: {
          waterlogging: 3, // Rice is flood-tolerant
          drought: 10, // Very drought-sensitive
          heat: 7,
          cold: 9,
          humidity: 4
        },
        stages: {
          germination: { rain: 10, heat: 6, cold: 8 },
          vegetative: { rain: 9, heat: 5, cold: 7 },
          flowering: { rain: 10, heat: 8, cold: 9 },
          maturity: { rain: 7, heat: 6, cold: 5 }
        }
      },
      'Cotton': {
        optimalTemp: { min: 21, max: 35 },
        optimalRain: { min: 4, max: 8 },
        sensitivities: {
          waterlogging: 8,
          drought: 5, // Moderately drought-tolerant
          heat: 6,
          cold: 9,
          humidity: 7 // Prone to fungal diseases
        },
        stages: {
          germination: { rain: 7, heat: 6, cold: 8 },
          vegetative: { rain: 6, heat: 5, cold: 7 },
          flowering: { rain: 8, heat: 7, cold: 9 },
          maturity: { rain: 9, heat: 6, cold: 8 }
        }
      },
      'Maize': {
        optimalTemp: { min: 18, max: 32 },
        optimalRain: { min: 5, max: 8 },
        sensitivities: {
          waterlogging: 7,
          drought: 8,
          heat: 7,
          cold: 7,
          humidity: 6
        },
        stages: {
          germination: { rain: 8, heat: 7, cold: 8 },
          vegetative: { rain: 7, heat: 6, cold: 6 },
          flowering: { rain: 9, heat: 9, cold: 8 },
          maturity: { rain: 6, heat: 7, cold: 5 }
        }
      },
      'Sugarcane': {
        optimalTemp: { min: 20, max: 30 },
        optimalRain: { min: 8, max: 12 },
        sensitivities: {
          waterlogging: 6,
          drought: 6,
          heat: 5,
          cold: 8,
          humidity: 5
        },
        stages: {
          germination: { rain: 8, heat: 6, cold: 7 },
          vegetative: { rain: 7, heat: 5, cold: 6 },
          flowering: { rain: 8, heat: 6, cold: 8 },
          maturity: { rain: 7, heat: 6, cold: 7 }
        }
      },
      'Tomato': {
        optimalTemp: { min: 18, max: 27 },
        optimalRain: { min: 3, max: 6 },
        sensitivities: {
          waterlogging: 9,
          drought: 8,
          heat: 9, // Very heat-sensitive
          cold: 9,
          humidity: 8 // Prone to diseases
        },
        stages: {
          germination: { rain: 7, heat: 8, cold: 9 },
          vegetative: { rain: 8, heat: 7, cold: 8 },
          flowering: { rain: 9, heat: 9, cold: 9 },
          maturity: { rain: 8, heat: 8, cold: 7 }
        }
      },
      'Potato': {
        optimalTemp: { min: 15, max: 25 },
        optimalRain: { min: 4, max: 7 },
        sensitivities: {
          waterlogging: 9,
          drought: 7,
          heat: 8,
          cold: 6, // Somewhat cold-tolerant
          humidity: 7
        },
        stages: {
          germination: { rain: 8, heat: 7, cold: 6 },
          vegetative: { rain: 7, heat: 8, cold: 5 },
          flowering: { rain: 8, heat: 9, cold: 7 },
          maturity: { rain: 9, heat: 8, cold: 6 }
        }
      }
    };
  }

  /**
   * Main prediction method - analyzes weather and predicts crop damage
   * @param {Object} params - Prediction parameters
   * @returns {Object} - Prediction results with risk assessment
   */
  async predictCropDamage({
    cropType,
    currentWeather,
    forecastWeather,
    soilType,
    irrigationType,
    growthStage = 'vegetative'
  }) {
    const crop = this.cropProfiles[cropType];
    
    if (!crop) {
      return {
        success: false,
        message: `Crop type "${cropType}" not found in database`
      };
    }

    // Extract weather data
    const temp = currentWeather.temperature;
    const rain = currentWeather.rainfall || 0;
    const humidity = currentWeather.humidity;
    const windSpeed = currentWeather.windSpeed || 0;

    // Calculate individual risk factors
    const risks = {
      waterlogging: this.calculateWaterloggingRisk(rain, soilType, crop, growthStage),
      drought: this.calculateDroughtRisk(rain, temp, irrigationType, crop, growthStage),
      heatStress: this.calculateHeatStressRisk(temp, humidity, crop, growthStage),
      coldStress: this.calculateColdStressRisk(temp, crop, growthStage),
      diseaseRisk: this.calculateDiseaseRisk(humidity, rain, temp, crop),
      windDamage: this.calculateWindDamageRisk(windSpeed, growthStage)
    };

    // Analyze forecast for upcoming risks
    const forecastRisks = this.analyzeForecast(forecastWeather, crop, growthStage);

    // Calculate overall risk score (weighted average)
    const overallRisk = this.calculateOverallRisk(risks, forecastRisks);

    // Generate recommendations
    const recommendations = this.generateRecommendations(risks, forecastRisks, cropType, growthStage);

    // Determine alert level
    const alertLevel = this.determineAlertLevel(overallRisk);

    return {
      success: true,
      cropType,
      growthStage,
      currentConditions: currentWeather,
      riskAssessment: {
        overallRiskScore: overallRisk.toFixed(2),
        riskLevel: alertLevel,
        confidenceScore: this.calculateConfidence(risks),
        individualRisks: risks,
        forecastRisks
      },
      alerts: this.generateAlerts(risks, forecastRisks, cropType),
      recommendations,
      predictedDamage: this.predictDamageSeverity(overallRisk),
      timestamp: new Date()
    };
  }

  /**
   * Calculate waterlogging risk
   */
  calculateWaterloggingRisk(rainfall, soilType, crop, stage) {
    const baseSensitivity = crop.sensitivities.waterlogging;
    const stageSensitivity = crop.stages[stage]?.rain || 5;
    
    // Soil drainage factor
    const soilFactor = {
      'Sandy': 0.3,
      'Loamy': 0.5,
      'Clay': 0.9,
      'Black Soil': 0.8,
      'Red Soil': 0.6
    }[soilType] || 0.5;

    // Heavy rain thresholds
    let rainFactor = 0;
    if (rainfall > 100) rainFactor = 10; // Extreme
    else if (rainfall > 70) rainFactor = 8; // Very High
    else if (rainfall > 50) rainFactor = 6; // High
    else if (rainfall > 30) rainFactor = 4; // Moderate
    else if (rainfall > 15) rainFactor = 2; // Low

    // Calculate risk (0-10 scale)
    const risk = (baseSensitivity * 0.4 + stageSensitivity * 0.3 + rainFactor * 0.3) * soilFactor;
    
    return {
      score: Math.min(risk, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        rainfall: `${rainfall}mm`,
        cropSensitivity: baseSensitivity,
        stageSensitivity,
        soilDrainage: soilType
      }
    };
  }

  /**
   * Calculate drought risk
   */
  calculateDroughtRisk(rainfall, temperature, irrigationType, crop, stage) {
    const baseSensitivity = crop.sensitivities.drought;
    const stageSensitivity = crop.stages[stage]?.rain || 5;
    
    // Irrigation factor (reduces risk)
    const irrigationFactor = {
      'Drip': 0.2,
      'Sprinkler': 0.3,
      'Flood': 0.5,
      'Rainfed': 1.0
    }[irrigationType] || 0.7;

    // Low rainfall thresholds
    let rainFactor = 0;
    if (rainfall < 1) rainFactor = 10; // Extreme drought
    else if (rainfall < 2) rainFactor = 8; // Severe drought
    else if (rainfall < 3) rainFactor = 6; // Moderate drought
    else if (rainfall < 5) rainFactor = 3; // Mild drought

    // High temperature amplifies drought
    const tempFactor = temperature > 35 ? 1.3 : temperature > 30 ? 1.1 : 1.0;

    const risk = (baseSensitivity * 0.35 + stageSensitivity * 0.25 + rainFactor * 0.4) * irrigationFactor * tempFactor;
    
    return {
      score: Math.min(risk, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        rainfall: `${rainfall}mm`,
        temperature: `${temperature}°C`,
        irrigation: irrigationType,
        cropSensitivity: baseSensitivity
      }
    };
  }

  /**
   * Calculate heat stress risk
   */
  calculateHeatStressRisk(temperature, humidity, crop, stage) {
    const baseSensitivity = crop.sensitivities.heat;
    const stageSensitivity = crop.stages[stage]?.heat || 5;
    const optimalMax = crop.optimalTemp.max;

    let tempExcess = temperature - optimalMax;
    let tempFactor = 0;
    if (tempExcess > 15) tempFactor = 10; // Extreme heat
    else if (tempExcess > 10) tempFactor = 8; // Severe heat
    else if (tempExcess > 5) tempFactor = 6; // High heat
    else if (tempExcess > 2) tempFactor = 3; // Moderate heat

    // High humidity worsens heat stress
    const humidityFactor = humidity > 80 ? 1.2 : humidity > 70 ? 1.1 : 1.0;

    const risk = (baseSensitivity * 0.4 + stageSensitivity * 0.3 + tempFactor * 0.3) * humidityFactor;
    
    return {
      score: Math.min(risk, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        temperature: `${temperature}°C`,
        optimal: `${crop.optimalTemp.min}-${crop.optimalTemp.max}°C`,
        humidity: `${humidity}%`,
        cropSensitivity: baseSensitivity
      }
    };
  }

  /**
   * Calculate cold stress risk
   */
  calculateColdStressRisk(temperature, crop, stage) {
    const baseSensitivity = crop.sensitivities.cold;
    const stageSensitivity = crop.stages[stage]?.cold || 5;
    const optimalMin = crop.optimalTemp.min;

    let tempDeficit = optimalMin - temperature;
    let tempFactor = 0;
    if (temperature < 5) tempFactor = 10; // Frost danger
    else if (tempDeficit > 10) tempFactor = 8; // Severe cold
    else if (tempDeficit > 5) tempFactor = 6; // High cold
    else if (tempDeficit > 2) tempFactor = 3; // Moderate cold

    const risk = baseSensitivity * 0.5 + stageSensitivity * 0.2 + tempFactor * 0.3;
    
    return {
      score: Math.min(risk, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        temperature: `${temperature}°C`,
        optimal: `${crop.optimalTemp.min}-${crop.optimalTemp.max}°C`,
        cropSensitivity: baseSensitivity,
        frostRisk: temperature < 5
      }
    };
  }

  /**
   * Calculate disease risk
   */
  calculateDiseaseRisk(humidity, rainfall, temperature, crop) {
    const baseSensitivity = crop.sensitivities.humidity;
    
    // High humidity + moderate temp + rain = disease outbreak
    const humidityFactor = humidity > 85 ? 8 : humidity > 75 ? 6 : humidity > 65 ? 3 : 0;
    const rainFactor = rainfall > 20 ? 1.3 : rainfall > 10 ? 1.1 : 1.0;
    const tempFactor = (temperature > 20 && temperature < 30) ? 1.2 : 1.0;

    const risk = (baseSensitivity * 0.5 + humidityFactor * 0.5) * rainFactor * tempFactor;
    
    return {
      score: Math.min(risk, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        humidity: `${humidity}%`,
        rainfall: `${rainfall}mm`,
        temperature: `${temperature}°C`,
        conditions: humidity > 80 && rainfall > 15 ? 'Fungal disease risk high' : 'Normal'
      }
    };
  }

  /**
   * Calculate wind damage risk
   */
  calculateWindDamageRisk(windSpeed, stage) {
    let risk = 0;
    if (windSpeed > 70) risk = 10; // Catastrophic
    else if (windSpeed > 50) risk = 8; // Severe
    else if (windSpeed > 40) risk = 6; // High
    else if (windSpeed > 30) risk = 3; // Moderate

    // Flowering and fruiting stages more vulnerable
    const stageFactor = (stage === 'flowering' || stage === 'maturity') ? 1.3 : 1.0;

    return {
      score: Math.min(risk * stageFactor, 10).toFixed(1),
      level: this.getRiskLevel(risk),
      factors: {
        windSpeed: `${windSpeed} km/h`,
        stage,
        vulnerability: stageFactor > 1 ? 'High' : 'Normal'
      }
    };
  }

  /**
   * Analyze forecast for upcoming risks
   */
  analyzeForecast(forecast, crop, stage) {
    if (!forecast || forecast.length === 0) {
      return { hasData: false };
    }

    const upcomingRisks = [];

    forecast.forEach((day, index) => {
      const dayNum = index + 1;
      
      // Check for heavy rain
      if (day.rainfall > 50) {
        upcomingRisks.push({
          day: dayNum,
          type: 'Heavy Rainfall',
          severity: day.rainfall > 100 ? 'Critical' : 'High',
          value: `${day.rainfall}mm`,
          impact: 'Waterlogging risk'
        });
      }

      // Check for extreme heat
      if (day.temperature > crop.optimalTemp.max + 5) {
        upcomingRisks.push({
          day: dayNum,
          type: 'Heat Wave',
          severity: day.temperature > crop.optimalTemp.max + 10 ? 'Critical' : 'High',
          value: `${day.temperature}°C`,
          impact: 'Heat stress, wilting'
        });
      }

      // Check for frost
      if (day.temperature < 5) {
        upcomingRisks.push({
          day: dayNum,
          type: 'Frost Warning',
          severity: 'Critical',
          value: `${day.temperature}°C`,
          impact: 'Severe frost damage'
        });
      }

      // Check for drought conditions
      if (day.rainfall < 1 && day.temperature > 35) {
        upcomingRisks.push({
          day: dayNum,
          type: 'Drought Conditions',
          severity: 'Medium',
          value: `${day.rainfall}mm rain, ${day.temperature}°C`,
          impact: 'Water stress'
        });
      }
    });

    return {
      hasData: true,
      upcomingRisks,
      summary: upcomingRisks.length > 0 
        ? `${upcomingRisks.length} potential risks in next ${forecast.length} days`
        : 'No significant risks in forecast'
    };
  }

  /**
   * Calculate overall risk score
   */
  calculateOverallRisk(risks, forecastRisks) {
    const weights = {
      waterlogging: 0.20,
      drought: 0.20,
      heatStress: 0.15,
      coldStress: 0.15,
      diseaseRisk: 0.15,
      windDamage: 0.15
    };

    let totalRisk = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalRisk += parseFloat(risks[key].score) * weight;
    }

    // Factor in forecast risks
    if (forecastRisks.hasData && forecastRisks.upcomingRisks?.length > 0) {
      const criticalForecast = forecastRisks.upcomingRisks.filter(r => r.severity === 'Critical').length;
      totalRisk += criticalForecast * 0.5; // Add 0.5 per critical forecast risk
    }

    return Math.min(totalRisk, 10);
  }

  /**
   * Calculate confidence score for prediction
   */
  calculateConfidence(risks) {
    // Higher confidence when multiple risk factors agree
    const scores = Object.values(risks).map(r => parseFloat(r.score));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    
    // Low variance = high agreement = high confidence
    const confidence = Math.max(0.5, 1 - (variance / 25));
    return confidence.toFixed(2);
  }

  /**
   * Determine alert level
   */
  determineAlertLevel(riskScore) {
    if (riskScore >= 8) return 'Critical';
    if (riskScore >= 6) return 'High';
    if (riskScore >= 4) return 'Medium';
    if (riskScore >= 2) return 'Low';
    return 'Normal';
  }

  /**
   * Get risk level from score
   */
  getRiskLevel(score) {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    if (score >= 2) return 'Low';
    return 'Normal';
  }

  /**
   * Predict damage severity
   */
  predictDamageSeverity(riskScore) {
    if (riskScore >= 8) return 'Severe - Significant crop loss expected';
    if (riskScore >= 6) return 'Moderate - Noticeable damage likely';
    if (riskScore >= 4) return 'Minor - Some impact on yield';
    if (riskScore >= 2) return 'Minimal - Slight stress possible';
    return 'None - Conditions favorable';
  }

  /**
   * Generate alerts based on risks
   */
  generateAlerts(risks, forecastRisks, cropType) {
    const alerts = [];

    // Current condition alerts
    Object.entries(risks).forEach(([riskType, data]) => {
      if (parseFloat(data.score) >= 6) {
        alerts.push({
          type: riskType,
          severity: data.level,
          message: this.getAlertMessage(riskType, data, cropType),
          immediate: true
        });
      }
    });

    // Forecast alerts
    if (forecastRisks.hasData && forecastRisks.upcomingRisks) {
      forecastRisks.upcomingRisks.forEach(risk => {
        if (risk.severity === 'Critical' || risk.severity === 'High') {
          alerts.push({
            type: risk.type,
            severity: risk.severity,
            message: `${risk.type} expected in ${risk.day} day(s): ${risk.value}. ${risk.impact}`,
            immediate: false,
            daysAhead: risk.day
          });
        }
      });
    }

    return alerts;
  }

  /**
   * Get alert message
   */
  getAlertMessage(riskType, data, cropType) {
    const messages = {
      waterlogging: `⚠️ Heavy rainfall detected! Your ${cropType} crop is at ${data.level} risk of waterlogging. Rainfall: ${data.factors.rainfall}`,
      drought: `🌵 Drought conditions! Your ${cropType} crop needs water. Only ${data.factors.rainfall} rainfall. ${data.level} risk.`,
      heatStress: `🌡️ Heat wave alert! Temperature ${data.factors.temperature} exceeds optimal range. ${data.level} heat stress risk for ${cropType}.`,
      coldStress: `❄️ Cold wave warning! Temperature ${data.factors.temperature} below optimal. ${data.factors.frostRisk ? 'FROST DANGER!' : data.level + ' cold stress risk'}.`,
      diseaseRisk: `🦠 Disease risk elevated! ${data.factors.conditions}. Humidity: ${data.factors.humidity}. Monitor ${cropType} for fungal infections.`,
      windDamage: `💨 Strong winds detected! Wind speed ${data.factors.windSpeed}. ${data.level} risk of physical damage to ${cropType}.`
    };

    return messages[riskType] || `${riskType} detected at ${data.level} level`;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(risks, forecastRisks, cropType, stage) {
    const recommendations = [];

    // Waterlogging recommendations
    if (parseFloat(risks.waterlogging.score) >= 5) {
      recommendations.push({
        priority: 'High',
        action: 'Improve drainage system immediately',
        details: 'Clear drainage channels, create water outlets to prevent waterlogging',
        timeframe: 'Within 24 hours'
      });
      recommendations.push({
        priority: 'Medium',
        action: 'Avoid irrigation during heavy rain period',
        details: 'Stop scheduled irrigation to prevent excess water accumulation',
        timeframe: 'Immediate'
      });
    }

    // Drought recommendations
    if (parseFloat(risks.drought.score) >= 5) {
      recommendations.push({
        priority: 'High',
        action: 'Increase irrigation frequency',
        details: 'Schedule additional irrigation sessions to prevent water stress',
        timeframe: 'Within 12 hours'
      });
      recommendations.push({
        priority: 'Medium',
        action: 'Apply mulching to conserve soil moisture',
        details: 'Organic mulch can reduce evaporation by 30-50%',
        timeframe: 'Within 2-3 days'
      });
    }

    // Heat stress recommendations
    if (parseFloat(risks.heatStress.score) >= 5) {
      recommendations.push({
        priority: 'High',
        action: 'Provide shade or cooling measures',
        details: 'Use shade nets (25-50%) or increase irrigation to cool plants',
        timeframe: 'Within 24 hours'
      });
      recommendations.push({
        priority: 'Medium',
        action: 'Irrigate during early morning or evening',
        details: 'Avoid midday irrigation to prevent leaf burn and water loss',
        timeframe: 'Immediate'
      });
    }

    // Cold stress recommendations
    if (parseFloat(risks.coldStress.score) >= 5) {
      if (risks.coldStress.factors.frostRisk) {
        recommendations.push({
          priority: 'Urgent',
          action: 'Implement frost protection measures NOW',
          details: 'Light irrigation, smoke generation, or covering with frost cloth',
          timeframe: 'Before sunset today'
        });
      }
      recommendations.push({
        priority: 'High',
        action: 'Delay irrigation during cold periods',
        details: 'Wet soil conducts heat away from roots faster, increasing cold damage',
        timeframe: 'Immediate'
      });
    }

    // Disease recommendations
    if (parseFloat(risks.diseaseRisk.score) >= 5) {
      recommendations.push({
        priority: 'High',
        action: 'Apply preventive fungicide spray',
        details: 'High humidity and rain create ideal conditions for fungal diseases',
        timeframe: 'Within 48 hours'
      });
      recommendations.push({
        priority: 'Medium',
        action: 'Inspect crops for disease symptoms',
        details: 'Look for leaf spots, wilting, or discoloration. Early detection is critical',
        timeframe: 'Daily monitoring'
      });
    }

    // Wind damage recommendations
    if (parseFloat(risks.windDamage.score) >= 5) {
      recommendations.push({
        priority: 'High',
        action: 'Provide structural support for tall crops',
        details: 'Use stakes or trellises to prevent lodging from strong winds',
        timeframe: 'Before wind event'
      });
    }

    // Forecast-based recommendations
    if (forecastRisks.hasData && forecastRisks.upcomingRisks?.length > 0) {
      const criticalRisks = forecastRisks.upcomingRisks.filter(r => r.severity === 'Critical');
      if (criticalRisks.length > 0) {
        recommendations.push({
          priority: 'High',
          action: `Prepare for ${criticalRisks[0].type} in ${criticalRisks[0].day} day(s)`,
          details: `Take preventive measures now. ${criticalRisks[0].impact}`,
          timeframe: `Within ${criticalRisks[0].day} day(s)`
        });
      }
    }

    // General recommendation
    recommendations.push({
      priority: 'Low',
      action: 'Monitor weather and crop conditions regularly',
      details: 'Check FarmView AI app daily for updated predictions and alerts',
      timeframe: 'Ongoing'
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

module.exports = new CropDamagePrediction();
