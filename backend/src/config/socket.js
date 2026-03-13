'use strict';

const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * @param {import('http').Server} httpServer
 */
function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth handshake: verify JWT token sent from client
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('collegeId', 'name domain city');

      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const collegeId = socket.user.collegeId?._id || socket.user.collegeId;
    if (collegeId) {
      socket.join(`college:${collegeId}`);
    }

    socket.on('disconnect', () => {
      // cleanup handled automatically by socket.io
    });
  });

  return io;
}

/**
 * Get the initialized io instance.
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { init, getIO };
