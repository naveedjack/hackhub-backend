/**
 * controllers/contactController.js
 * Handles contact form submissions.
 * Phase 5: wire up nodemailer to send email notifications.
 */

'use strict';

const { v4: uuidv4 }    = require('uuid');
const contactMessages   = require('../data/contactMessages');
const { createError }   = require('../utils/createError');

const VALID_SUBJECTS = [
  'general',
  'hackathon',
  'sponsor',
  'bug',
  'feedback',
];

/* ──────────────────────────────────────────────────────────
   POST /api/contact
   Body: { name, email, subject, message }
   ────────────────────────────────────────────────────────── */
const submitContact = (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // ── Subject whitelist ────────────────────────────────────
    if (!VALID_SUBJECTS.includes(subject)) {
      return next(
        createError(
          400,
          `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}.`
        )
      );
    }

    // ── Rate-limit by email (max 3 messages per email) ───────
    const existingCount = contactMessages.filter(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    ).length;

    if (existingCount >= 3) {
      return next(
        createError(
          429,
          'You have submitted too many messages. Please email us directly at hello@hackhub.dev.'
        )
      );
    }

    // ── Persist message ──────────────────────────────────────
    const newMessage = {
      id:        uuidv4(),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      subject:   subject.trim(),
      message:   message.trim(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      status:    'unread',
      createdAt: new Date().toISOString(),
    };

    contactMessages.push(newMessage);

    /*
     * ── Phase 5 Email Notification (stub) ────────────────────
     * Uncomment and configure when SMTP is ready:
     *
     * await sendEmail({
     *   to:      'admin@hackhub.dev',
     *   subject: `[HackHub Contact] ${subject} — ${name}`,
     *   html:    emailTemplate(newMessage),
     * });
     */

    res.status(201).json({
      success: true,
      message:
        "Thanks for reaching out! We'll get back to you within 24 hours.",
      data: {
        referenceId: newMessage.id,
        submittedAt: newMessage.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/contact/messages  (admin — Phase 4: JWT-gated)
   ────────────────────────────────────────────────────────── */
const getMessages = (req, res, next) => {
  try {
    const { status } = req.query;

    let results = [...contactMessages];
    if (status) {
      results = results.filter((m) => m.status === status);
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count:   results.length,
      data:    results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitContact,
  getMessages,
  VALID_SUBJECTS,
};
