/**
 * config/env.js
 * Loads .env and exports typed, validated environment variables.
 * All other modules import from here — never from process.env directly.
 */

'use strict';

require('dotenv').config();

const required = (key) => {
  if (!process.env[key]) {
    // In production, missing vars are fatal
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`❌  Missing required environment variable: ${key}`);
    }
  }
};

// Validate critical production vars
if (process.env.NODE_ENV === 'production') {
  required('MONGO_URI');
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:5500')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

module.exports = {
  PORT:            parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV:        process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS,

  // ── MongoDB (Phase 3) ──────────────────────────────────────
  MONGO_URI:       process.env.MONGO_URI || null,

  // ── Auth (Phase 4) ─────────────────────────────────────────
  JWT_SECRET:      process.env.JWT_SECRET || 'dev_secret_change_in_production',
  JWT_EXPIRES_IN:  process.env.JWT_EXPIRES_IN || '7d',

  // ── Email (Phase 5) ────────────────────────────────────────
  SMTP_HOST:       process.env.SMTP_HOST || null,
  SMTP_PORT:       parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER:       process.env.SMTP_USER || null,
  SMTP_PASS:       process.env.SMTP_PASS || null,
  FROM_EMAIL:      process.env.FROM_EMAIL || 'noreply@hackhub.dev',
};
