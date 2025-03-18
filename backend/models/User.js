// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,  // Explicitly specify if bot should respond to this JID
  },
  metadata: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastInteraction: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String],
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;