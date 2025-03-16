// backend/controllers/chatController.js
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const { jid } = req.params;
    const { limit = 50, before } = req.query;
    
    // Build query
    const query = { jid };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    // Get chats
    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Check if user exists
    const user = await User.findOne({ jid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
      user
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single chat by ID
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get recent chats for dashboard
const getRecentChats = async (req, res) => {
  try {
    const { limit = 10, page = 1, status } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.conversationStatus = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get distinct JIDs with most recent chats
    const distinctJids = await Chat.aggregate([
      { $match: query },
      { $sort: { lastUpdated: -1 } },
      { $group: {
        _id: '$jid',
        lastUpdated: { $max: '$lastUpdated' },
        chatId: { $first: '$_id' }
      }},
      { $sort: { lastUpdated: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // Get full chat documents and user info
    const results = await Promise.all(distinctJids.map(async (item) => {
      const chat = await Chat.findById(item.chatId);
      const user = await User.findOne({ jid: item._id });
      
      return {
        chat,
        user: user || { jid: item._id }
      };
    }));
    
    // Count total distinct JIDs
    const total = await Chat.aggregate([
      { $match: query },
      { $group: { _id: '$jid' } },
      { $count: 'total' }
    ]);
    
    res.status(200).json({
      success: true,
      count: results.length,
      total: total.length > 0 ? total[0].total : 0,
      page: parseInt(page),
      pages: Math.ceil((total.length > 0 ? total[0].total : 0) / parseInt(limit)),
      data: results
    });
  } catch (error) {
    console.error('Error getting recent chats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update chat status
const updateChatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'ended', 'escalated'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active, ended, or escalated.'
      });
    }
    
    const chat = await Chat.findById(id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }
    
    chat.conversationStatus = status;
    await chat.save();
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getChatHistory,
  getChat,
  getRecentChats,
  updateChatStatus
};