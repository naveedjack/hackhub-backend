/**
 * seed/index.js
 * One-shot seed script: clears collections and inserts the in-memory
 * fixture data from data/ into MongoDB.
 *
 * Usage:
 *   node seed/index.js            -- seed (upsert) all collections
 *   node seed/index.js --clear    -- drop all collections only
 *
 * Requires MONGO_URI to be set in .env
 */

'use strict';

require('dotenv').config();

const mongoose   = require('mongoose');
const Hackathon  = require('../models/Hackathon');
const Team       = require('../models/Team');
const User       = require('../models/User');

const hackathonsData = require('../data/hackathons');
const teamsData      = require('../data/teams');

// ── helpers ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in .env');
  process.exit(1);
}

async function connect() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
}

async function disconnect() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

// ── seed hackathons ──────────────────────────────────────────────────────────
async function seedHackathons() {
  await Hackathon.deleteMany({});
  console.log('Cleared hackathons collection');

  const docs = hackathonsData.map((h) => ({
    name:         h.name,
    slug:         h.slug || h.name.toLowerCase().replace(/\s+/g, '-'),
    tagline:      h.tagline || '',
    description:  h.description || '',
    category:     h.category || 'open',
    status:       h.status || 'upcoming',
    mode:         h.mode || 'online',
    startDate:    h.startDate  ? new Date(h.startDate)  : null,
    endDate:      h.endDate    ? new Date(h.endDate)    : null,
    deadline:     h.deadline   ? new Date(h.deadline)   : null,
    prizePool:    h.prizePool  || null,
    prizes:       h.prizes     || [],
    judges:       h.judges     || [],
    participants: h.participants || 0,
    teamSizeMin:  h.teamSize?.min || 1,
    teamSizeMax:  h.teamSize?.max || 4,
    tags:         h.tags       || [],
    techTags:     h.techTags   || [],
    organizer:    h.organizer  || null,
    website:      h.website    || null,
    logo:         h.logo       || null,
    banner:       h.banner     || null,
    featured:     h.featured   || false,
  }));

  const inserted = await Hackathon.insertMany(docs);
  console.log(`Seeded ${inserted.length} hackathons`);
  return inserted;
}

// ── seed teams ───────────────────────────────────────────────────────────────
async function seedTeams() {
  await Team.deleteMany({});
  console.log('Cleared teams collection');

  const docs = teamsData.map((t) => ({
    name:                 t.name,
    slug:                 t.slug,
    hackathonName:        t.hackathonName || null,
    description:          t.description  || '',
    projectIdea:          t.projectIdea  || '',
    status:               t.status       || 'recruiting',
    maxMembers:           t.maxMembers   || 4,
    currentMembers:       (t.currentMembers || []).map((m) => ({
      name:   m.name,
      role:   m.role   || null,
      avatar: m.avatar || null,
      skills: m.skills || [],
    })),
    rolesNeeded:          t.rolesNeeded  || [],
    skillsNeeded:         t.skillsNeeded || [],
    techStack:            t.techStack    || [],
    communicationChannel: t.communicationChannel || null,
    timezone:             t.timezone     || null,
    experienceLevel:      t.experienceLevel || 'intermediate',
    tags:                 t.tags         || [],
  }));

  const inserted = await Team.insertMany(docs);
  console.log(`Seeded ${inserted.length} teams`);
  return inserted;
}

// ── seed users (derived from team members) ───────────────────────────────────
async function seedUsers() {
  await User.deleteMany({});
  console.log('Cleared users collection');

  // Collect unique members across all teams
  const seen  = new Set();
  const users = [];

  for (const team of teamsData) {
    for (const m of (team.currentMembers || [])) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        users.push({
          name:   m.name,
          email:  `${m.name.toLowerCase().replace(/\s+/g, '.')}@hackhub.dev`,
          avatar: m.avatar || null,
          role:   m.role   || null,
          skills: m.skills || [],
          experienceLevel: team.experienceLevel || 'intermediate',
          timezone:        team.timezone        || null,
        });
      }
    }
  }

  const inserted = await User.insertMany(users);
  console.log(`Seeded ${inserted.length} users`);
  return inserted;
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await connect();

    const args = process.argv.slice(2);

    if (args.includes('--clear')) {
      await Hackathon.deleteMany({});
      await Team.deleteMany({});
      await User.deleteMany({});
      console.log('All collections cleared.');
    } else {
      await seedHackathons();
      await seedTeams();
      await seedUsers();
      console.log('\nDatabase seeded successfully!');
    }

  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
})();
