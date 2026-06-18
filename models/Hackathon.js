/**
 * models/Hackathon.js
 * Mongoose schema for a HackHub hackathon.
 * Mirrors the shape of data/hackathons.js entries.
 */

'use strict';

const mongoose = require('mongoose');

const PrizeSchema = new mongoose.Schema(
  {
    place:       { type: String, required: true },
    amount:      { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const JudgeSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    title:   { type: String, default: null },
    company: { type: String, default: null },
    avatar:  { type: String, default: null },
  },
  { _id: false }
);

const HackathonSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Hackathon name is required'],
      trim:      true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type:      String,
      required:  [true, 'Slug is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    tagline: {
      type:    String,
      default: '',
    },
    description: {
      type:    String,
      default: '',
    },
    category: {
      type: String,
      enum: ['ai', 'web3', 'healthtech', 'fintech', 'social-good', 'open', 'iot', 'gaming'],
      default: 'open',
    },
    status: {
      type:    String,
      enum:    ['upcoming', 'live', 'ended'],
      default: 'upcoming',
    },
    mode: {
      type:    String,
      enum:    ['online', 'in-person', 'hybrid'],
      default: 'online',
    },
    startDate:    { type: Date, default: null },
    endDate:      { type: Date, default: null },
    deadline:     { type: Date, default: null },
    prizePool:    { type: String, default: null },
    prizes:       { type: [PrizeSchema], default: [] },
    judges:       { type: [JudgeSchema], default: [] },
    participants: { type: Number, default: 0 },
    teamSizeMin:  { type: Number, default: 1 },
    teamSizeMax:  { type: Number, default: 4 },
    tags:         { type: [String], default: [] },
    techTags:     { type: [String], default: [] },
    organizer:    { type: String, default: null },
    website:      { type: String, default: null },
    logo:         { type: String, default: null },
    banner:       { type: String, default: null },
    featured:     { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

HackathonSchema.index({ slug: 1 });
HackathonSchema.index({ status: 1 });
HackathonSchema.index({ category: 1 });
HackathonSchema.index({ featured: 1 });
HackathonSchema.index({ deadline: 1 });

module.exports = mongoose.model('Hackathon', HackathonSchema);
