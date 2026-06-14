/**
 * routes/teams.js
 * All routes mounted at /api/teams in app.js
 */

'use strict';

const { Router } = require('express');
const { body, query, param } = require('express-validator');

const {
  getAllTeams,
  getTeamById,
  joinTeam,
  getJoinRequests,
} = require('../controllers/teamController');

const validate = require('../middleware/validate');

const router = Router();

/* ── GET /api/teams/join-requests  (admin) ───────────────── */
router.get(
  '/join-requests',
  [
    query('teamId').optional().isString().trim(),
    query('status')
      .optional()
      .isIn(['pending', 'accepted', 'rejected'])
      .withMessage('status must be: pending, accepted, or rejected'),
  ],
  validate,
  getJoinRequests
);

/* ── GET /api/teams ──────────────────────────────────────── */
router.get(
  '/',
  [
    query('hackathonId').optional().isString().trim(),

    query('status')
      .optional()
      .isIn(['recruiting', 'full', 'completed'])
      .withMessage('status must be: recruiting, full, or completed'),

    query('experienceLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('experienceLevel must be: beginner, intermediate, or advanced'),

    query('techStack')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('techStack filter must be ≤ 200 chars'),

    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('search must be ≤ 100 chars'),

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
  getAllTeams
);

/* ── POST /api/teams/join ────────────────────────────────── */
router.post(
  '/join',
  [
    body('teamId')
      .notEmpty()
      .withMessage('teamId is required')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('teamId must be between 1 and 50 characters'),

    body('name')
      .notEmpty()
      .withMessage('name is required')
      .isString()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage('name must be between 2 and 80 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('name may only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('email must be a valid email address')
      .normalizeEmail()
      .isLength({ max: 254 })
      .withMessage('email must be ≤ 254 characters'),

    body('role')
      .notEmpty()
      .withMessage('role is required')
      .isString()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage('role must be between 2 and 80 characters'),

    body('skills')
      .optional()
      .isArray({ max: 15 })
      .withMessage('skills must be an array of up to 15 items')
      .custom((arr) => arr.every((s) => typeof s === 'string' && s.length <= 50))
      .withMessage('each skill must be a string ≤ 50 chars'),

    body('message')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('message must be ≤ 1000 characters'),
  ],
  validate,
  joinTeam
);

/* ── GET /api/teams/:id ──────────────────────────────────── */
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
  getTeamById
);

module.exports = router;
