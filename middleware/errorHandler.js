/**
 * middleware/errorHandler.js
 * Central error handler — must be registered LAST in app.js.
 * Catches all errors forwarded via next(err).
 */

'use strict';

const { NODE_ENV } = require('../config/env');

/**
 * @param {Error & { statusCode?: number; code?: string }} err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next  (required 4-arg signature)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default to 500
  const statusCode = err.statusCode || err.status || 500;
  const code       = err.code || 'INTERNAL_SERVER_ERROR';

  // Log in development / production (suppress in tests)
  if (NODE_ENV !== 'test') {
    console.error(
      `[${new Date().toISOString()}] ❌  ${req.method} ${req.originalUrl} → ${statusCode}`,
      NODE_ENV === 'development' ? err.stack : err.message
    );
  }

  // CORS-related error
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: {
        code:    'CORS_FORBIDDEN',
        message: err.message,
      },
    });
  }

  // express-validator CORS / JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code:    'INVALID_JSON',
        message: 'Request body contains invalid JSON.',
      },
    });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code:    'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the 10 KB limit.',
      },
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        statusCode < 500
          ? err.message
          : 'An unexpected error occurred. Please try again later.',
      // Only expose stack trace in development
      ...(NODE_ENV === 'development' && statusCode >= 500
        ? { stack: err.stack }
        : {}),
    },
  });
};

module.exports = errorHandler;
