/**
 * server.js - HackHub API Entry Point
 * Boots Express, connects DB, starts listening.
 */

'use strict';

const app           = require('./app');
const { PORT }      = require('./config/env');
const { connectDB } = require('./config/db');

// Connect to MongoDB Atlas (no-op if MONGO_URI is not set)
connectDB().then(() => {

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('  +------------------------------------------+');
    console.log(`  |   HackHub API running on port ${PORT}        |`);
    console.log(`  |   ENV  : ${(process.env.NODE_ENV || 'development').padEnd(30)}|`);
    console.log(`  |   URL  : http://localhost:${PORT}/api         |`);
    console.log('  +------------------------------------------+');
    console.log('');
  });

  // Graceful Shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received - shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

});

// Unhandled Rejections / Exceptions
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
