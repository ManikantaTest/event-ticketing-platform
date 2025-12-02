const Venue = require("../models/venueModel");
const Event = require("../models/eventModel");

const getVenue = async (req, res) => {
  const { id } = req.params;
  const venue = await Venue.findById(id);
  if (!venue) {
    res.status(404).json({ success: false, message: "No venue found" });
  }
  res.status(200).json({ success: true, data: venue });
};

const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await Venue.findById(id)
      .select("name city state seatingLayout capacity location")
      .lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (err) {
    console.error("Error fetching venue details:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching venue details",
      error: err.message,
    });
  }
};

const getVenues = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "startDate is required.",
      });
    }

    // ✅ If no endDate is given (single-day event), use startDate as endDate
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);

    // ✅ Fetch all venues (lightweight)
    const venues = await Venue.find({}, "name city state location").lean();

    // ✅ Find overlapping events
    // (existing.startDate <= newEnd) && (existing.endDate >= newStart)
    const overlappingEvents = await Event.find({
      $and: [{ startDate: { $lte: end } }, { endDate: { $gte: start } }],
    }).select("venue");

    const occupiedVenueIds = new Set(
      overlappingEvents.map((ev) => ev.venue?.toString())
    );

    // ✅ Filter only available venues
    const availableVenues = venues
      .filter((venue) => !occupiedVenueIds.has(venue._id.toString()))
      .map((venue) => ({
        _id: venue._id,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        location: venue.location,
      }));

    res.status(200).json({
      success: true,
      message: `Available venues for ${
        startDate === (endDate || startDate)
          ? startDate
          : `${startDate} to ${endDate}`
      }`,
      data: availableVenues,
    });
  } catch (err) {
    console.error("Error fetching available venues:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching available venues",
      error: err.message,
    });
  }
};

module.exports = { getVenue, getVenueById, getVenues };
