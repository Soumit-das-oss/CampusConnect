'use strict';

const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../config/socket');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── Get Conversations ────────────────────────────────────────────────────────

/**
 * GET /api/messages
 * Returns a list of all conversations for the current user,
 * each with the last message and unread count.
 */
async function getConversations(req, res, next) {
  try {
    const myId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
      // All messages where I am sender or receiver
      { $match: { $or: [{ senderId: myId }, { receiverId: myId }] } },
      // Tag the "other" participant
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', myId] },
              then: '$receiverId',
              else: '$senderId',
            },
          },
        },
      },
      // Sort descending so $first gives the most-recent message
      { $sort: { createdAt: -1 } },
      // Group per conversation partner
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiverId', myId] },
                    { $eq: ['$read', false] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      // Most recent conversation first
      { $sort: { 'lastMessage.createdAt': -1 } },
      // Join user info
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { _id: 1, name: 1, avatarUrl: 1 },
          lastMessage: {
            _id: 1,
            content: 1,
            createdAt: 1,
            senderId: 1,
            read: 1,
          },
          unreadCount: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: { conversations } });
  } catch (error) {
    next(error);
  }
}

// ─── Get Messages with a User ─────────────────────────────────────────────────

/**
 * GET /api/messages/:userId
 * Returns all messages between the current user and :userId.
 * Also marks received messages as read.
 */
async function getMessages(req, res, next) {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    const myId = req.user._id;
    const otherId = new mongoose.Types.ObjectId(userId);

    // Mark all unread messages sent by the other user as read
    await Message.updateMany(
      { senderId: otherId, receiverId: myId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .select('senderId receiverId content read createdAt');

    // Fetch the other user's basic info
    const otherUser = await User.findById(otherId).select('name avatarUrl');

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: { messages, otherUser } });
  } catch (error) {
    next(error);
  }
}

// ─── Send Message ─────────────────────────────────────────────────────────────

/**
 * POST /api/messages/:userId
 * Send a message to :userId.
 */
async function sendMessage(req, res, next) {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const receiver = await User.findById(userId).select('_id');
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId: userId,
      content: content.trim(),
    });

    // Real-time: notify the recipient in their personal room
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('new_message', {
        message: {
          _id: message._id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          read: message.read,
          createdAt: message.createdAt,
        },
        sender: {
          _id: req.user._id,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl,
        },
      });
    } catch (_) {
      // Socket.io may not be ready in tests — not critical
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
}

// ─── Get Total Unread Count ───────────────────────────────────────────────────

/**
 * GET /api/messages/unread-count
 * Returns total number of unread messages for the authenticated user.
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
    });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getConversations, getMessages, sendMessage, getUnreadCount };
