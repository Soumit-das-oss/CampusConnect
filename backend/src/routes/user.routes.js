'use strict';

const { Router } = require('express');
const {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadResume,
  uploadAvatar,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { updateProfileValidator } = require('../utils/validators');

const router = Router();

// All user routes require authentication
router.use(protect);

/**
 * GET /api/users
 * List all users from the same college.
 * Supports ?skills=react,node filter.
 */
router.get('/', getAllUsers);

/**
 * GET /api/users/:id
 * Retrieve a specific user's public profile.
 */
router.get('/:id', getUserById);

/**
 * PATCH /api/users/profile
 * Update authenticated user's name, bio, skills, and/or projects.
 */
router.patch('/profile', updateProfileValidator, updateProfile);

/**
 * POST /api/users/resume
 * Upload or replace the authenticated user's resume (PDF/DOC/DOCX).
 * uploadResume is [multerMiddleware, handler].
 */
router.post('/resume', uploadResume);

/**
 * POST /api/users/avatar
 * Upload or replace the authenticated user's avatar image.
 * uploadAvatar is [multerMiddleware, handler].
 */
router.post('/avatar', uploadAvatar);

module.exports = router;
