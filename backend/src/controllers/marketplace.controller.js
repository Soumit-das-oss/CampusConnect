'use strict';

const mongoose = require('mongoose');
const { uploadImage } = require('../config/cloudinary');
const {
  findListingsByCollege,
  findListingById,
  createMarketplaceListing,
} = require('../services/marketplace.service');
const MarketplaceListing = require('../models/MarketplaceListing');

/**
 * Helper – validate a MongoDB ObjectId.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Multer middleware for listing images (up to 5) ───────────────────────────

const uploadListingImages = uploadImage.array('images', 5);

// ─── Create Listing ───────────────────────────────────────────────────────────

async function createListingHandler(req, res, next) {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'title, description, and price are required fields.',
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'price must be a non-negative number.',
      });
    }

    // Collect uploaded image URLs (req.files set by multer CloudinaryStorage)
    const images = req.files ? req.files.map((f) => f.path) : [];

    const collegeId = req.user.collegeId._id || req.user.collegeId;

    const listing = await createMarketplaceListing({
      title,
      description,
      price: parsedPrice,
      images,
      category: category || null,
      sellerId: req.user._id,
      collegeId,
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/marketplace
 * Create a new marketplace listing with optional image uploads.
 * Exported as an array so multer runs before the handler.
 */
const createListing = [uploadListingImages, createListingHandler];

// ─── Get Listings ─────────────────────────────────────────────────────────────

/**
 * GET /api/marketplace
 * Return all available listings for the authenticated user's college.
 * Supports optional ?category=books query param.
 */
async function getListings(req, res, next) {
  try {
    const collegeId = req.user.collegeId._id || req.user.collegeId;
    const { category, page = 1, limit = 20 } = req.query;

    const listings = await findListingsByCollege(collegeId, {
      category: category || null,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: { listings },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Listing By ID ────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/:id
 * Return a single listing by its ObjectId.
 */
async function getListingById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing id.' });
    }

    const listing = await findListingById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Mark As Sold ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/marketplace/:id/sold
 * Mark a listing as sold. Only the seller is permitted.
 */
async function markAsSold(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing id.' });
    }

    const listing = await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can mark a listing as sold.',
      });
    }

    if (listing.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Listing is already marked as sold.',
      });
    }

    listing.status = 'sold';
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing marked as sold.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Delete Listing ───────────────────────────────────────────────────────────

/**
 * DELETE /api/marketplace/:id
 * Delete a listing. Only the seller is permitted.
 */
async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing id.' });
    }

    const listing = await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can delete this listing.',
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createListing,
  getListings,
  getListingById,
  markAsSold,
  deleteListing,
};
