'use strict';

const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');

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
 * GET /api/events
 * Return all events for the current user's college, newest first.
 */
async function getEvents(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const events = await Event.find({ collegeId })
      .populate('organizer', 'name avatarUrl role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: { events },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events
 * Committee head creates a new event → notifies all college users in real-time.
 */
async function createEvent(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { title, description, date, venue, category } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    // Banner image uploaded via multer → Cloudinary; falls back to null if not provided
    const imageUrl = req.file?.path || null;

    // 1. Create the event
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category: category || 'other',
      imageUrl: imageUrl || null,
      organizer: req.user._id,
      collegeId,
    });

    await event.populate('organizer', 'name avatarUrl role');

    // 2. Find all college users except the organizer
    const collegeUsers = await User.find({
      collegeId,
      _id: { $ne: req.user._id },
    }).select('_id');

    // 3. Bulk-create notifications
    const notificationMessage = `📅 New event: "${title}" by ${req.user.name}`;
    if (collegeUsers.length > 0) {
      await Notification.insertMany(
        collegeUsers.map((u) => ({
          userId: u._id,
          eventId: event._id,
          message: notificationMessage,
          read: false,
        }))
      );
    }

    // 4. Emit real-time event to college room
    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('new_event', {
        event,
        message: notificationMessage,
      });
    } catch {
      // Socket.io not available — degrade gracefully (notifications still saved)
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events/:id
 * Return a single event by ID.
 */
async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name avatarUrl role'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEvents, createEvent, getEventById };
