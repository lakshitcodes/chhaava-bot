// backend/controllers/inquiryController.js
const Inquiry = require('../models/Inquiry');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { sendMessage } = require('../services/baileys');

// Get all inquiries with filters
const getInquiries = async (req, res) => {
  try {
    const { status, category, priority, assignedTo, limit = 20, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Get total count
    const total = await Inquiry.countDocuments(query);
    
    // Enrich with user and chat data
    const enrichedInquiries = await Promise.all(inquiries.map(async (inquiry) => {
      const user = await User.findOne({ jid: inquiry.jid }).select('name phone');
      return {
        ...inquiry.toObject(),
        user: user || { jid: inquiry.jid }
      };
    }));
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: enrichedInquiries
    });
  } catch (error) {
    console.error('Error getting inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get inquiry by id
const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }
    
    // Get associated chat and user
    const chat = await Chat.findById(inquiry.chatId);
    const user = await User.findOne({ jid: inquiry.jid });
    
    res.status(200).json({
      success: true,
      data: {
        inquiry,
        chat,
        user: user || { jid: inquiry.jid }
      }
    });
  } catch (error) {
    console.error('Error getting inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update inquiry
const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, note } = req.body;
    
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }
    
    // Update fields
    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (assignedTo !== undefined) inquiry.assignedTo = assignedTo;
    
    // Add note if provided
    if (note) {
      inquiry.notes.push({
        content: note,
        author: req.body.author || 'Admin', // Normally would come from authenticated user
        timestamp: new Date()
      });
    }
    
    // Set resolvedAt if status changed to resolved
    if (status === 'resolved' && inquiry.status !== 'resolved') {
      inquiry.resolvedAt = new Date();
      
      // Send resolution notification to user
      await sendMessage(
        inquiry.jid,
        `Your inquiry has been resolved by our team. Thank you for your patience. If you need further assistance, please let us know.`
      );
    }
    
    await inquiry.save();
    
    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Respond to inquiry
const respondToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }
    
    // Send message to user
    const success = await sendMessage(inquiry.jid, message);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
    
    // Add note to inquiry
    inquiry.notes.push({
      content: `Response sent: ${message}`,
      author: req.body.author || 'Admin', // Normally would come from authenticated user
      timestamp: new Date()
    });
    
    // Update status if still open
    if (inquiry.status === 'open') {
      inquiry.status = 'in-progress';
    }
    
    await inquiry.save();
    
    // Add message to chat history
    const chat = await Chat.findById(inquiry.chatId);
    if (chat) {
      chat.messages.push({
        role: 'system',
        content: message,
        timestamp: new Date(),
        metadata: { fromAdmin: true }
      });
      
      await chat.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get statistics
const getInquiryStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Inquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get counts by category
    const categoryCounts = await Inquiry.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get counts by priority
    const priorityCounts = await Inquiry.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Get counts by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyCounts = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        byStatus: statusCounts,
        byCategory: categoryCounts,
        byPriority: priorityCounts,
        dailyTrend: dailyCounts
      }
    });
  } catch (error) {
    console.error('Error getting inquiry stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getInquiries,
  getInquiry,
  updateInquiry,
  respondToInquiry,
  getInquiryStats
};