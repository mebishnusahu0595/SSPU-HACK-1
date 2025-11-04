const axios = require('axios');

// reCAPTCHA v2 secret key
const RECAPTCHA_SECRET_KEY = '6LfILQEsAAAAAFe6k6h8k83S0QENYt1d5lBG1ilI';

/**
 * Middleware to verify Google reCAPTCHA v2 token
 */
const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    // Check if token is provided
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
    }

    // Verify token with Google
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(verificationURL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }
    });

    const { success, score, challenge_ts, hostname } = response.data;

    // Check if verification was successful
    if (!success) {
      console.log('❌ reCAPTCHA verification failed:', response.data);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Log successful verification
    console.log('✅ reCAPTCHA verified successfully:', {
      hostname,
      timestamp: challenge_ts,
      score
    });

    // Attach verification data to request for logging
    req.recaptchaVerified = true;
    req.recaptchaData = {
      timestamp: challenge_ts,
      hostname,
      score
    };

    next();
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify reCAPTCHA. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { verifyRecaptcha };
