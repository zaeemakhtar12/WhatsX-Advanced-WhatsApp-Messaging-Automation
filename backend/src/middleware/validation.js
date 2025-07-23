// middleware/validation.js
const ResponseHandler = require('../utils/responseHandler');

class ValidationMiddleware {
  // Validate user registration data
  static validateRegistration(req, res, next) {
    const { username, email, password, role } = req.body;
    const errors = [];

    if (!username || username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!email || !ValidationMiddleware.isValidEmail(email)) {
      errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (role && !['user', 'admin'].includes(role)) {
      errors.push('Role must be either "user" or "admin"');
    }

    if (errors.length > 0) {
      return ResponseHandler.validationError(res, errors);
    }

    next();
  }

  // Validate login data
  static validateLogin(req, res, next) {
    const { email, password, role } = req.body;
    const errors = [];

    if (!email || !ValidationMiddleware.isValidEmail(email)) {
      errors.push('Valid email is required');
    }

    if (!password) {
      errors.push('Password is required');
    }

    if (!role || !['user', 'admin'].includes(role)) {
      errors.push('Valid role is required');
    }

    if (errors.length > 0) {
      return ResponseHandler.validationError(res, errors);
    }

    next();
  }

  // Validate message data
  static validateMessage(req, res, next) {
    const { recipient, message } = req.body;
    const errors = [];

    if (!recipient) {
      errors.push('Recipient is required');
    }

    if (!message || message.trim().length === 0) {
      errors.push('Message content is required');
    }

    if (errors.length > 0) {
      return ResponseHandler.validationError(res, errors);
    }

    next();
  }

  // Validate phone number
  static validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize input
  static sanitizeInput(req, res, next) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
    next();
  }
}

module.exports = ValidationMiddleware; 