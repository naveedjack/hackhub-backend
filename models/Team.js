/**
 * models/Team.js
 * Mongoose schema for a HackHub team.
 * Mirrors the shape of data/teams.js entries.
 */

'use strict';

const mongoose = require('mongoose');

// ── Embedded member sub-document ─────────────────────────────────────────────
const MemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
    name:   { type: String, required: true, trim: true },
    role:   { type: String, trim: true, default: null },
    avatar: { type: String, default: null },
    skills: { type: [String], default: [] },
  },
  { _id: false }
);

// ── Team schema ───────────────────────────────────────────────────────────────
const TeamSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Team name is required'],
      trim:      true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    slug: {
      type:      String,
      required:  [true, 'Slug is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    hackathonId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Hackathon',
      default:  null,
    },
    hackathonName: {
      type:    String,
      default: null,
    },
    description: {
      type:      String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default:   '',
    },
    projectIdea: {
      type:      String,
      maxlength: [500, 'Project idea cannot exceed 500 characters'],
      default:   '',
    },
    status: {
      type:    String,
      enum:    ['recruiting', 'full', 'completed'],
      default: 'recruiting',
    },
    maxMembers: {
      type:    Number,
      default: 4,
      min:     [1, 'Team must allow at least 1 member'],
      max:     [10, 'Team cannot exceed 10 members'],
    },
    currentMembers: {
      type:    [MemberSchema],
      default: [],
    },
    rolesNeeded: {
      type:    [String],
      default: [],
    },
    skillsNeeded: {
      type:    [String],
      default: [],
    },
    techStack: {
      type:    [String],
      default: [],
    },
    communicationChannel: {
      type:    String,
      default: null,
    },
    timezone: {
      type:    String,
      default: null,
    },
    experienceLevel: {
      type:    String,
      enum:    ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    tags: {
      type:    [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for common query patterns
TeamSchema.index({ slug: 1 });
TeamSchema.index({ hackathonId: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ experienceLevel: 1 });
TeamSchema.index({ tags: 1 });

module.exports = mongoose.model('Team', TeamSchema);
