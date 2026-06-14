/**
 * server.js — HackHub API Entry Point
 * Boots Express, loads middleware, mounts routes, starts listening.
 */

'use strict';

const app  = require('./app');
const { PORT } = require('./config/env');

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log(`  ║   🚀 HackHub API running on port ${PORT}    ║`);
  console.log(`  ║   ENV  : ${process.env.NODE_ENV || 'development'}                    ║`);
  console.log(`  ║   URL  : http://localhost:${PORT}/api        ║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});

// ── Graceful Shutdown ────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚡  ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
  // Force exit after 10 s if connections linger
  setTimeout(() => {
    console.error('❌  Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Unhandled Rejections / Exceptions ───────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌  Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌  Uncaught Exception:', err);
  process.exit(1);
});
