const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date },

    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    recurrence: {
      type: String,
      enum: ["single", "multi-day", "weekly"],
      default: "single",
    },
    selectedWeekdays: [String], // only for weekly (0=Sun..6=Sat)

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      label: String,
    },
    ageLimit: {
      type: Number,
      enum: [0, 5, 12, 16, 18, 21],
      default: 0,
    },
    languages: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      enum: [
        "Music",
        "Sports",
        "Workshops",
        "Conferences",
        "Festivals",
        "Tech & Innovation",
        "Charity",
        "Comedy",
        "Exhibitions",
      ],
      required: true,
    },
    bannerImage: { type: String, default: "https://placehold.co/1240x300/png" },
    thumbnailImage: {
      type: String,
      default: "https://placehold.co/400x660/png",
    },

    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },

    interestedUsers: { type: Number, default: 0 },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);
