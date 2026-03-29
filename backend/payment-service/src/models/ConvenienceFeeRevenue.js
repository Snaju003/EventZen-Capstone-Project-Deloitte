const mongoose = require("mongoose");

const convenienceFeeRevenueSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true,
  },
  seatCount: {
    type: Number,
    required: true,
    min: 1,
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  convenienceFee: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const ConvenienceFeeRevenue = mongoose.model(
  "ConvenienceFeeRevenue",
  convenienceFeeRevenueSchema,
  "convenience_fee_revenue"
);

module.exports = ConvenienceFeeRevenue;
