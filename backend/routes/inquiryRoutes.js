// backend/routes/inquiryRoutes.js
const express = require('express');
const {
  getInquiries,
  getInquiry,
  updateInquiry,
  respondToInquiry,
  getInquiryStats
} = require('../controllers/inquiryController');

const router = express.Router();

// Get all inquiries and statistics
router.route('/')
  .get(getInquiries);

// Get inquiry statistics
router.route('/stats')
  .get(getInquiryStats);

// Get, update, and respond to specific inquiry
router.route('/:id')
  .get(getInquiry)
  .put(updateInquiry);

// Respond to specific inquiry
router.route('/:id/respond')
  .post(respondToInquiry);

module.exports = router;