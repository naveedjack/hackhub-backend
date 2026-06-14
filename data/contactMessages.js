/**
 * data/contactMessages.js
 * In-memory store for contact form submissions.
 * In Phase 3 this becomes a MongoDB collection.
 */

'use strict';

/**
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   email: string,
 *   subject: string,
 *   message: string,
 *   ipAddress: string,
 *   userAgent: string,
 *   status: 'unread'|'read'|'replied',
 *   createdAt: string
 * }>}
 */
const contactMessages = [];

module.exports = contactMessages;
