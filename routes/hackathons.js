/**
 * routes/hackathons.js
 * All routes are mounted at /api/hackathons in app.js
 */

'use strict';

const { Router } = require('express');
const { query, param } = require('express-validator');

const {
  getAllHackathons,
  getHackathonById,
  getCategories,
  getStats,
} = require('../controllers/hackathonController');

const validate = require('../middleware/validate');

const router = Router();

/* ── GET /api/hackathons/stats ───────────────────────────── */
router.get('/stats', getStats);

/* ── GET /api/hackathons/categories ─────────────────────── */
router.get('/categories', getCategories);

/* ── GET /api/hackathons ─────────────────────────────────── */
router.get(
  '/',
  [
    query('category')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('category must be a string ≤ 50 chars'),

    query('status')
      .optional()
      .isIn(['live', 'upcoming', 'completed'])
      .withMessage('status must be: live, upcoming, or completed'),

    query('mode')
      .optional()
      .isIn(['online', 'in-person', 'hybrid'])
      .withMessage('mode must be: online, in-person, or hybrid'),

    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('search query must be ≤ 100 chars'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('limit must be between 1 and 50'),
  ],
  validate,
  getAllHackathons
);

/* ── GET /api/hackathons/:id ─────────────────────────────── */
router.get(
  '/:id',
  [
    param('id')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('id must be a non-empty string'),
  ],
  validate,
  getHackathonById
);

module.exports = router;
