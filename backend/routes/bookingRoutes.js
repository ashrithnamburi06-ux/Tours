// backend/routes/bookingRoutes.js
const express = require('express');
const Booking = require('../models/bookingModel');
const Package = require('../models/packageModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const sendList = (res, bookings) => {
  res.json({ success: true, data: bookings });
};

const sendOne = (res, booking) => {
  res.json({ success: true, data: booking });
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
router.post('/', async (req, res) => {
  const {
    packageId,
    name,
    email,
    phone,
    travelDate,
    numberOfTravelers,
    location,
    streetAddress,
    postalCode,
    notes
  } = req.body;

  if (!packageId || !name || !email || !phone || !travelDate || !numberOfTravelers) {
    res.status(400);
    throw new Error('Please fill out all required fields');
  }

  const pkg = await Package.findById(packageId);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }

  if (pkg.status !== 'active') {
    res.status(400);
    throw new Error('Package is currently inactive');
  }

  if (pkg.availabilityStatus === 'Sold Out') {
    res.status(400);
    throw new Error('Package is sold out and no longer available for booking');
  }

  // Calculate total price
  const totalPrice = pkg.price * Number(numberOfTravelers);

  const booking = new Booking({
    package: packageId,
    name,
    email,
    phone,
    travelDate,
    numberOfTravelers: Number(numberOfTravelers),
    totalPrice,
    location,
    streetAddress,
    postalCode,
    notes,
    status: 'Pending'
  });

  const createdBooking = await booking.save();
  await createdBooking.populate('package');
  res.status(201).json({ success: true, data: createdBooking });
});

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  const bookings = await Booking.find().populate('package');
  sendList(res, bookings);
});

// @desc    Change status (admin only)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body; // expect 'Pending', 'Confirmed', 'Cancelled'
  const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('package');
  if (!updated) {
    res.status(404);
    throw new Error('Booking not found');
  }
  sendOne(res, updated);
});

// @desc    Delete booking (admin only)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  await booking.deleteOne();
  res.json({ success: true, data: { message: 'Booking removed' } });
});

// @desc    Update a booking (admin only)
// @route   PUT /api/bookings/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('package');
  if (!updated) {
    res.status(404);
    throw new Error('Booking not found');
  }
  sendOne(res, updated);
});

module.exports = router;
