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