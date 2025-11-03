const axios = require('axios');
const sharp = require('sharp');
const { createCanvas } = require('canvas');

class SentinelHubService {
  constructor() {
    this.clientId = process.env.SENTINEL_CLIENT_ID;
    this.clientSecret = process.env.SENTINEL_CLIENT_SECRET;
    this.apiUrl = process.env.SENTINEL_API_URL || 'https://services.sentinel-hub.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token from Sentinel Hub
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/oauth/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token typically expires in 3600 seconds, refresh 5 minutes before
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      console.log('✅ Sentinel Hub access token obtained');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Failed to get Sentinel Hub token:', error.message);
      throw error;
    }
  }

  /**
   * Get satellite imagery for a property boundary
   * @param {Object} params - Image parameters
   * @returns {Promise<Object>} - Image data
   */
  async getSatelliteImage({
    bbox, // [minLon, minLat, maxLon, maxLat]
    fromDate,
    toDate,
    width = 512,
    height = 512,
    cloudCoverage = 30,
    format = 'image/jpeg'
  }) {
    try {
      const token = await this.getAccessToken();

      // Process API request for true color RGB image
      const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02"],
    output: { 
      bands: 3,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  // Increased brightness multiplier for better visibility
  return [3.5 * sample.B04, 3.5 * sample.B03, 3.5 * sample.B02];
}
`;

      const response = await axios.post(
        `${this.apiUrl}/api/v1/process`,
        {
          input: {
            bounds: {
              bbox: bbox,
              properties: {
                crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
              }
            },
            data: [{
              type: 'S2L2A',
              dataFilter: {
                timeRange: {
                  from: fromDate,
                  to: toDate
                },
                maxCloudCoverage: cloudCoverage
              }
            }]
          },
          output: {
            width: width,
            height: height,
            responses: [{
              format: {
                type: format
              }
            }]
          },
          evalscript: evalscript
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        image: Buffer.from(response.data).toString('base64'),
        format: format,
        width: width,
        height: height
      };

    } catch (error) {
      console.error('❌ Sentinel Hub API error:', error.message);
      if (error.response && error.response.data) {
        try {
          const errorData = Buffer.from(error.response.data).toString('utf8');
          console.error('Sentinel Hub Error Details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
      throw error;
    }
  }

  /**
   * Get NDVI (Normalized Difference Vegetation Index) for crop health
   */
  async getNDVI({
    bbox,
    fromDate,
    toDate,
    width = 512,
    height = 512
  }) {
    try {
      const token = await this.getAccessToken();

      // NDVI calculation with color mapping for visualization
      const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B08", "B04"],
    output: { 
      bands: 3,
      sampleType: "UINT8"
    }
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  
  // Color mapping: NDVI to RGB
  // Dark green (healthy): NDVI > 0.6
  if (ndvi > 0.6) return [0, 100, 0];
  // Light green (moderate): NDVI 0.3 to 0.6
  else if (ndvi > 0.3) return [144, 238, 144];
  // Yellow/Orange (sparse): NDVI 0.1 to 0.3
  else if (ndvi > 0.1) return [255, 255, 0];
  // Red (damaged/bare): NDVI < 0.1
  else return [255, 0, 0];
}
`;

      const response = await axios.post(
        `${this.apiUrl}/api/v1/process`,
        {
          input: {
            bounds: {
              bbox: bbox,
              properties: {
                crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
              }
            },
            data: [{
              type: 'S2L2A',
              dataFilter: {
                timeRange: {
                  from: fromDate,
                  to: toDate
                }
              }
            }]
          },
          output: {
            width: width,
            height: height,
            responses: [{
              format: {
                type: 'image/png'  // Request PNG instead of TIFF
              }
            }]
          },
          evalscript: evalscript
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          responseType: 'arraybuffer'
        }
      );

      // Generate colored heatmap from PNG data (grayscale NDVI)
      const pngBuffer = Buffer.from(response.data);
      const heatmapPng = await this.generateNDVIHeatmap(pngBuffer, width, height);

      return {
        success: true,
        ndviData: heatmapPng.toString('base64'),
        format: 'image/png',
        width: width,
        height: height
      };

    } catch (error) {
      console.error('❌ NDVI calculation error:', error.message);
      if (error.response && error.response.data) {
        try {
          const errorData = Buffer.from(error.response.data).toString('utf8');
          console.error('Sentinel Hub Error Details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
      throw error;
    }
  }

  /**
   * Convert NDVI PNG data to colored heatmap PNG
   */
  async generateNDVIHeatmap(pngBuffer, width, height) {
    try {
      console.log('🎨 Generating NDVI heatmap...');
      console.log(`Input PNG size: ${pngBuffer.length} bytes`);
      
      // Decode the PNG to get pixel data
      const { data: rawData, info } = await sharp(pngBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      console.log(`Decompressed data: ${rawData.length} bytes, channels: ${info.channels}, width: ${info.width}, height: ${info.height}`);

      // Create canvas for heatmap
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(width, height);

      let validPixels = 0;
      let minNDVI = 1;
      let maxNDVI = -1;
      
      // Process each pixel
      for (let i = 0; i < width * height; i++) {
        const byteOffset = i * info.channels;
        
        // Read the byte value and normalize to NDVI range
        // Sentinel Hub scales float32 NDVI (-1 to 1) to uint8 (0 to 255) in PNG
        const byteValue = rawData[byteOffset];
        const ndvi = (byteValue / 127.5) - 1;  // Scale 0-255 to -1 to 1
        
        // Track statistics
        if (!isNaN(ndvi)) {
          validPixels++;
          minNDVI = Math.min(minNDVI, ndvi);
          maxNDVI = Math.max(maxNDVI, ndvi);
        }

        // Apply color mapping based on NDVI value
        const pixelIndex = i * 4;
        
        if (isNaN(ndvi)) {
          // Invalid NDVI - make it gray
          imageData.data[pixelIndex] = 128;
          imageData.data[pixelIndex + 1] = 128;
          imageData.data[pixelIndex + 2] = 128;
          imageData.data[pixelIndex + 3] = 255;
        } else if (ndvi > 0.6) {
          // Healthy vegetation - Dark Green
          imageData.data[pixelIndex] = 0;
          imageData.data[pixelIndex + 1] = 100;
          imageData.data[pixelIndex + 2] = 0;
          imageData.data[pixelIndex + 3] = 255;
        } else if (ndvi > 0.3) {
          // Moderate vegetation - Light Green
          imageData.data[pixelIndex] = 144;
          imageData.data[pixelIndex + 1] = 238;
          imageData.data[pixelIndex + 2] = 144;
          imageData.data[pixelIndex + 3] = 255;
        } else if (ndvi > 0.1) {
          // Sparse vegetation - Yellow/Orange
          imageData.data[pixelIndex] = 255;
          imageData.data[pixelIndex + 1] = 165;
          imageData.data[pixelIndex + 2] = 0;
          imageData.data[pixelIndex + 3] = 255;
        } else if (ndvi > 0) {
          // Very sparse - Orange/Red
          imageData.data[pixelIndex] = 255;
          imageData.data[pixelIndex + 1] = 69;
          imageData.data[pixelIndex + 2] = 0;
          imageData.data[pixelIndex + 3] = 255;
        } else if (ndvi > -0.2) {
          // Bare soil - Brown
          imageData.data[pixelIndex] = 139;
          imageData.data[pixelIndex + 1] = 69;
          imageData.data[pixelIndex + 2] = 19;
          imageData.data[pixelIndex + 3] = 255;
        } else {
          // Water/clouds - Blue
          imageData.data[pixelIndex] = 0;
          imageData.data[pixelIndex + 1] = 0;
          imageData.data[pixelIndex + 2] = 139;
          imageData.data[pixelIndex + 3] = 255;
        }
      }

      console.log(`📊 NDVI Stats: Valid pixels: ${validPixels}/${width*height}, Range: ${minNDVI.toFixed(3)} to ${maxNDVI.toFixed(3)}`);

      // Put the colored image data on canvas
      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to PNG buffer
      const coloredPngBuffer = canvas.toBuffer('image/png');
      
      console.log('✅ Heatmap generated successfully');
      return coloredPngBuffer;

    } catch (error) {
      console.error('❌ Heatmap generation error:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Calculate property bounding box from GeoJSON coordinates
   */
  calculateBoundingBox(coordinates) {
    // coordinates is array of [longitude, latitude] pairs
    const lons = coordinates[0].map(coord => coord[0]);
    const lats = coordinates[0].map(coord => coord[1]);

    return [
      Math.min(...lons), // minLon
      Math.min(...lats), // minLat
      Math.max(...lons), // maxLon
      Math.max(...lats)  // maxLat
    ];
  }
}

module.exports = new SentinelHubService();
