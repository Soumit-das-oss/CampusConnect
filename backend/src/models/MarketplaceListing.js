'use strict';

const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Listing description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'sold'],
        message: 'Status must be available or sold',
      },
      default: 'available',
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

marketplaceListingSchema.index({ collegeId: 1, status: 1 });
marketplaceListingSchema.index({ sellerId: 1 });
marketplaceListingSchema.index({ category: 1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
