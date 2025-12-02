const express = require("express");
const {
  updateOrganizer,
  deleteOrganizer,
  getOrganizerProfile,
  getOrganizerDashboard,
  getManageEventData,
  updateSession,
  getOrganizerEvents,
  getOrganizerProfileByUserId,
  getOrganizerBasicStats,
  getOrganizerSalesStats,
  getOrganizerCategoryStats,
  getOrganizerTopSellingEvents,
  getOrganizerUpcomingEvents,
  getOrganizerEventsTable,
} = require("../controllers/organizerController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Organizer Profile Routes
router.get("/profile/:id", getOrganizerProfile);
router.get("/profile/user/:id", getOrganizerProfileByUserId);
router.get("/dashboard/basic", verifyToken, getOrganizerBasicStats);
router.get("/dashboard/sales", verifyToken, getOrganizerSalesStats);
router.get("/dashboard/categories", verifyToken, getOrganizerCategoryStats);
router.get("/dashboard/top-selling", verifyToken, getOrganizerTopSellingEvents);
router.get("/dashboard/upcoming", verifyToken, getOrganizerUpcomingEvents);
router.get("/dashboard/events-table", verifyToken, getOrganizerEventsTable);
router.put("/update", verifyToken, updateOrganizer);
router.delete("/delete", verifyToken, deleteOrganizer);
router.get("/dashboard", verifyToken, getOrganizerDashboard);
router.get("/events", verifyToken, getOrganizerEvents);
router.get("/manage-event/:eventId", verifyToken, getManageEventData);
router.put("/:sessionId/update-session", verifyToken, updateSession);

module.exports = router;
