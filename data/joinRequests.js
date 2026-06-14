/**
 * data/joinRequests.js
 * In-memory store for team join requests.
 * In Phase 3 this becomes a MongoDB collection with a Mongoose model.
 *
 * Structure mirrors the future JoinRequest Mongoose schema exactly so
 * the switch to MongoDB is a pure drop-in replacement.
 */

'use strict';

/**
 * @type {Array<{
 *   id: string,
 *   teamId: string,
 *   teamName: string,
 *   name: string,
 *   email: string,
 *   role: string,
 *   skills: string[],
 *   message: string,
 *   status: 'pending'|'accepted'|'rejected',
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
const joinRequests = [];

module.exports = joinRequests;
