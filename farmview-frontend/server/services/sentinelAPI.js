const axios = require('axios');
const sharp = require('sharp');
const { createCanvas } = require('canvas');

class SentinelHubAPI {
  constructor() {
    this.clientId = process.env.SENTINEL_CLIENT_ID;
    this.clientSecret = process.env.SENTINEL_CLIENT_SECRET;
    this.baseUrl = process.env.SENTINEL_API_URL || 'https://services.sentinel-hub.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token from Sentinel Hub
   */
  async getAccessToken() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, refresh 5 minutes early
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      
      console.log('✅ Sentinel Hub access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Sentinel Hub token:', error.response?.data || error.message);
      throw new Error('Sentinel Hub authentication failed');
    }
  }

  /**
   * Fetch satellite image for a bounding box
   * @param {Object} bbox - Bounding box { minLat, minLng, maxLat, maxLng }
   * @param {String} date - ISO date string (e.g., '2025-10-26')
   * @param {Number} width - Image width in pixels
   * @param {Number} height - Image height in pixels
   */
  async fetchSatelliteImage(bbox, date, width = 512, height = 512) {
    const token = await this.getAccessToken();

    // Evalscript to fetch NIR (B08) and RED (B04) bands
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: [{
            bands: ["B04", "B08"],
            units: "DN"
          }],
          output: {
            bands: 2,
            sampleType: "FLOAT32"
          }
        };
      }

      function evaluatePixel(sample) {
        return [sample.B04 / 10000, sample.B08 / 10000];
      }
    `;

    const requestBody = {
      input: {
        bounds: {
          bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
          properties: {
            crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
          }
        },
        data: [
          {
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`
              },
              maxCloudCoverage: 30
            }
          }
        ]
      },
      output: {
        width: width,
        height: height,
        responses: [
          {
            identifier: 'default',
            format: {
              type: 'image/tiff'
            }
          }
        ]
      },
      evalscript: evalscript
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/process`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/tiff'
          },
          responseType: 'arraybuffer',
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('✅ Satellite image fetched successfully');
      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch satellite image:', error.response?.status, error.message);
      throw new Error('Failed to fetch satellite imagery');
    }
  }

  /**
   * Calculate NDVI from RED and NIR bands
   * @param {Buffer} imageBuffer - TIFF image buffer with 2 bands (RED, NIR)
   */
  async calculateNDVI(imageBuffer) {
    try {
      // Load image with sharp
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      const width = info.width;
      const height = info.height;
      const channels = info.channels;

      // NDVI calculation
      const ndviData = new Float32Array(width * height);
      
      for (let i = 0; i < width * height; i++) {
        const pixelOffset = i * channels;
        const red = data[pixelOffset];
        const nir = data[pixelOffset + 1];

        // NDVI = (NIR - RED) / (NIR + RED)
        const denominator = nir + red;
        if (denominator === 0) {
          ndviData[i] = 0;
        } else {
          ndviData[i] = (nir - red) / denominator;
        }
      }

      console.log('✅ NDVI calculated successfully');
      return {
        ndviData,
        width,
        height,
        stats: this.calculateNDVIStats(ndviData)
      };
    } catch (error) {
      console.error('❌ NDVI calculation failed:', error.message);
      throw new Error('NDVI calculation failed');
    }
  }

  /**
   * Calculate statistics from NDVI data
   */
  calculateNDVIStats(ndviData) {
    let sum = 0;
    let min = 1;
    let max = -1;
    let healthyPixels = 0;
    let moderatePixels = 0;
    let stressedPixels = 0;
    let damagedPixels = 0;

    for (let i = 0; i < ndviData.length; i++) {
      const ndvi = ndviData[i];
      sum += ndvi;
      min = Math.min(min, ndvi);
      max = Math.max(max, ndvi);

      // Categorize pixels
      if (ndvi >= 0.6) healthyPixels++;
      else if (ndvi >= 0.3) moderatePixels++;
      else if (ndvi >= 0.1) stressedPixels++;
      else damagedPixels++;
    }

    const totalPixels = ndviData.length;
    const mean = sum / totalPixels;

    return {
      mean: parseFloat(mean.toFixed(3)),
      min: parseFloat(min.toFixed(3)),
      max: parseFloat(max.toFixed(3)),
      healthyPercent: parseFloat(((healthyPixels / totalPixels) * 100).toFixed(2)),
      moderatePercent: parseFloat(((moderatePixels / totalPixels) * 100).toFixed(2)),
      stressedPercent: parseFloat(((stressedPixels / totalPixels) * 100).toFixed(2)),
      damagedPercent: parseFloat(((damagedPixels / totalPixels) * 100).toFixed(2))
    };
  }

  /**
   * Generate NDVI heatmap image
   */
  async generateNDVIHeatmap(ndviData, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < ndviData.length; i++) {
      const ndvi = ndviData[i];
      const pixelIndex = i * 4;

      // Color mapping based on NDVI value
      let r, g, b;
      if (ndvi >= 0.6) {
        // Healthy: Dark green
        r = 0; g = 128; b = 0;
      } else if (ndvi >= 0.3) {
        // Moderate: Light green to yellow
        r = Math.floor(255 * (0.6 - ndvi) / 0.3);
        g = 255;
        b = 0;
      } else if (ndvi >= 0.1) {
        // Stressed: Yellow to orange
        r = 255;
        g = Math.floor(255 * (ndvi - 0.1) / 0.2);
        b = 0;
      } else {
        // Damaged: Red
        r = 255; g = 0; b = 0;
      }

      imageData.data[pixelIndex] = r;
      imageData.data[pixelIndex + 1] = g;
      imageData.data[pixelIndex + 2] = b;
      imageData.data[pixelIndex + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toBuffer('image/png');
  }

  /**
   * Compare two NDVI datasets and calculate damage
   */
  compareNDVI(baselineNDVI, currentNDVI) {
    if (baselineNDVI.length !== currentNDVI.length) {
      throw new Error('NDVI datasets must have same dimensions');
    }

    let totalChange = 0;
    let significantDamagePixels = 0; // Drop > 0.2
    let severeDamagePixels = 0;      // Drop > 0.4

    for (let i = 0; i < baselineNDVI.length; i++) {
      const change = currentNDVI[i] - baselineNDVI[i];
      totalChange += change;

      if (change < -0.2) significantDamagePixels++;
      if (change < -0.4) severeDamagePixels++;
    }

    const totalPixels = baselineNDVI.length;
    const meanChange = totalChange / totalPixels;
    const damagePercent = (significantDamagePixels / totalPixels) * 100;
    const severeDamagePercent = (severeDamagePixels / totalPixels) * 100;

    return {
      meanChange: parseFloat(meanChange.toFixed(3)),
      damagePercent: parseFloat(damagePercent.toFixed(2)),
      severeDamagePercent: parseFloat(severeDamagePercent.toFixed(2)),
      riskScore: this.calculateRiskScore(damagePercent)
    };
  }

  /**
   * Calculate risk score (0-10) based on damage percentage
   */
  calculateRiskScore(damagePercent) {
    if (damagePercent >= 80) return 10;
    if (damagePercent >= 60) return 8;
    if (damagePercent >= 40) return 6;
    if (damagePercent >= 20) return 4;
    if (damagePercent >= 10) return 2;
    return 1;
  }

  /**
   * Get bounding box from GeoJSON coordinates
   */
  getBoundingBox(coordinates) {
    // coordinates is array of [lng, lat] pairs
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);

    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    };
  }
}

module.exports = new SentinelHubAPI();
