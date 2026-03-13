'use strict';

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const College = require('../models/College');
const { generateToken } = require('../utils/jwt');

/**
 * Helper – extract validation errors and send 422 response.
 * Returns true if errors were found (caller should return early).
 */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
}

/**
 * Helper – extract email domain (e.g. "user@mit.edu" → "mit.edu").
 */
function getEmailDomain(email) {
  return email.split('@')[1].toLowerCase();
}

/**
 * POST /api/auth/register
 * Register a new student with a college-validated email.
 */
async function register(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, email, password, role } = req.body;

    // 1. Extract domain and verify it belongs to a registered college
    const domain = getEmailDomain(email);
    const college = await College.findOne({ domain });

    if (!college) {
      return res.status(400).json({
        success: false,
        message: `No registered college found for email domain '@${domain}'. Please use your institutional email address.`,
      });
    }

    // 2. Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Create the user (password is hashed by pre-save hook on User model)
    const user = await User.create({
      name,
      email,
      password,
      collegeId: college._id,
      ...(role && { role }),
    });

    // 4. Populate college info before sending response
    await user.populate('collegeId', 'name domain city');

    // 5. Generate JWT
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate an existing user.
 */
async function login(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    // 1. Find user and explicitly select the password field (select: false by default)
    const user = await User.findOne({ email }).select('+password').populate('collegeId', 'name domain city');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 2. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Generate token
    const token = generateToken(user._id.toString());

    // Remove password from the response object
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 * Requires `protect` middleware to be applied first.
 */
async function getMe(req, res, next) {
  try {
    // req.user is already populated by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
