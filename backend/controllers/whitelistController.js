// backend/controllers/whitelistController.js
const User = require('../models/User');
const { sendMessage, sendBroadcast } = require('../services/baileys');

// Get all whitelisted users - CHECK BOTH FIELD NAMES
const getWhitelistedUsers = async (req, res) => {
  try {
    console.log("Fetching whitelisted users...");
    
    // Build query that checks both possible field names
    const users = await User.find({
      $or: [
        { whitelisted: true },
        { isActive: true }
      ]
    });
    
    console.log(`Found ${users.length} whitelisted users`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total: users.length,
      page: 1,
      pages: 1,
      data: users
    });
  } catch (error) {
    console.error('Error getting whitelisted users:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// Add a JID to whitelist - SET BOTH FIELD NAMES
const addToWhitelist = async (req, res) => {
  try {
    const { jid, name, isGroup } = req.body;
    
    console.log("Adding to whitelist:", req.body);
    
    // Validate JID format
    if (!jid.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JID format. Must include @ symbol.'
      });
    }
    
    // Check if user already exists
    let user = await User.findOne({ jid });
    
    if (user) {
      // Update existing user to be whitelisted - SET BOTH FIELDS
      user.whitelisted = true;
      user.isActive = true; // Also set isActive for backward compatibility
      
      if (name) user.name = name;
      if (isGroup !== undefined) user.isGroup = isGroup;
      
      await user.save();
      
      console.log(`Updated existing user ${jid} to be whitelisted`);
      
      return res.status(200).json({
        success: true,
        message: 'JID added to whitelist successfully',
        data: user
      });
    }
    
    // Create new whitelisted user - WITH BOTH FIELDS
    user = new User({
      jid,
      name: name || '',
      isGroup: isGroup || false,
      phone: jid.split('@')[0],
      whitelisted: true,
      isActive: true // Add isActive field too
    });
    
    await user.save();
    
    console.log(`Created new whitelisted user ${jid}`);
    
    res.status(201).json({
      success: true,
      message: 'JID added to whitelist successfully',
      data: user
    });
  } catch (error) {
    console.error('Error adding JID to whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// Remove a JID from whitelist - UNSET BOTH FIELD NAMES
const removeFromWhitelist = async (req, res) => {
  try {
    const { jid } = req.params;
    
    console.log("Removing from whitelist:", jid);
    
    // Find user
    const user = await User.findOne({ jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'JID not found'
      });
    }
    
    // Remove from whitelist - UNSET BOTH FIELDS
    user.whitelisted = false;
    user.isActive = false; // Also unset isActive for backward compatibility
    
    await user.save();
    
    console.log(`Removed ${jid} from whitelist`);
    
    res.status(200).json({
      success: true,
      message: 'JID removed from whitelist successfully'
    });
  } catch (error) {
    console.error('Error removing JID from whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

module.exports = {
  getWhitelistedUsers,
  addToWhitelist,
  removeFromWhitelist
};