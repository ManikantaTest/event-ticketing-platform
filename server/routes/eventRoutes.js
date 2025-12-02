const express = require("express");
const {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getCategories,
  getTicketTypes,
  getSessionsByEventId,
  getSessionById,
  getEventsByOrganizerId,
  getEventsByUserInterests,
  getFilteredEvents,
  getSimilarEvents,
  getPopularEvents,
  getTrendingEvents,
  getRecommendedEvents,
  getSessionsCount,
  updateEventName,
  writeReview,
  updateEventImage,
} = require("../controllers/eventController");
const { verifyToken } = require("../middleware/auth");
const location = require("../middleware/location");
const optionalAuth = require("../middleware/optional");

const router = express.Router();

router.post("/", verifyToken, createEvent);
router.get("/filtered", optionalAuth, location, getFilteredEvents);
router.get("/popularEvents", optionalAuth, location, getPopularEvents);
router.get("/trendingEvents", getTrendingEvents);
router.get("/recommendedEvents", optionalAuth, getRecommendedEvents);
router.get("/user/interests", verifyToken, getEventsByUserInterests);
router.get("/categories", getCategories);
router.get("/ticketTypes", getTicketTypes);
router.get("/organizer/:id", verifyToken, getEventsByOrganizerId);

router.get("/session/:id", verifyToken, getSessionById);
router.get("/:id/similarEvents", getSimilarEvents);
router.get("/:id/sessionsCount", verifyToken, getSessionsCount);
router.get("/:id/sessions", verifyToken, getSessionsByEventId);

router.get("/:id", getEventById);
router.put("/:id", verifyToken, updateEvent);
router.put("/:id/updateEventName", verifyToken, updateEventName);
router.put("/:id/updateEventImage", verifyToken, updateEventImage);
router.post("/:id/writeReview", verifyToken, writeReview);
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
