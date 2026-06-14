/**
 * routes/contact.js
 * All routes mounted at /api/contact in app.js
 */

'use strict';

const { Router } = require('express');
const { body, query } = require('express-validator');

const {
  submitContact,
  getMessages,
  VALID_SUBJECTS,
} = require('../controllers/contactController');

const validate = require('../middleware/validate');

const router = Router();

/* ── POST /api/contact ───────────────────────────────────── */
router.post(
  '/',
  [
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

    body('subject')
      .notEmpty()
      .withMessage('subject is required')
      .isIn(VALID_SUBJECTS)
      .withMessage(`subject must be one of: ${VALID_SUBJECTS.join(', ')}`),

    body('message')
      .notEmpty()
      .withMessage('message is required')
      .isString()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('message must be between 10 and 2000 characters'),
  ],
  validate,
  submitContact
);

/* ── GET /api/contact/messages  (admin — Phase 4: JWT) ───── */
router.get(
  '/messages',
  [
    query('status')
      .optional()
      .isIn(['unread', 'read', 'replied'])
      .withMessage('status must be: unread, read, or replied'),
  ],
  validate,
  getMessages
);

module.exports = router;
