'use strict';

const MarketplaceListing = require('../models/MarketplaceListing');

/**
 * Find all available marketplace listings for a specific college.
 * Supports optional category filtering and pagination.
 *
 * @param {string|ObjectId} collegeId               - The college's ObjectId
 * @param {object}          [options={}]
 * @param {string|null}     [options.category=null]  - Category string to filter by, or null
 * @param {number}          [options.page=1]         - Page number for pagination (1-indexed)
 * @param {number}          [options.limit=20]       - Number of results per page
 * @returns {Promise<MarketplaceListing[]>}
 */
async function findListingsByCollege(collegeId, options = {}) {
  const { category = null, page = 1, limit = 20 } = options;

  const query = {
    collegeId,
    status: 'available',
  };

  if (category && category.trim() !== '') {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
  }

  const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

  return MarketplaceListing.find(query)
    .populate('sellerId', 'name email avatarUrl')
    .populate('collegeId', 'name city')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

/**
 * Find a single marketplace listing by its ObjectId.
 *
 * @param {string|ObjectId} id - Listing ObjectId
 * @returns {Promise<MarketplaceListing|null>}
 */
async function findListingById(id) {
  return MarketplaceListing.findById(id)
    .populate('sellerId', 'name email avatarUrl bio')
    .populate('collegeId', 'name city');
}

/**
 * Create a new marketplace listing.
 *
 * @param {object} data
 * @param {string}   data.title
 * @param {string}   data.description
 * @param {number}   data.price
 * @param {string[]} data.images
 * @param {string}   data.sellerId
 * @param {string}   data.collegeId
 * @param {string}   [data.category]
 * @returns {Promise<MarketplaceListing>}
 */
async function createMarketplaceListing(data) {
  const listing = await MarketplaceListing.create(data);

  return MarketplaceListing.findById(listing._id)
    .populate('sellerId', 'name email avatarUrl')
    .populate('collegeId', 'name city');
}

module.exports = {
  findListingsByCollege,
  findListingById,
  createMarketplaceListing,
};
