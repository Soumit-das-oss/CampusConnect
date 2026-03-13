'use strict';

const { Router } = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);   // GET  /api/messages/unread-count
router.get('/', getConversations);             // GET  /api/messages
router.get('/:userId', getMessages);           // GET  /api/messages/:userId
router.post('/:userId', sendMessage);          // POST /api/messages/:userId

module.exports = router;
