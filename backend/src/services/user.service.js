'use strict';

const User = require('../models/User');

/**
 * Find all users belonging to a specific college.
 * Optionally filter by skills (case-insensitive AND match — all skills must be present).
 *
 * @param {string|ObjectId} collegeId - The college's ObjectId
 * @param {string[]|null}   skillsFilter - Array of skill strings to filter by, or null
 * @returns {Promise<User[]>}
 */
async function findUsersByCollege(collegeId, skillsFilter = null) {
  const query = { collegeId };

  if (skillsFilter && skillsFilter.length > 0) {
    // Each entry in skillsFilter must appear in the user's skills array (case-insensitive)
    query.skills = {
      $all: skillsFilter.map((skill) => new RegExp(`^${skill}$`, 'i')),
    };
  }

  return User.find(query)
    .select('-password')
    .populate('collegeId', 'name domain city')
    .sort({ createdAt: -1 });
}

/**
 * Find a single user by their MongoDB ObjectId.
 *
 * @param {string|ObjectId} id - User ObjectId
 * @returns {Promise<User|null>}
 */
async function findUserById(id) {
  return User.findById(id)
    .select('-password')
    .populate('collegeId', 'name domain city');
}

/**
 * Update a user's profile fields.
 * Only the fields present in `data` will be updated.
 *
 * @param {string|ObjectId} userId - The user's ObjectId
 * @param {object}          data   - Partial user fields to update (name, bio, skills, projects, resumeUrl, avatarUrl, etc.)
 * @returns {Promise<User>}
 */
async function updateUserProfile(userId, data) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    {
      new: true,           // return updated document
      runValidators: true, // run mongoose schema validators on update
    }
  )
    .select('-password')
    .populate('collegeId', 'name domain city');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

module.exports = {
  findUsersByCollege,
  findUserById,
  updateUserProfile,
};
