// backend/models/bookingModel.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    travelDate: { type: String, required: true },
    numberOfTravelers: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    location: { type: String },
    streetAddress: { type: String },
    postalCode: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
