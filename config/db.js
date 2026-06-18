/**
 * config/db.js
 * MongoDB connection via Mongoose.
 */

'use strict';

const { MONGO_URI, NODE_ENV } = require('./env');

/**
 * connectDB - establishes a Mongoose connection.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn('WARN: MONGO_URI not set - running with in-memory data store.');
    return;
  }

  const mongoose = require('mongoose');

  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('WARN: MongoDB disconnected.');
    });

  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
