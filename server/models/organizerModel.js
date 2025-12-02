const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    phone: {
      type: String,
      match: /^\+?[1-9]\d{1,14}$/,
    },
    organizerProfileImage: {
      type: String,
      default: "https://yourcdn.com/default-profile.png",
    },
    orgName: {
      type: String,
    },
    orgEmail: {
      type: String,
      match: /.+\@.+\..+/,
    },
    orgDescription: {
      type: String,
    },
    organizerBannerImage: {
      type: String,
      default: "https://yourcdn.com/default-profile.png",
    },
    orgSpecialities: [
      {
        type: String,
        enum: [
          "Conference",
          "Workshop",
          "Seminar",
          "Concert",
          "Exhibition",
          "Sports",
          "Other",
        ],
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    eventsHosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organizer", organizerSchema);
