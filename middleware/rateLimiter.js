/**
 * middleware/rateLimiter.js
 * Protects the API from brute-force and abuse.
 * Uses express-rate-limit (in-memory window, no Redis needed yet).
 *
 * Phase 6: Replace store with RedisStore for multi-instance support.
 */

'use strict';

const rateLimit = require('express-rate-limit');
const { NODE_ENV } = require('../config/env');

const rateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // 15-minute window
  max:              NODE_ENV === 'test' ? 10_000 : 100,  // relax in tests
  standardHeaders:  true,   // Return RateLimit-* headers
  legacyHeaders:    false,  // Disable X-RateLimit-* headers

  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait 15 minutes before trying again.',
    },
  },

  // Skip rate limiting for health check
  skip: (req) => req.path === '/health',
});

module.exports = rateLimiter;
