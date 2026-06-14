/**
 * utils/response.js
 * Standardised response helpers — optional convenience wrappers.
 * Controllers can use these instead of calling res.status().json() directly.
 */

'use strict';

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = {} } = {}) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (Object.keys(meta).length) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 */
const sendError = (res, { statusCode = 500, code = 'ERROR', message = 'An error occurred', details = null } = {}) => {
  const payload = {
    success: false,
    error: { code, message },
  };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
