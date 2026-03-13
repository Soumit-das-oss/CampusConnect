'use strict';

const { Router } = require('express');
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getConnections,
  getPendingRequests,
} = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// All connection routes require authentication
router.use(protect);

/**
 * POST /api/connections/send
 * Body: { receiverId }
 * Send a connection request to another user.
 */
router.post('/send', sendRequest);

/**
 * POST /api/connections/accept/:id
 * Accept a pending connection request by its ID.
 */
router.post('/accept/:id', acceptRequest);

/**
 * POST /api/connections/reject/:id
 * Reject a pending connection request by its ID.
 */
router.post('/reject/:id', rejectRequest);

/**
 * GET /api/connections
 * Get all accepted connections for the authenticated user.
 */
router.get('/', getConnections);

/**
 * GET /api/connections/pending
 * Get all incoming pending connection requests.
 */
router.get('/pending', getPendingRequests);

module.exports = router;
