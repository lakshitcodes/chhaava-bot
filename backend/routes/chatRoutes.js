// backend/routes/chatRoutes.js
const express = require('express');
const {
  getChatHistory,
  getChat,
  getRecentChats,
  updateChatStatus
} = require('../controllers/chatController');

const router = express.Router();

// Get recent chats for dashboard
router.route('/recent')
  .get(getRecentChats);

// Get chat history for a specific user
router.route('/user/:jid')
  .get(getChatHistory);

// Get specific chat by ID and update status
router.route('/:id')
  .get(getChat)
  .put(updateChatStatus);

module.exports = router;