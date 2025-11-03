import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GeoAI Service - Crop Intelligence API
 */
class GeoAIService {
  /**
   * Comprehensive crop analysis
   */
  async analyzeCrop(propertyId, options = {}) {
    try {
      const response = await api.post('/geoai/analyze-crop', {
        propertyId,
        includeImage: true,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Identify crop type from satellite imagery
   */
  async identifyCrop(propertyId, seasonData) {
    try {
      const response = await api.post('/geoai/identify-crop', {
        propertyId,
        seasonData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get crop recommendation for next season
   */
  async recommendNextCrop(propertyId, currentCrop, options = {}) {
    try {
      const response = await api.post('/geoai/recommend-crop', {
        propertyId,
        currentCrop,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Detect crop health issues
   */
  async detectIssues(propertyId, cropType, cropStage, weatherData = {}) {
    try {
      const response = await api.post('/geoai/detect-issues', {
        propertyId,
        cropType,
        cropStage,
        weatherData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Predict crop yield
   */
  async predictYield(propertyId, cropType, cropStage, options = {}) {
    try {
      const response = await api.post('/geoai/predict-yield', {
        propertyId,
        cropType,
        cropStage,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get practical farming advice
   */
  async getFarmingAdvice(cropType, issues, season, location, farmerExperience = 'intermediate') {
    try {
      const response = await api.post('/geoai/farming-advice', {
        cropType,
        issues,
        season,
        location,
        farmerExperience
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get NDVI statistics for a property
   */
  async getNDVIStats(propertyId) {
    try {
      const response = await api.get(`/satellite/ndvi-stats/${propertyId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data.message || error.response.data.error || 'API Error',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'Unknown error occurred',
        status: -1
      };
    }
  }

  /**
   * Get current season
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'Kharif (Monsoon Season)';
    if (month >= 11 || month <= 2) return 'Rabi (Winter Season)';
    return 'Zaid (Summer Season)';
  }
}

export default new GeoAIService();
