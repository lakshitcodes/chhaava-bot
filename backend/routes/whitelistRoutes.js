// backend/routes/whitelistRoutes.js
const express = require('express');
const {
  getWhitelistedUsers,
  addToWhitelist,
  removeFromWhitelist
} = require('../controllers/whitelistController');

const router = express.Router();

// Get all whitelisted users and add JID to whitelist
router.route('/')
  .get(getWhitelistedUsers)
  .post(addToWhitelist);

// Remove JID from whitelist
router.route('/:jid')
  .delete(removeFromWhitelist);

// Export the router
module.exports = router;