const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Gold", "Silver", "Platinum"],
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 },
  totalSeats: { type: Number, required: true, min: 0 },
});

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // A1, B2, etc.
  section: { type: String, required: true }, // Platinum, Gold
  status: {
    type: String,
    enum: ["available", "reserved", "booked"],
    default: "available",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Each session will hold its own tickets
const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  tickets: [ticketSchema],
  seats: [seatSchema], // seat-level availability
  occupancy: { type: Number, default: 0 }, // Number of booked seats
});

module.exports = mongoose.model("Session", sessionSchema);
