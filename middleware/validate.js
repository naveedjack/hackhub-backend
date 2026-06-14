/**
 * middleware/validate.js
 * Reads express-validator results and returns structured 400 errors.
 * Used after every validator chain in route files.
 */

'use strict';

const { validationResult } = require('express-validator');

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Shape each error to { field, message }
    const formatted = errors.array().map((err) => ({
      field:   err.path || err.param || 'unknown',
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: 'One or more fields failed validation.',
        details: formatted,
      },
    });
  }

  next();
};

module.exports = validate;
