const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/weather/current
// @desc    Get current weather for location
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const weatherData = {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          latitude: data.coord.lat,
          longitude: data.coord.lon
        }
      },
      current: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        clouds: data.clouds.all,
        visibility: data.visibility,
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        }
      },
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timestamp: new Date(data.dt * 1000)
    };

    res.status(200).json({
      success: true,
      data: weatherData
    });

  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get 5-day weather forecast
// @access  Private
router.get('/forecast', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const forecastData = {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          latitude: data.city.coord.lat,
          longitude: data.city.coord.lon
        }
      },
      forecast: data.list.map(item => ({
        datetime: new Date(item.dt * 1000),
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        clouds: item.clouds.all,
        rain: item.rain?.['3h'] || 0,
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        }
      }))
    };

    res.status(200).json({
      success: true,
      data: forecastData
    });

  } catch (error) {
    console.error('Weather Forecast Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
      error: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/weather/alerts
// @desc    Get weather alerts for location
// @access  Private
router.get('/alerts', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const alerts = data.alerts || [];

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts.map(alert => ({
        sender: alert.sender_name,
        event: alert.event,
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000),
        description: alert.description,
        tags: alert.tags
      }))
    });

  } catch (error) {
    // If no alerts endpoint available, return empty array
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No weather alerts available for this location'
    });
  }
});

module.exports = router;
