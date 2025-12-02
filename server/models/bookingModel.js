const mongoose = require("mongoose");

const bookedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // e.g. A1, B2
  section: { type: String, required: true }, // Platinum, Gold, Silver
  price: { type: Number, required: true }, // price at booking time
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    // 🔥 store exactly which seats were booked
    seats: [bookedSeatSchema],

    // (Optional) Keep a summary of tickets by type
    ticketsSummary: [
      {
        type: {
          type: String,
          enum: ["Gold", "Silver", "Platinum"],
          required: true,
        },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
