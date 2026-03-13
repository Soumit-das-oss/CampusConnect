'use strict';

const { Router } = require('express');
const {
  createListing,
  getListings,
  getListingById,
  markAsSold,
  deleteListing,
} = require('../controllers/marketplace.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// All marketplace routes require authentication
router.use(protect);

/**
 * POST /api/marketplace
 * Create a new marketplace listing.
 * createListing is [multerMiddleware, handler] to handle image uploads.
 */
router.post('/', createListing);

/**
 * GET /api/marketplace
 * List all available listings for the authenticated user's college.
 * Supports ?category=books&page=1&limit=20 query params.
 */
router.get('/', getListings);

/**
 * GET /api/marketplace/:id
 * Retrieve a specific listing by its ObjectId.
 */
router.get('/:id', getListingById);

/**
 * PATCH /api/marketplace/:id/sold
 * Mark a listing as sold (seller only).
 */
router.patch('/:id/sold', markAsSold);

/**
 * DELETE /api/marketplace/:id
 * Delete a listing (seller only).
 */
router.delete('/:id', deleteListing);

module.exports = router;
