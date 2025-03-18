// backend/controllers/userController.js
const User = require('../models/User');
const { sendMessage, sendBroadcast } = require('../services/baileys');

// Get all users
const getUsers = async (req, res) => {
  try {
    const { search, isGroup, isActive, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { jid: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isGroup !== undefined) {
      query.isGroup = isGroup === 'true';
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const users = await User.find(query)
      .sort({ lastInteraction: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ jid: req.params.jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { jid, name, isGroup, isActive } = req.body;
    
    // Validate JID format
    if (!jid.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JID format. Must include @ symbol.'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ jid });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this JID already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      jid,
      name: name || '',
      isGroup: isGroup || false,
      phone: jid.split('@')[0],
      isActive: isActive || false,  // Include isActive flag
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, tags, active, isActive } = req.body;
    
    // Find user
    const user = await User.findOne({ jid: req.params.jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (tags !== undefined) user.tags = tags;
    if (active !== undefined) user.active = active;
    if (isActive !== undefined) user.isActive = isActive; // Update isActive flag
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Toggle user active status
const toggleUserActive = async (req, res) => {
  try {
    // Find user
    const user = await User.findOne({ jid: req.params.jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Toggle isActive flag
    user.isActive = !user.isActive;
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} for bot responses`
    });
  } catch (error) {
    console.error('Error toggling user active status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Send message to a user
const sendMessageToUser = async (req, res) => {
  try {
    const { jid } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Send message
    const success = await sendMessage(jid, message);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Send broadcast message to multiple users
const sendBroadcastMessage = async (req, res) => {
  try {
    const { message, jids, filter } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    let targetJids = [];
    
    // If specific JIDs provided
    if (jids && Array.isArray(jids) && jids.length > 0) {
      targetJids = jids;
    } 
    // Otherwise use filter
    else if (filter) {
      const query = { active: true };
      
      // Apply filters
      if (filter.isGroup !== undefined) {
        query.isGroup = filter.isGroup;
      }
      
      if (filter.isActive !== undefined) {
        query.isActive = filter.isActive;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        query.tags = { $in: filter.tags };
      }
      
      // Get matching users
      const users = await User.find(query).select('jid');
      targetJids = users.map(user => user.jid);
    } else {
      // Default to all active, bot-enabled users
      const users = await User.find({ 
        active: true,
        isActive: true
      }).select('jid');
      
      targetJids = users.map(user => user.jid);
    }
    
    if (targetJids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No recipients found'
      });
    }
    
    // Send broadcast
    const results = await sendBroadcast(targetJids, message);
    
    res.status(200).json({
      success: true,
      message: `Broadcast sent to ${results.filter(r => r.success).length}/${targetJids.length} recipients`,
      results
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all active JIDs for broadcasting
const getActiveJids = async (req, res) => {
  try {
    // Find all active users that the bot should respond to
    const users = await User.find({ 
      active: true,
      isActive: true 
    }).select('jid name isGroup');
    
    const jids = users.map(user => ({
      jid: user.jid,
      name: user.name || user.jid.split('@')[0],
      isGroup: user.isGroup
    }));
    
    res.status(200).json({
      success: true,
      count: jids.length,
      data: jids
    });
  } catch (error) {
    console.error('Error getting active JIDs:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserActive,
  sendMessageToUser,
  sendBroadcastMessage,
  getActiveJids
};