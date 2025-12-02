const express = require("express");
const {
  getVenue,
  getVenues,
  getVenueById,
} = require("../controllers/venueController");

const router = express.Router();

router.get("/availability", getVenues);
router.get("/:id", getVenueById);

module.exports = router;
