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
  // Natural color with moderate brightness enhancement
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
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

      // Enhanced NDVI calculation with land classification
      const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: { 
      bands: 3,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  // Get band values (already normalized 0-1)
  let red = sample.B04;
  let nir = sample.B08;
  
  // Avoid division by zero
  let denom = nir + red;
  if (denom === 0) {
    return [0, 0, 0]; // Black for no data
  }
  
  // Calculate NDVI: (NIR - RED) / (NIR + RED)
  let ndvi = (nir - red) / denom;
  
  // Enhanced color mapping
  let r, g, b;
  
  if (ndvi < 0) {
    // Water or shadows - Blue
    r = 0.1; 
    g = 0.3; 
    b = 0.8;
  } else if (ndvi < 0.2) {
    // Bare soil, desert - BROWN
    let t = ndvi / 0.2;
    r = 0.6 + (0.2 * t);
    g = 0.4 + (0.1 * t);
    b = 0.2;
  } else if (ndvi < 0.4) {
    // Sparse vegetation - YELLOW to LIGHT GREEN
    let t = (ndvi - 0.2) / 0.2;
    r = 0.8 - (0.4 * t);
    g = 0.7 + (0.2 * t);
    b = 0.2 - (0.1 * t);
  } else if (ndvi < 0.6) {
    // Moderate vegetation - GREEN
    let t = (ndvi - 0.4) / 0.2;
    r = 0.4 - (0.4 * t);
    g = 0.9;
    b = 0.1 + (0.1 * t);
  } else if (ndvi < 0.8) {
    // Healthy vegetation - BRIGHT GREEN
    r = 0;
    g = 0.9 + (0.1 * ((ndvi - 0.6) / 0.2));
    b = 0.2 - (0.2 * ((ndvi - 0.6) / 0.2));
  } else {
    // Very dense vegetation - DARK GREEN
    r = 0;
    g = 0.5 + (0.3 * (1 - ndvi));
    b = 0;
  }
  
  return [r, g, b];
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
   * Calculate NDVI statistics (numerical values, not visualization)
   * Returns actual NDVI values for analysis
   */
  async calculateNDVI({
    bbox,
    fromDate,
    toDate,
    cloudCoverage = 30
  }) {
    try {
      const token = await this.getAccessToken();

      console.log('📊 Calculating NDVI statistics...');

      // Request raw NDVI values as float32 in TIFF format
      const evalscript = `
//VERSION=3
function setup() {
  return {
    input: ["B08", "B04", "SCL"],
    output: { 
      bands: 1,
      sampleType: "FLOAT32"
    }
  };
}

function evaluatePixel(sample) {
  // SCL (Scene Classification) layer to filter clouds/water
  // 3 = cloud shadow, 8 = cloud medium probability, 9 = cloud high probability
  // 6 = water, 11 = snow/ice
  if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 6 || sample.SCL === 11) {
    return [NaN]; // Mark as invalid
  }
  
  // Calculate NDVI: (NIR - Red) / (NIR + Red)
  let nir = sample.B08;
  let red = sample.B04;
  
  if (nir + red === 0) {
    return [0];
  }
  
  let ndvi = (nir - red) / (nir + red);
  return [ndvi];
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
            width: 512,
            height: 512,
            responses: [{
              format: {
                type: 'image/tiff'
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
          responseType: 'arraybuffer',
          timeout: 60000
        }
      );

      // Parse TIFF to extract NDVI values
      const tiffBuffer = Buffer.from(response.data);
      const imageBuffer = await sharp(tiffBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data: rawData, info } = imageBuffer;

      // Calculate statistics from raw NDVI values
      const ndviValues = [];
      let sum = 0;
      let validPixels = 0;
      let healthyPixels = 0;  // NDVI > 0.6
      let moderatePixels = 0; // NDVI 0.3-0.6
      let stressedPixels = 0; // NDVI 0-0.3
      let barePixels = 0;     // NDVI < 0

      // Read float32 values
      for (let i = 0; i < info.width * info.height; i++) {
        const offset = i * 4; // 4 bytes per float32
        const ndvi = rawData.readFloatLE(offset);
        
        // Skip invalid values (NaN, infinity, out of range)
        if (isNaN(ndvi) || !isFinite(ndvi) || ndvi < -1 || ndvi > 1) {
          continue;
        }

        ndviValues.push(ndvi);
        sum += ndvi;
        validPixels++;

        // Categorize pixels
        if (ndvi > 0.6) healthyPixels++;
        else if (ndvi > 0.3) moderatePixels++;
        else if (ndvi >= 0) stressedPixels++;
        else barePixels++;
      }

      if (validPixels === 0) {
        throw new Error('No valid NDVI data (possibly too cloudy or no satellite data available)');
      }

      const mean = sum / validPixels;
      
      // Calculate standard deviation
      const variance = ndviValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validPixels;
      const stdDev = Math.sqrt(variance);

      // Sort for percentiles
      ndviValues.sort((a, b) => a - b);
      const min = ndviValues[0];
      const max = ndviValues[validPixels - 1];
      const median = ndviValues[Math.floor(validPixels / 2)];

      const totalPixels = info.width * info.height;
      const healthyPercentage = (healthyPixels / validPixels) * 100;
      const moderatePercentage = (moderatePixels / validPixels) * 100;
      const stressedPercentage = (stressedPixels / validPixels) * 100;
      const barePercentage = (barePixels / validPixels) * 100;

      console.log('✅ NDVI Statistics calculated');
      console.log(`   Mean: ${mean.toFixed(3)}, Range: [${min.toFixed(3)}, ${max.toFixed(3)}]`);
      console.log(`   Healthy: ${healthyPercentage.toFixed(1)}%, Stressed: ${stressedPercentage.toFixed(1)}%`);

      return {
        mean: parseFloat(mean.toFixed(3)),
        median: parseFloat(median.toFixed(3)),
        min: parseFloat(min.toFixed(3)),
        max: parseFloat(max.toFixed(3)),
        stdDev: parseFloat(stdDev.toFixed(3)),
        validPixels,
        totalPixels,
        healthyPixels,
        moderatePixels,
        stressedPixels,
        barePixels,
        healthyPercentage: parseFloat(healthyPercentage.toFixed(2)),
        moderatePercentage: parseFloat(moderatePercentage.toFixed(2)),
        stressedPercentage: parseFloat(stressedPercentage.toFixed(2)),
        barePercentage: parseFloat(barePercentage.toFixed(2)),
        lowNDVIPercentage: parseFloat((stressedPercentage + barePercentage).toFixed(2)),
        interpretation: this.interpretNDVI(mean, healthyPercentage, stressedPercentage)
      };

    } catch (error) {
      console.error('❌ NDVI calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Interpret NDVI values into human-readable health status
   */
  interpretNDVI(mean, healthyPercentage, stressedPercentage) {
    let status = '';
    let recommendation = '';

    if (mean > 0.6 && healthyPercentage > 70) {
      status = 'Excellent';
      recommendation = 'Crop is very healthy. Maintain current practices.';
    } else if (mean > 0.5 && healthyPercentage > 50) {
      status = 'Good';
      recommendation = 'Crop is healthy. Monitor for any changes.';
    } else if (mean > 0.3 && stressedPercentage < 50) {
      status = 'Fair';
      recommendation = 'Crop health is moderate. Consider checking irrigation and fertilization.';
    } else if (mean > 0.2) {
      status = 'Poor';
      recommendation = 'Crop is stressed. Immediate attention needed. Check for pests, water stress, or nutrient deficiency.';
    } else {
      status = 'Critical';
      recommendation = 'Severe crop stress detected. Urgent intervention required.';
    }

    return {
      status,
      recommendation,
      details: {
        'NDVI > 0.6': 'Dense, healthy vegetation (healthy crops)',
        'NDVI 0.3-0.6': 'Moderate vegetation (growing crops, grassland)',
        'NDVI 0-0.3': 'Sparse vegetation (stressed crops, bare soil with some plants)',
        'NDVI < 0': 'Non-vegetated (water, bare soil, sand, urban areas)'
      }
    };
  }

  /**
   * Get satellite imagery with properly processed buffer
   */
  async getSatelliteImage({
    bbox,
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
    input: ["B04", "B03", "B02", "SCL"],
    output: { 
      bands: 3,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  // Filter clouds using Scene Classification Layer
  if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9) {
    return [0.5, 0.5, 0.5]; // Gray for clouds
  }
  
  // True color with brightness adjustment
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
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
          responseType: 'arraybuffer',
          timeout: 60000
        }
      );

      const imageBuffer = Buffer.from(response.data);

      return {
        success: true,
        image: imageBuffer.toString('base64'),
        imageBuffer: imageBuffer, // For GeoAI processing
        format: format,
        width: width,
        height: height
      };

    } catch (error) {
      console.error('❌ Sentinel Hub API error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate property bounding box from GeoJSON coordinates with buffer
   */
  calculateBoundingBox(coordinates, bufferPercent = 80) {
    // coordinates is array of [longitude, latitude] pairs
    const lons = coordinates[0].map(coord => coord[0]);
    const lats = coordinates[0].map(coord => coord[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Add buffer to zoom out (80% by default for maximum context and visibility)
    const lonBuffer = (maxLon - minLon) * (bufferPercent / 100);
    const latBuffer = (maxLat - minLat) * (bufferPercent / 100);

    return [
      minLon - lonBuffer, // minLon
      minLat - latBuffer, // minLat
      maxLon + lonBuffer, // maxLon
      maxLat + latBuffer  // maxLat
    ];
  }
}

module.exports = new SentinelHubService();
