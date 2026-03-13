'use strict';

require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { init: initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    // Initialize Socket.io on the HTTP server
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`CampusConnect API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      httpServer.close(() => process.exit(1));
    });

    return httpServer;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
