'use strict';

const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status must be pending, accepted, or rejected',
      },
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
connectionSchema.index({ receiverId: 1, status: 1 });
connectionSchema.index({ senderId: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
