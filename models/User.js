/**
 * models/User.js
 * Mongoose schema for a HackHub user.
 * Matches the member shape used in data/teams.js currentMembers[].
 */

'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    avatar: {
      type:    String,
      default: null,
    },
    role: {
      type:    String,
      trim:    true,
      default: null,
    },
    skills: {
      type:    [String],
      default: [],
    },
    bio: {
      type:      String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default:   '',
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
    github: {
      type:    String,
      default: null,
    },
    linkedin: {
      type:    String,
      default: null,
    },
    portfolio: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true,          // adds createdAt + updatedAt
    versionKey: false,
  }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
