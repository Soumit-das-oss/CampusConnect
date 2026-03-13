'use strict';

const { Router } = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../utils/validators');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user with a college-domain validated email.
 */
router.post('/register', registerValidator, register);

/**
 * POST /api/auth/login
 * Authenticate an existing user and receive a JWT.
 */
router.post('/login', loginValidator, login);

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
router.get('/me', protect, getMe);

module.exports = router;
