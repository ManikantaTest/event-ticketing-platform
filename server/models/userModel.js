const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: function () {
        // Password is required ONLY for normal email/password users
        return !this.isOAuth;
      },
      minlength: 6,
    },
    isOAuth: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "organizer"],
      default: "user",
    },
    phone: {
      type: String,
      match: /^\+?[1-9]\d{1,14}$/,
    },
    userProfileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },
    preferredLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.209, 28.6139],
      },
      label: { type: String, default: "New Delhi, Delhi" },
    },
    interestedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: function () {
          return this.role === "user";
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
