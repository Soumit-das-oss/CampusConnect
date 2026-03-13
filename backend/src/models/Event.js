'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'other'],
        message: 'Invalid event category',
      },
      default: 'other',
    },
    customCategory: {
      type: String,
      trim: true,
      maxlength: [100, 'Custom category cannot exceed 100 characters'],
      default: null,
    },
    meetLink: {
      type: String,
      trim: true,
      maxlength: [500, 'Meet link cannot exceed 500 characters'],
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
  },
  { timestamps: true }
);

eventSchema.index({ collegeId: 1, date: -1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
