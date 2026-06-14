/**
 * app.js — Express Application
 * Configures middleware stack, mounts all API routes.
 * Kept separate from server.js so it can be imported in tests.
 */

'use strict';

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const { ALLOWED_ORIGINS, NODE_ENV } = require('./config/env');
const rateLimiter   = require('./middleware/rateLimiter');
const errorHandler  = require('./middleware/errorHandler');
const notFound      = require('./middleware/notFound');

// ── Route Modules ────────────────────────────────────────────
const hackathonRoutes = require('./routes/hackathons');
const teamRoutes      = require('./routes/teams');
const contactRoutes   = require('./routes/contact');

const app = express();

/* ──────────────────────────────────────────────────────────
   SECURITY HEADERS
   ────────────────────────────────────────────────────────── */
app.use(helmet());

/* ──────────────────────────────────────────────────────────
   CORS
   ────────────────────────────────────────────────────────── */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight for all routes

/* ──────────────────────────────────────────────────────────
   BODY PARSING
   ────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));          // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ──────────────────────────────────────────────────────────
   HTTP LOGGING
   ────────────────────────────────────────────────────────── */
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ──────────────────────────────────────────────────────────
   RATE LIMITING
   ────────────────────────────────────────────────────────── */
app.use('/api', rateLimiter);

/* ──────────────────────────────────────────────────────────
   HEALTH CHECK  (outside rate limiter)
   ────────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status:    'ok',
    service:   'HackHub API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    env:       NODE_ENV,
  });
});

/* ──────────────────────────────────────────────────────────
   API ROUTES
   ────────────────────────────────────────────────────────── */
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/teams',      teamRoutes);
app.use('/api/contact',    contactRoutes);

/* ──────────────────────────────────────────────────────────
   API ROOT  — lists available endpoints
   ────────────────────────────────────────────────────────── */
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the HackHub API 🚀',
    version: 'v1',
    endpoints: {
      hackathons: {
        list:   'GET  /api/hackathons',
        single: 'GET  /api/hackathons/:id',
        filter: 'GET  /api/hackathons?category=ai&status=live',
      },
      teams: {
        list:   'GET  /api/teams',
        single: 'GET  /api/teams/:id',
        join:   'POST /api/teams/join',
      },
      contact: {
        submit: 'POST /api/contact',
      },
      health: 'GET /health',
    },
    docs: 'https://github.com/hackhub-dev/api-docs (coming soon)',
  });
});

/* ──────────────────────────────────────────────────────────
   404 + GLOBAL ERROR HANDLER  (must be last)
   ────────────────────────────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
