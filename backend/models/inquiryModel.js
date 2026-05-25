// backend/models/inquiryModel.js
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    numberOfPeople: { type: Number, default: 1 },
    travelDate: { type: String },
    details: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
