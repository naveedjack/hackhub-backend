/**
 * utils/paginate.js
 * Generic in-memory paginator.
 * Returns the same shape that a Mongoose .paginate() plugin would,
 * so switching to MongoDB pagination is seamless.
 */

'use strict';

/**
 * @template T
 * @param {T[]}   data    - Full dataset (already filtered/sorted)
 * @param {number} page   - Current page (1-indexed)
 * @param {number} limit  - Items per page
 * @returns {{
 *   data: T[],
 *   pagination: {
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number,
 *     hasNextPage: boolean,
 *     hasPrevPage: boolean
 *   }
 * }}
 */
const paginate = (data, page = 1, limit = 10) => {
  const safePage  = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));

  const total      = data.length;
  const totalPages = Math.ceil(total / safeLimit);
  const start      = (safePage - 1) * safeLimit;
  const end        = start + safeLimit;
  const sliced     = data.slice(start, end);

  return {
    data: sliced,
    pagination: {
      total,
      page:        safePage,
      limit:       safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
};

module.exports = { paginate };
