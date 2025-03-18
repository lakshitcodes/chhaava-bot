// backend/routes/userRoutes.js
const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserActive,
  sendMessageToUser,
  sendBroadcastMessage,
  getActiveJids
} = require('../controllers/userController');

const router = express.Router();

// Get all users and create new user
router.route('/')
  .get(getUsers)
  .post(createUser);

// Get active JIDs for broadcasting
router.route('/active-jids')
  .get(getActiveJids);

// Get, update, and send message to specific user
router.route('/:jid')
  .get(getUser)
  .put(updateUser);

// Toggle user active status for bot responses
router.route('/:jid/toggle-active')
  .put(toggleUserActive);

// Send message to specific user
router.route('/:jid/message')
  .post(sendMessageToUser);

// Send broadcast message
router.route('/broadcast')
  .post(sendBroadcastMessage);

module.exports = router;