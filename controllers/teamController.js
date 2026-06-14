/**
 * controllers/teamController.js
 * Business logic for team listing and join-team requests.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

const teams        = require('../data/teams');
const joinRequests = require('../data/joinRequests');
const hackathons   = require('../data/hackathons');
const { createError } = require('../utils/createError');
const { paginate }    = require('../utils/paginate');

/* ──────────────────────────────────────────────────────────
   GET /api/teams
   Query params: hackathonId, status, experienceLevel,
                 techStack, search, page, limit
   ────────────────────────────────────────────────────────── */
const getAllTeams = (req, res, next) => {
  try {
    const {
      hackathonId,
      status,
      experienceLevel,
      techStack,
      search,
      page  = 1,
      limit = 10,
    } = req.query;

    let results = [...teams];

    // ── Filters ─────────────────────────────────────────────
    if (hackathonId) {
      results = results.filter((t) => t.hackathonId === hackathonId);
    }

    if (status) {
      results = results.filter(
        (t) => t.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (experienceLevel) {
      results = results.filter(
        (t) => t.experienceLevel.toLowerCase() === experienceLevel.toLowerCase()
      );
    }

    if (techStack) {
      const stackTerms = techStack.toLowerCase().split(',').map((s) => s.trim());
      results = results.filter((t) =>
        stackTerms.some((term) =>
          t.techStack.some((ts) => ts.toLowerCase().includes(term))
        )
      );
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.projectIdea.toLowerCase().includes(term) ||
          t.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          t.rolesNeeded.some((r) => r.toLowerCase().includes(term))
      );
    }

    // ── Recruiting-first sort ────────────────────────────────
    results.sort((a, b) => {
      if (a.status === 'recruiting' && b.status !== 'recruiting') return -1;
      if (a.status !== 'recruiting' && b.status === 'recruiting') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const paginated = paginate(results, parseInt(page, 10), parseInt(limit, 10));

    res.status(200).json({
      success: true,
      ...paginated,
      filters: { hackathonId, status, experienceLevel, techStack, search },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/teams/:id
   ────────────────────────────────────────────────────────── */
const getTeamById = (req, res, next) => {
  try {
    const { id } = req.params;

    const team = teams.find((t) => t.id === id || t.slug === id);
    if (!team) {
      return next(createError(404, `Team '${id}' not found.`));
    }

    // Enrich with hackathon details
    const hackathon = hackathons.find((h) => h.id === team.hackathonId) || null;

    res.status(200).json({
      success: true,
      data: {
        ...team,
        hackathon: hackathon
          ? { id: hackathon.id, name: hackathon.name, deadline: hackathon.deadline }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   POST /api/teams/join
   Body: { teamId, name, email, role, skills[], message }
   ────────────────────────────────────────────────────────── */
const joinTeam = (req, res, next) => {
  try {
    const { teamId, name, email, role, skills, message } = req.body;

    // ── Verify team exists ───────────────────────────────────
    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return next(createError(404, `Team '${teamId}' not found.`));
    }

    // ── Check team is still recruiting ───────────────────────
    if (team.status !== 'recruiting') {
      return next(
        createError(409, `Team '${team.name}' is no longer accepting members.`)
      );
    }

    // ── Check team capacity ──────────────────────────────────
    if (team.currentMembers.length >= team.maxMembers) {
      return next(
        createError(409, `Team '${team.name}' is already at maximum capacity.`)
      );
    }

    // ── Prevent duplicate requests (same email + teamId) ─────
    const duplicate = joinRequests.find(
      (r) => r.teamId === teamId && r.email.toLowerCase() === email.toLowerCase()
    );
    if (duplicate) {
      return next(
        createError(
          409,
          `A join request from '${email}' for this team already exists.`
        )
      );
    }

    // ── Create join request ──────────────────────────────────
    const newRequest = {
      id:        uuidv4(),
      teamId,
      teamName:  team.name,
      hackathonId:   team.hackathonId,
      hackathonName: team.hackathonName,
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      role:      role.trim(),
      skills:    Array.isArray(skills) ? skills.map((s) => s.trim()) : [],
      message:   message ? message.trim() : '',
      status:    'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    joinRequests.push(newRequest);

    // ── Response (omit internal id from public payload) ──────
    res.status(201).json({
      success: true,
      message: `Your request to join '${team.name}' has been submitted! The team lead will review it shortly.`,
      data: {
        requestId:  newRequest.id,
        teamId:     newRequest.teamId,
        teamName:   newRequest.teamName,
        status:     newRequest.status,
        submittedAt: newRequest.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────────────────
   GET /api/teams/join-requests  (admin / future auth-gated)
   Returns all pending join requests — Phase 4 will require JWT
   ────────────────────────────────────────────────────────── */
const getJoinRequests = (req, res, next) => {
  try {
    const { teamId, status } = req.query;

    let results = [...joinRequests];

    if (teamId)  results = results.filter((r) => r.teamId === teamId);
    if (status)  results = results.filter((r) => r.status === status);

    res.status(200).json({
      success: true,
      count: results.length,
      data:  results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  joinTeam,
  getJoinRequests,
};
