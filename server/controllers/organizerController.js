const Organizer = require("../models/organizerModel");
const Event = require("../models/eventModel");
const Session = require("../models/sessionModel");

const getOrganizerProfile = async (req, res) => {
  try {
    const { id } = req.params; // extract only the id string

    const organizer = await Organizer.findById(id).lean();

    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    return res.status(200).json({ success: true, data: organizer });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching organizer profile",
      error: err.message,
    });
  }
};

const getOrganizerProfileByUserId = async (req, res) => {
  try {
    const { id } = req.params; // extract only the id string

    const organizer = await Organizer.findOne({ user: id }).lean();

    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    return res.status(200).json({ success: true, data: organizer });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching organizer profile",
      error: err.message,
    });
  }
};

// Update organizer profile
const updateOrganizer = async (req, res) => {
  try {
    const { _id: userId } = req.user; // decoded from JWT
    const updates = req.body;

    const updatedOrganizer = await Organizer.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedOrganizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    res.status(200).json({ success: true, data: updatedOrganizer });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating organizer",
      error: err.message,
    });
  }
};

// Delete organizer profile
const deleteOrganizer = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const deletedOrganizer = await Organizer.findByIdAndDelete(userId);

    if (!deletedOrganizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Organizer deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting organizer",
      error: err.message,
    });
  }
};

async function getOrganizerFromUser(req, res) {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const organizer = await Organizer.findOne({ user: userId }).lean();
  if (!organizer) {
    res.status(404).json({ error: "Organizer profile not found" });
    return null;
  }

  return organizer;
}

const getOrganizerBasicStats = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    const [totalEvents, activeEvents] = await Promise.all([
      Event.countDocuments({ organizer: organizerId }),
      Event.countDocuments({
        organizer: organizerId,
        status: { $in: ["upcoming", "ongoing"] },
      }),
    ]);

    res.json({
      totalEvents,
      activeEvents,
      organizer: organizer.orgName,
    });
  } catch (err) {
    console.error("getOrganizerBasicStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerSalesStats = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    const ticketsAgg = await Session.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $match: { "event.organizer": organizerId } },
      { $unwind: "$tickets" },
      {
        $project: {
          sold: {
            $subtract: ["$tickets.totalSeats", "$tickets.available"],
          },
          price: "$tickets.price",
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$sold" },
          totalRevenue: { $sum: { $multiply: ["$sold", "$price"] } },
        },
      },
    ]);

    const totalTicketsSold = ticketsAgg[0]?.totalSold || 0;
    const totalRevenue = ticketsAgg[0]?.totalRevenue || 0;

    res.json({
      totalTicketsSold,
      totalRevenue,
    });
  } catch (err) {
    console.error("getOrganizerSalesStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerCategoryStats = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    // Total events and category counts (for percentages)
    const [totalEvents, categoryStats, revenueByCategory] = await Promise.all([
      Event.countDocuments({ organizer: organizerId }),
      Event.aggregate([
        { $match: { organizer: organizerId } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
      Session.aggregate([
        {
          $lookup: {
            from: "events",
            localField: "event",
            foreignField: "_id",
            as: "event",
          },
        },
        { $unwind: "$event" },
        { $match: { "event.organizer": organizerId } },
        { $unwind: "$tickets" },
        {
          $project: {
            category: "$event.category",
            sold: {
              $subtract: ["$tickets.totalSeats", "$tickets.available"],
            },
            price: "$tickets.price",
          },
        },
        {
          $group: {
            _id: "$category",
            revenue: { $sum: { $multiply: ["$sold", "$price"] } },
            ticketsSold: { $sum: "$sold" },
          },
        },
      ]),
    ]);

    const categoryPercentages = categoryStats.map((c) => ({
      category: c._id,
      percentage: totalEvents
        ? ((c.count / totalEvents) * 100).toFixed(2)
        : "0.00",
    }));

    res.json({
      categoryPercentages,
      revenueByCategory,
    });
  } catch (err) {
    console.error("getOrganizerCategoryStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerTopSellingEvents = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    const topSelling = await Session.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $match: { "event.organizer": organizerId } },
      { $unwind: "$tickets" },
      {
        $project: {
          eventId: "$event._id",
          title: "$event.title",
          sold: {
            $subtract: ["$tickets.totalSeats", "$tickets.available"],
          },
          price: "$tickets.price",
        },
      },
      {
        $group: {
          _id: "$eventId",
          title: { $first: "$title" },
          ticketsSold: { $sum: "$sold" },
          revenue: { $sum: { $multiply: ["$sold", "$price"] } },
        },
      },
      { $sort: { ticketsSold: -1 } },
      { $limit: 3 },
    ]);

    res.json({
      topSelling,
    });
  } catch (err) {
    console.error("getOrganizerTopSellingEvents error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerUpcomingEvents = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    const upcomingEvents = await Event.find({
      organizer: organizerId,
      status: "upcoming",
    })
      .select("title startDate category startingPrice bannerImage")
      .sort({ startDate: 1 })
      .limit(3)
      .lean();

    res.json({
      upcomingEvents,
    });
  } catch (err) {
    console.error("getOrganizerUpcomingEvents error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerEventsTable = async (req, res) => {
  try {
    const organizer = await getOrganizerFromUser(req, res);
    if (!organizer) return;
    const organizerId = organizer._id;

    const eventsTable = await Event.find({ organizer: organizerId })
      .select("title status category startDate endDate startingPrice")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      eventsTable,
    });
  } catch (err) {
    console.error("getOrganizerEventsTable error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const organizer = await Organizer.findOne({ user: userId }).lean();
    if (!organizer) {
      return res.status(404).json({ error: "Organizer profile not found" });
    }

    const organizerId = organizer._id;

    // -------------------------------------------------------------
    // 1) RUN ALL LIGHTWEIGHT QUERIES IN PARALLEL
    // -------------------------------------------------------------
    const [totalEvents, activeEvents, eventsTable, upcomingEvents] =
      await Promise.all([
        Event.countDocuments({ organizer: organizerId }),
        Event.countDocuments({
          organizer: organizerId,
          status: { $in: ["upcoming", "ongoing"] },
        }),
        Event.find({ organizer: organizerId })
          .select("title status category startDate endDate startingPrice")
          .sort({ createdAt: -1 })
          .lean(),
        Event.find({
          organizer: organizerId,
          status: "upcoming",
        })
          .select("title startDate category startingPrice bannerImage")
          .sort({ startDate: 1 })
          .limit(3)
          .lean(),
      ]);

    // -------------------------------------------------------------
    // 2) RUN ONE SINGLE AGGREGATION FOR SESSIONS → EVENTS
    //    (instead of 3 separate heavy pipelines)
    // -------------------------------------------------------------
    const sessionAgg = await Session.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $match: { "event.organizer": organizerId } },
      { $unwind: "$tickets" },
      {
        $addFields: {
          sold: {
            $subtract: [
              "$tickets.available",
              { $ifNull: ["$tickets.remaining", 0] },
            ],
          },
        },
      },
      {
        $project: {
          category: "$event.category",
          eventId: "$event._id",
          title: "$event.title",
          price: "$tickets.price",
          sold: 1,
        },
      },
    ]);

    // -------------------------------------------------------------
    // 3) DERIVE ALL METRICS FROM THE SAME ARRAY (0ms CPU cost)
    // -------------------------------------------------------------

    let totalSold = 0;
    let totalRevenue = 0;

    const revenueByCategoryMap = {};
    const topSellingMap = {};

    for (const s of sessionAgg) {
      const revenue = s.sold * s.price;

      // Total sold & revenue
      totalSold += s.sold;
      totalRevenue += revenue;

      // Revenue by category
      if (!revenueByCategoryMap[s.category]) {
        revenueByCategoryMap[s.category] = { revenue: 0, ticketsSold: 0 };
      }
      revenueByCategoryMap[s.category].revenue += revenue;
      revenueByCategoryMap[s.category].ticketsSold += s.sold;

      // Top selling events
      if (!topSellingMap[s.eventId]) {
        topSellingMap[s.eventId] = {
          title: s.title,
          ticketsSold: 0,
          revenue: 0,
        };
      }
      topSellingMap[s.eventId].ticketsSold += s.sold;
      topSellingMap[s.eventId].revenue += revenue;
    }

    const revenueByCategory = Object.entries(revenueByCategoryMap).map(
      ([cat, v]) => ({
        _id: cat,
        revenue: v.revenue,
        ticketsSold: v.ticketsSold,
      })
    );

    const topSelling = Object.entries(topSellingMap)
      .map(([id, v]) => ({
        _id: id,
        title: v.title,
        ticketsSold: v.ticketsSold,
        revenue: v.revenue,
      }))
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 3);

    // -------------------------------------------------------------
    // 4) CATEGORY PERCENTAGES
    // -------------------------------------------------------------
    const categoryStats = await Event.aggregate([
      { $match: { organizer: organizerId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryPercentages = categoryStats.map((c) => ({
      category: c._id,
      percentage: ((c.count / totalEvents) * 100).toFixed(2),
    }));

    // -------------------------------------------------------------
    // FINAL RESPONSE (NO STRUCTURE CHANGES)
    // -------------------------------------------------------------
    res.json({
      totalEvents,
      totalTicketsSold: totalSold,
      totalRevenue,
      activeEvents,
      revenueByCategory,
      categoryPercentages,
      eventsTable,
      topSelling,
      upcomingEvents,
      organizer: organizer.orgName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getOrganizerEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const organizer = await Organizer.findOne({ user: userId });
    if (!organizer) {
      return res.status(404).json({ error: "Organizer profile not found" });
    }
    const organizerId = organizer._id;
    const { search = "", page = 1, limit = 10 } = req.query;

    // Convert pagination params to numbers
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    // Build query
    const query = {
      organizer: organizerId,
    };

    // Add case-insensitive title search if provided
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(query);

    // Fetch events
    const events = await Event.find(query)
      .select("title status category startDate endDate startingPrice")
      .sort({ startDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total: totalEvents,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalEvents / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
      error: error.message,
    });
  }
};

const getManageEventData = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1️⃣ Fetch event + sessions
    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });

    const sessions = await Session.find({ event: eventId }).lean();
    if (!sessions.length) {
      return res.json({
        event,
        accumulatedStats: {},
        sessions: [],
      });
    }

    // 🔥 SORT SESSIONS BY DATE (ASCENDING)
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2️⃣ Accumulators
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let totalTicketsAvailable = 0;
    let totalTickets = 0;
    let totalTicketPriceSum = 0;
    let totalTicketCount = 0;

    const ticketTypeStats = {};

    // 3️⃣ Process sessions
    const sessionStats = sessions.map((session) => {
      const { tickets } = session;

      let sessionSold = 0;
      let sessionAvailable = 0;
      let sessionTotal = 0;
      let sessionRevenue = 0;
      const sessionTypeStats = {};

      for (const t of tickets) {
        const { type, totalSeats, available, price } = t;

        const sold = totalSeats - available;
        const revenue = sold * price;

        // Per-session stats
        sessionSold += sold;
        sessionAvailable += available;
        sessionTotal += totalSeats;
        sessionRevenue += revenue;

        // Per-ticket-type for this session
        sessionTypeStats[type] = {
          sold,
          available,
          total: totalSeats,
          revenue,
          price,
        };

        // Global type stats
        if (!ticketTypeStats[type]) {
          ticketTypeStats[type] = { sold: 0, available: 0, revenue: 0 };
        }
        ticketTypeStats[type].sold += sold;
        ticketTypeStats[type].available += available;
        ticketTypeStats[type].revenue += revenue;

        // Global counters
        totalTicketsSold += sold;
        totalRevenue += revenue;
        totalTicketsAvailable += available;
        totalTickets += totalSeats;
        totalTicketPriceSum += price;
        totalTicketCount++;
      }

      return {
        sessionId: session._id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        releaseDate: session.releaseDate,
        stats: {
          sold: sessionSold,
          available: sessionAvailable,
          total: sessionTotal,
          revenue: sessionRevenue,
          typeStats: sessionTypeStats,
        },
      };
    });

    // 4️⃣ Calculated totals
    const averageTicketPrice =
      totalTicketCount > 0 ? totalTicketPriceSum / totalTicketCount : 0;

    const ticketTypeDistribution = {};
    for (const type in ticketTypeStats) {
      const { sold, revenue } = ticketTypeStats[type];
      ticketTypeDistribution[type] = {
        percentage:
          totalTicketsSold > 0
            ? ((sold / totalTicketsSold) * 100).toFixed(2) + "%"
            : "0%",
        revenue,
      };
    }

    // 5️⃣ Final summary
    const accumulatedStats = {
      totalTicketsSold,
      totalRevenue,
      totalTicketsAvailable,
      totalTickets,
      averageTicketPrice: Number(averageTicketPrice.toFixed(2)),
      ticketTypeDistribution,
      ticketTypeStats,
    };

    return res.json({
      event,
      accumulatedStats,
      sessions: sessionStats, // already sorted by date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateSession = async (req, res) => {
  try {
    const { sessionId: id } = req.params;
    const { startTime, endTime, releaseDate, tickets, seats } = req.body;

    // Find existing session
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update fields if provided
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    // if (releaseDate) session.releaseDate = releaseDate;

    // ✅ Update tickets if provided
    if (tickets && Array.isArray(tickets)) {
      session.tickets = tickets.map((t) => ({
        type: t.type,
        price: t.price,
        available: t.available,
        totalSeats: t.totalSeats,
      }));
    }
    // Save updated session
    const updatedSession = await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      message: "Failed to update session",
      error: error.message,
    });
  }
};

module.exports = {
  getOrganizerProfile,
  getOrganizerProfileByUserId,
  updateOrganizer,
  deleteOrganizer,
  getOrganizerDashboard,
  getManageEventData,
  updateSession,
  getOrganizerEvents,
  getOrganizerBasicStats,
  getOrganizerSalesStats,
  getOrganizerCategoryStats,
  getOrganizerTopSellingEvents,
  getOrganizerUpcomingEvents,
  getOrganizerEventsTable,
};
