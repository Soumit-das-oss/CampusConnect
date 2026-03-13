'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

/**
 * Generate a signed JWT for a given userId.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} Signed JWT token
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload containing { id, iat, exp }
 * @throws {JsonWebTokenError|TokenExpiredError} if token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
