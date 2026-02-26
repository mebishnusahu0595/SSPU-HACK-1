const axios = require('axios');

// reCAPTCHA v2 secret key
const RECAPTCHA_SECRET_KEY = '6LfILQEsAAAAAFe6k6h8k83S0QENYt1d5lBG1ilI';

/**
 * Middleware to verify Google reCAPTCHA v2 token
 */
const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA token is required'
    });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (response.data.success) {
      req.recaptchaVerified = true;
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid reCAPTCHA token'
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify reCAPTCHA'
    });
  }
};

module.exports = { verifyRecaptcha };
