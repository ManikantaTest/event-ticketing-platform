const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: String,
  state: String,
  capacity: Number, // total seats
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  seatingLayout: [
    {
      section: { type: String, required: true }, // Platinum, Gold, etc.
      rows: [
        {
          label: { type: String, required: true }, // "A", "B"...
          seats: [String], // ["A1","A2","A3"...]
        },
      ],
      sectionCapacity: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Venue", venueSchema);
