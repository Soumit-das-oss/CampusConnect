'use strict';

const { body } = require('express-validator');

/**
 * Validation rules for POST /api/auth/register
 */
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['student', 'committee'])
    .withMessage('Role must be either student or committee'),
];

/**
 * Validation rules for POST /api/auth/login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for PATCH /api/users/profile
 */
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('skills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each skill must be a non-empty string'),

  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),

  body('projects.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project title is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
};
