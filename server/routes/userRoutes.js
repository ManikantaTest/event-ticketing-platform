const express = require("express");
const {
  updateUser,
  deleteUser,
  getUserProfile,
  setLocation,
  searchCities,
  getLocation,
  updateUserInterests,
  updateProfile,
  updateEmail,
  updatePassword,
} = require("../controllers/userController");
const optionalAuth = require("../middleware/optional");
const location = require("../middleware/location");
const { verifyToken } = require("../middleware/auth");
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// User Profile Routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);
router.put("/:eventId/updateInterests", verifyToken, updateUserInterests);
router.get("/selectedLocation", optionalAuth, location, getLocation);
router.get("/searchCities", searchCities);
router.post("/location", optionalAuth, setLocation);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/update-email", verifyToken, updateEmail);
router.put("/update-password", verifyToken, updatePassword);

module.exports = router;
