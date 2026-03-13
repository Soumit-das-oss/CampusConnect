'use strict';

const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Return all notifications for the current user, newest first.
 */
async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('eventId', 'title date venue category')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all unread notifications for the current user as read.
 */
async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
