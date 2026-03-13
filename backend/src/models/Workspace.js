'use strict';

const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    // Excalidraw canvas state — persisted as JSON string
    elements: {
      type: String,
      default: '[]',
    },
    appState: {
      type: String,
      default: '{}',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

workspaceSchema.index({ collegeId: 1, creatorId: 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
