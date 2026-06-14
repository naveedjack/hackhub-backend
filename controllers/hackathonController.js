/**
 * controllers/hackathonController.js
 * Business logic for all hackathon-related endpoints.
 * Data layer calls are isolated so swapping in Mongoose later
 * requires changing only this file, not the routes.
 */

'use strict';

const hackathons = require('../data/hackathons');
const { createError } = require('../utils/createError');
const { paginate }    = require('../utils/paginate');

/* ──────────────────────────────────────────────────────────
   GET /api/hackathons
   Query params: category, status, mode, search, page, limit
   ────────────────────────────────────────────────────────── */
const getAllHackathons = (req, res, next) => {
  try {
    const {
      category,
      status,
      mode,
      search,
      page  = 1,
      limit = 10,
    } = req.query;

    let results = [...hackathons];

    // ── Filters ─────────────────────────────────────────────
    if (category) {
      results = results.filter(
        (h) => h.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status) {
      results = results.filter(
        (h) => h.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (mode) {
      results = results.filter(
        (h) => h.mode.toLowerCase() === mode.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          h.organizer.toLowerCase().includes(term) ||
          h.description.toLowerCase().includes(term) ||
          h.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    // ── Sort by deadline ascending ───────────────────────────
    results.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // ── Pagination ───────────────────────────────────────────
    const paginated = paginate(results, parseInt(page, 10), parseInt(limit, 10));

    res.status(200).json({
      success: true,
      ...paginated,
      filters: { category, status, mode, search },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/hackathons/:id
   ────────────────────────────────────────────────────────── */
const getHackathonById = (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by id OR slug
    const hackathon = hackathons.find(
      (h) => h.id === id || h.slug === id
    );

    if (!hackathon) {
      return next(createError(404, `Hackathon '${id}' not found.`));
    }

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/hackathons/categories
   Returns distinct category list for frontend filter tabs
   ────────────────────────────────────────────────────────── */
const getCategories = (_req, res, next) => {
  try {
    const categories = [...new Set(hackathons.map((h) => h.category))];
    const statuses   = [...new Set(hackathons.map((h) => h.status))];
    const modes      = [...new Set(hackathons.map((h) => h.mode))];

    res.status(200).json({
      success: true,
      data: { categories, statuses, modes },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/hackathons/stats
   Aggregated numbers for the hero stats section
   ────────────────────────────────────────────────────────── */
const getStats = (_req, res, next) => {
  try {
    const total      = hackathons.length;
    const live       = hackathons.filter((h) => h.status === 'live').length;
    const upcoming   = hackathons.filter((h) => h.status === 'upcoming').length;
    const totalPrize = hackathons.reduce((sum, h) => sum + h.prizePool, 0);
    const totalTeams = hackathons.reduce((sum, h) => sum + h.registeredTeams, 0);

    res.status(200).json({
      success: true,
      data: {
        totalHackathons: total,
        liveHackathons:  live,
        upcomingHackathons: upcoming,
        totalPrizePool:  totalPrize,
        totalRegisteredTeams: totalTeams,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  getCategories,
  getStats,
};
