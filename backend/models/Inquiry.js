// backend/models/Inquiry.js
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    index: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  category: {
    type: String,
    enum: ['Service Appointment Issue', 'Test Drive Inquiry', 'Roadside Emergency', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  summary: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  notes: [{
    content: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Create compound indexes for efficient querying
inquirySchema.index({ status: 1, category: 1, createdAt: -1 });
inquirySchema.index({ jid: 1, status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;