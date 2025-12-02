const User = require("../models/userModel");
const Event = require("../models/eventModel");
const bcrypt = require("bcryptjs");
const cities = require("../data/Indian-Cities-Database.json");

const getUserProfile = async (req, res) => {
  const id = req.user._id;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, data: user });
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { _id: userId } = req.user; // decoded from JWT
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // don’t return password

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
};

// Delete user profile
const deleteUser = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
};

// const updateUserInterests = async (req, res) => {
//   const { eventId } = req.params;
//   const userId = req.user._id;

//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   let message = "";

//   if (user.interestedEvents.includes(eventId)) {
//     // Remove event
//     user.interestedEvents = user.interestedEvents.filter(
//       (e) => e.toString() !== eventId
//     );
//     message = "Event removed successfully";
//   } else {
//     // Add event
//     user.interestedEvents.push(eventId);
//     message = "Event added successfully";
//   }

//   await user.save();

//   return res
//     .status(200)
//     .json({ success: true, message, data: user.interestedEvents });
// };

const updateUserInterests = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const event = await Event.findById(eventId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  let message = "";

  const alreadyInterested = user.interestedEvents.includes(eventId);

  if (alreadyInterested) {
    /** 🔻 REMOVE INTEREST */
    user.interestedEvents = user.interestedEvents.filter(
      (e) => e.toString() !== eventId
    );

    event.interestedUsers = Math.max(0, event.interestedUsers - 1); // prevent negative

    message = "Event removed successfully";
  } else {
    /** 🔺 ADD INTEREST */
    user.interestedEvents.push(eventId);

    event.interestedUsers = (event.interestedUsers || 0) + 1;

    message = "Event added successfully";
  }

  await user.save();
  await event.save();

  return res.status(200).json({
    success: true,
    message,
    data: {
      interestedEvents: user.interestedEvents,
      interestedUsers: event.interestedUsers,
    },
  });
};

const setLocation = async (req, res) => {
  const { lat, lng, label } = req.body;

  // Always update cookie
  res.cookie("userLocation", JSON.stringify({ lng, lat, label }), {
    httpOnly: true,
    sameSite: "lax", // allow cross-origin
    secure: false, // true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  // If logged in, update DB too
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      preferredLocation: { label, type: "Point", coordinates: [lng, lat] },
    });

    const user = await User.findById(req.user._id);
  }

  res.json({ success: true });
};

const getLocation = (req, res) => {
  if (req.user) {
    res.json(req.user.preferredLocation);
    return;
  }
  res.json(req.userLocation);
};

const searchCities = (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(cities);

  const results = cities.filter((c) =>
    c.City.toLowerCase().includes(q.toLowerCase())
  );

  res.json(results.slice(0, 10)); // limit to 10 results
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phoneNumber } = req.body;

    if (!firstName && !lastName && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { username: fullName }),
        ...(phoneNumber && { phone: phoneNumber }),
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Error updating profile.",
      error: err.message,
    });
  }
};

// ✅ Update Email
const updateEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail, confirmEmail } = req.body;

    if (!newEmail || !confirmEmail) {
      return res.status(400).json({
        success: false,
        message: "Both email fields are required.",
      });
    }

    if (newEmail !== confirmEmail) {
      return res.status(400).json({
        success: false,
        message: "Emails do not match.",
      });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email: newEmail },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Email updated successfully.",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating email:", err);
    res.status(500).json({
      success: false,
      message: "Error updating email.",
      error: err.message,
    });
  }
};

// ✅ Update Password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // CASE 1: OAuth user (no password stored)
    if (!user.password || user.isOAuth) {
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.isOAuth = false; // Now they have a normal password
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password created successfully.",
      });
    }

    // CASE 2: Normal user (must verify current password)
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({
      success: false,
      message: "Error updating password.",
      error: err.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUser,
  deleteUser,
  setLocation,
  getLocation,
  searchCities,
  updateUserInterests,
  updateProfile,
  updateEmail,
  updatePassword,
};
