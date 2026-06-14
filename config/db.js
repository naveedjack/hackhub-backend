/**
 * config/db.js
 * MongoDB connection via Mongoose.
 * ─── PHASE 3 READY ───────────────────────────────────────────
 * Currently stubbed. To activate:
 *   1. npm install mongoose
 *   2. Add MONGO_URI to your .env
 *   3. Call connectDB() in server.js before app.listen()
 */

'use strict';

const { MONGO_URI, NODE_ENV } = require('./env');

/**
 * connectDB — establishes a Mongoose connection.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn('⚠️   MONGO_URI not set — running with in-memory data store.');
    return;
  }

  // Uncomment below when mongoose is installed:
  /*
  const mongoose = require('mongoose');

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Mongoose 6+ options (no need for useNewUrlParser etc.)
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Retrying...');
    });

  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
  */
};

module.exports = { connectDB };
