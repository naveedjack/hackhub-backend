/**
 * middleware/notFound.js
 * Catches any request that didn't match a defined route.
 */

'use strict';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      hint:    'Visit GET /api for a list of available endpoints.',
    },
  });
};

module.exports = notFound;
