const cron = require("node-cron");
const Event = require("../models/eventModel");
// const Event = require("../models/Event");

function getEventStatus(event) {
  const now = new Date();

  const startDate = event.startDate.toISOString().split("T")[0];
  const endDate = event.endDate.toISOString().split("T")[0];

  const start = new Date(`${startDate}T${event.startTime}:00`);
  const end = new Date(`${endDate}T${event.endTime}:00`);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
}

// Runs every 1 minute → safest for event platforms
cron.schedule("* * * * *", async () => {
  try {
    const events = await Event.find({});

    for (const event of events) {
      const newStatus = getEventStatus(event);

      if (event.status !== newStatus) {
        await Event.findByIdAndUpdate(event._id, { status: newStatus });
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});

module.exports = {};
