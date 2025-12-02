const express = require("express");
const {
  createBooking,
  getBookingsByUser,
  getBookingById,
  cancelBooking,
  isUserBookedEvent,
} = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getBookingsByUser);
router.get("/event/:eventId/is-booked", verifyToken, isUserBookedEvent);
router.get("/:id", verifyToken, getBookingById);
router.delete("/:id", verifyToken, cancelBooking);

module.exports = router;
