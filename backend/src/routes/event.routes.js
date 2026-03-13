'use strict';

const express = require('express');
const { body } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadImage } = require('../config/cloudinary');
const { getEvents, createEvent, getEventById } = require('../controllers/event.controller');

const router = express.Router();

const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),

  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),

  body('venue')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters'),

  body('category')
    .optional()
    .isIn(['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'other'])
    .withMessage('Invalid event category'),
];

router.use(protect);

router.get('/', getEvents);
router.post(
  '/',
  restrictTo('committee'),
  uploadImage.single('banner'),
  createEventValidator,
  createEvent
);
router.get('/:id', getEventById);

module.exports = router;
