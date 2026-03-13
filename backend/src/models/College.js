'use strict';

const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'College email domain is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Corrected: Removed duplicate domain index

module.exports = mongoose.model('College', collegeSchema);