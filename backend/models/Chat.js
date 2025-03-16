// backend/models/Chat.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'bot', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

const chatSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  conversationStatus: {
    type: String,
    enum: ['active', 'ended', 'escalated'],
    default: 'active'
  }
}, { timestamps: true });

// Create compound index for efficient querying
chatSchema.index({ jid: 1, lastUpdated: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;