// backend/routes/inquiryRoutes.js
const express = require('express');
const Inquiry = require('../models/inquiryModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const sendList = (res, inquiries) => {
  res.json({ success: true, data: inquiries });
};

// @desc    Submit new inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, numberOfPeople, travelDate, details } = req.body;

  if (!name || !email || !details) {
    res.status(400);
    throw new Error('Please fill out all required fields');
  }

  const inquiry = new Inquiry({
    name,
    email,
    numberOfPeople: Number(numberOfPeople) || 1,
    travelDate,
    details
  });

  const createdInquiry = await inquiry.save();
  res.status(201).json({ success: true, data: createdInquiry });
});

// @desc    Get all inquiries (admin only)
// @route   GET /api/inquiries
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  const inquiries = await Inquiry.find();
  sendList(res, inquiries);
});

// @desc    Delete inquiry (admin only)
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }
  await inquiry.deleteOne();
  res.json({ success: true, data: { message: 'Inquiry removed' } });
});

module.exports = router;
