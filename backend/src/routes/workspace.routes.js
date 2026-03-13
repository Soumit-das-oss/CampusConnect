'use strict';

const { Router } = require('express');
const {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  saveCanvas,
  addMember,
  deleteWorkspace,
} = require('../controllers/workspace.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();
router.use(protect);

router.get('/', listWorkspaces);              // GET  /api/workspaces
router.post('/', createWorkspace);            // POST /api/workspaces
router.get('/:id', getWorkspace);             // GET  /api/workspaces/:id
router.patch('/:id/canvas', saveCanvas);      // PATCH /api/workspaces/:id/canvas
router.post('/:id/members', addMember);       // POST /api/workspaces/:id/members
router.delete('/:id', deleteWorkspace);       // DELETE /api/workspaces/:id

module.exports = router;
