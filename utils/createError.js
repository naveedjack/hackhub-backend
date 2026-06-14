/**
 * utils/createError.js
 * Factory for consistent HTTP errors forwarded via next(err).
 */

'use strict';

/**
 * Creates a standardised Error with statusCode and optional code.
 *
 * @param {number} statusCode  - HTTP status code (e.g. 404, 400, 409)
 * @param {string} message     - Human-readable error message
 * @param {string} [code]      - Machine-readable error code (optional)
 * @returns {Error & { statusCode: number; code: string }}
 */
const createError = (statusCode, message, code) => {
  const err        = new Error(message);
  err.statusCode   = statusCode;
  err.code         = code || httpCodeToString(statusCode);
  return err;
};

const httpCodeToString = (code) => {
  const map = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return map[code] || 'ERROR';
};

module.exports = { createError };
