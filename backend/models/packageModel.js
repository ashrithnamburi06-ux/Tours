// backend/models/packageModel.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: String },
    images: [{ type: String }], // URLs or stored filenames
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    featured: { type: Boolean, default: false },
    availabilityStatus: { type: String, enum: ['Available', 'Limited Seats', 'Sold Out'], default: 'Available' },
    travelDates: [{ type: String }],
    travelType: { type: String, default: 'Group Tour' },
    included: [{ type: String }],
    excluded: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
