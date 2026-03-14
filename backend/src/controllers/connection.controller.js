'use strict';

const mongoose = require('mongoose');
const Connection = require('../models/Connection');
const User = require('../models/User');

/**
 * Helper – validate a MongoDB ObjectId and return a 400 if invalid.
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * POST /api/connections/send
 * Body: { receiverId }
 * Send a connection request to another user.
 */
async function sendRequest(req, res, next) {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'receiverId is required.',
      });
    }

    if (!isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiverId.',
      });
    }

    // Cannot send a request to yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a connection request to yourself.',
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId).select('_id name collegeId');
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Enforce same-campus rule
    const senderCampus = req.user.collegeId?._id?.toString() || req.user.collegeId?.toString();
    const receiverCampus = receiver.collegeId?._id?.toString() || receiver.collegeId?.toString();
    if (!senderCampus || !receiverCampus || senderCampus !== receiverCampus) {
      return res.status(403).json({
        success: false,
        message: 'You can only connect with students from your own campus.',
      });
    }

    // Check if a connection between these two already exists (in either direction)
    const existing = await Connection.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existing) {
      const statusMessages = {
        pending: 'A connection request is already pending between you and this user.',
        accepted: 'You are already connected with this user.',
        rejected: 'Your previous connection request was rejected. You cannot resend at this time.',
      };
      return res.status(409).json({
        success: false,
        message: statusMessages[existing.status] || 'Connection already exists.',
      });
    }

    const connection = await Connection.create({ senderId, receiverId });

    await connection.populate([
      { path: 'senderId', select: 'name email avatarUrl' },
      { path: 'receiverId', select: 'name email avatarUrl' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Connection request sent.',
      data: { connection },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/connections/accept/:id
 * Accept a pending connection request. Only the receiver can accept.
 */
async function acceptRequest(req, res, next) {
  try {
    const connectionId = req.params.id;

    if (!isValidObjectId(connectionId)) {
      return res.status(400).json({ success: false, message: 'Invalid connection id.' });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      receiverId: req.user._id,
      status: 'pending',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending connection request not found.',
      });
    }

    connection.status = 'accepted';
    await connection.save();

    await connection.populate([
      { path: 'senderId', select: 'name email avatarUrl' },
      { path: 'receiverId', select: 'name email avatarUrl' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Connection request accepted.',
      data: { connection },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/connections/reject/:id
 * Reject a pending connection request. Only the receiver can reject.
 */
async function rejectRequest(req, res, next) {
  try {
    const connectionId = req.params.id;

    if (!isValidObjectId(connectionId)) {
      return res.status(400).json({ success: false, message: 'Invalid connection id.' });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      receiverId: req.user._id,
      status: 'pending',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending connection request not found.',
      });
    }

    connection.status = 'rejected';
    await connection.save();

    res.status(200).json({
      success: true,
      message: 'Connection request rejected.',
      data: { connection },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/connections
 * Return all accepted connections for the authenticated user.
 */
async function getConnections(req, res, next) {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted',
    })
      .populate('senderId', 'name email avatarUrl bio skills')
      .populate('receiverId', 'name email avatarUrl bio skills')
      .sort({ updatedAt: -1 });

    // Map to return the "other" user from each connection
    const connectedUsers = connections.map((conn) => {
      const isSender = conn.senderId._id.toString() === userId.toString();
      return {
        connectionId: conn._id,
        connectedAt: conn.updatedAt,
        user: isSender ? conn.receiverId : conn.senderId,
      };
    });

    res.status(200).json({
      success: true,
      count: connectedUsers.length,
      data: { connections: connectedUsers },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/connections/pending
 * Return pending incoming connection requests for the authenticated user.
 */
async function getPendingRequests(req, res, next) {
  try {
    const campusId = (req.user.collegeId?._id || req.user.collegeId)?.toString();

    const requests = await Connection.find({
      receiverId: req.user._id,
      status: 'pending',
    })
      .populate('senderId', 'name email avatarUrl bio skills collegeId')
      .sort({ createdAt: -1 });

    // Only surface requests from students on the same campus
    const filtered = requests.filter((r) => {
      const senderCampus = (r.senderId?.collegeId?._id || r.senderId?.collegeId)?.toString();
      return campusId && senderCampus === campusId;
    });

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: { requests: filtered },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getConnections,
  getPendingRequests,
};
