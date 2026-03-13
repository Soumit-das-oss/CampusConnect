'use strict';

const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── List Workspaces ──────────────────────────────────────────────────────────
/**
 * GET /api/workspaces
 * Returns all workspaces where the user is the creator OR a member.
 */
async function listWorkspaces(req, res, next) {
  try {
    const userId = req.user._id;
    const workspaces = await Workspace.find({
      $or: [{ creatorId: userId }, { members: userId }],
    })
      .populate('creatorId', 'name avatarUrl')
      .populate('members', 'name avatarUrl')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: { workspaces } });
  } catch (error) {
    next(error);
  }
}

// ─── Create Workspace ─────────────────────────────────────────────────────────
/**
 * POST /api/workspaces
 * Body: { name, memberIds: [] }
 */
async function createWorkspace(req, res, next) {
  try {
    const { name, memberIds = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Workspace name is required.' });
    }

    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    // Validate memberIds
    const validMembers = memberIds
      .filter((id) => isValidObjectId(id) && id !== req.user._id.toString())
      .map((id) => new mongoose.Types.ObjectId(id));

    const workspace = await Workspace.create({
      name: name.trim(),
      creatorId: req.user._id,
      members: validMembers,
      collegeId,
    });

    await workspace.populate([
      { path: 'creatorId', select: 'name avatarUrl' },
      { path: 'members', select: 'name avatarUrl' },
    ]);

    res.status(201).json({ success: true, data: { workspace } });
  } catch (error) {
    next(error);
  }
}

// ─── Get Single Workspace ─────────────────────────────────────────────────────
/**
 * GET /api/workspaces/:id
 * Returns the workspace with canvas state. Must be creator or member.
 */
async function getWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workspace id.' });
    }

    const workspace = await Workspace.findById(id)
      .populate('creatorId', 'name avatarUrl')
      .populate('members', 'name avatarUrl');

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const userId = req.user._id.toString();
    const isCreator = workspace.creatorId._id.toString() === userId;
    const isMember = workspace.members.some((m) => m._id.toString() === userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { workspace } });
  } catch (error) {
    next(error);
  }
}

// ─── Save Canvas State ────────────────────────────────────────────────────────
/**
 * PATCH /api/workspaces/:id/canvas
 * Body: { elements, appState }
 * Saves the current Excalidraw canvas state to the DB.
 */
async function saveCanvas(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workspace id.' });
    }

    const { elements, appState } = req.body;
    const userId = req.user._id.toString();

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const isCreator = workspace.creatorId.toString() === userId;
    const isMember = workspace.members.some((m) => m.toString() === userId);
    if (!isCreator && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (elements !== undefined) workspace.elements = elements;
    if (appState !== undefined) workspace.appState = appState;
    await workspace.save();

    res.status(200).json({ success: true, message: 'Canvas saved.' });
  } catch (error) {
    next(error);
  }
}

// ─── Add Member ───────────────────────────────────────────────────────────────
/**
 * POST /api/workspaces/:id/members
 * Body: { userId }
 */
async function addMember(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id.' });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    if (workspace.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can add members.' });
    }

    const alreadyMember = workspace.members.some((m) => m.toString() === userId);
    if (!alreadyMember) {
      workspace.members.push(userId);
      await workspace.save();
    }

    await workspace.populate('members', 'name avatarUrl');
    res.status(200).json({ success: true, data: { members: workspace.members } });
  } catch (error) {
    next(error);
  }
}

// ─── Delete Workspace ─────────────────────────────────────────────────────────
/**
 * DELETE /api/workspaces/:id
 * Only the creator can delete.
 */
async function deleteWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid workspace id.' });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    if (workspace.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this workspace.' });
    }

    await workspace.deleteOne();
    res.status(200).json({ success: true, message: 'Workspace deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  saveCanvas,
  addMember,
  deleteWorkspace,
};
