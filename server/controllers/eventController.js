const Event = require("../models/eventModel");
const Organizer = require("../models/organizerModel");
const userModel = require("../models/userModel");
const Session = require("../models/sessionModel");
const Venue = require("../models/venueModel");
const Booking = require("../models/bookingModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

const ticketTypes = ["general", "vip", "student", "early-bird"];

const generateSessions = (
  startDate,
  endDate,
  startTime,
  endTime,
  recurrence,
  weekdays,
  tickets
) => {
  let sessions = [];
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const formatDate = (date) => new Date(date);

  if (recurrence === "single") {
    sessions.push({
      date: formatDate(startDate),
      startTime,
      endTime,
      tickets: JSON.parse(JSON.stringify(tickets)),
    });
  }

  if (recurrence === "multi-day") {
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      sessions.push({
        date: formatDate(current),
        startTime,
        endTime,
        tickets: JSON.parse(JSON.stringify(tickets)),
      });
      current.setDate(current.getDate() + 1);
    }
  }

  if (recurrence === "weekly") {
    const end = new Date(endDate);
    let current = new Date(startDate);
    const weekdayNums = weekdays.map((d) => weekdayMap[d]);

    while (current <= end) {
      if (weekdayNums.includes(current.getDay())) {
        sessions.push({
          date: formatDate(current),
          startTime,
          endTime,
          tickets: JSON.parse(JSON.stringify(tickets)),
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return sessions;
};

function generateSeatsFromLayout(seatingLayout = []) {
  const seats = [];
  seatingLayout.forEach((section) => {
    const rows = section.rows || [];
    if (!rows.length) return;

    // If rows include seats array, use that
    rows.forEach((row) => {
      if (row.seats && Array.isArray(row.seats) && row.seats.length) {
        row.seats.forEach((sId) =>
          seats.push({
            seatId: sId,
            section: section.section,
            status: "available",
          })
        );
      } else {
        // fallback: evenly distribute numbers across rows
        // compute seatCount per row (integer, last row gets remaining)
        const seatsPerRow =
          Math.floor(section.sectionCapacity / rows.length) || 1;
        for (let i = 1; i <= seatsPerRow; i++) {
          seats.push({
            seatId: `${row.label}${i}`,
            section: section.section,
            status: "available",
          });
        }
      }
    });
  });
  return seats;
}

async function createSessionsForEvent({ eventId, eventPayload, venueDetails }) {
  if (!venueDetails?.seatingLayout?.length) {
    throw new Error("Venue seating layout required to create seats/sessions.");
  }

  /** 🪑 Generate seat map once per venue */
  const seatMap = generateSeatsFromLayout(venueDetails.seatingLayout);

  /** 🎟️ Prepare ticket data structure for sessions */
  const buildTickets = (tickets = []) =>
    tickets.map((t) => ({
      type: t.section || t.type || "General",
      price: Number(t.price || 0),
      available: Number(t.capacity ?? t.available ?? 0),
      totalSeats: Number(t.capacity ?? t.available ?? 0),
    }));

  /** 🗓️ Generate all session dates (UTC-based) */
  const startDate = new Date(eventPayload.startDate);
  const endDate = eventPayload.endDate
    ? new Date(eventPayload.endDate)
    : new Date(startDate);

  const recurrence = eventPayload.recurrence;
  const selectedWeekdays = eventPayload.selectedWeekdays || [];

  const dates = [];
  if (recurrence === "single") {
    dates.push(new Date(startDate));
  } else if (recurrence === "multi-day") {
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      dates.push(new Date(d));
    }
  } else if (recurrence === "weekly") {
    const weekdayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const targetDays = selectedWeekdays.map((w) => weekdayMap[w]);
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      if (targetDays.includes(d.getUTCDay())) {
        dates.push(new Date(d));
      }
    }
  }

  if (!dates.length) return [];

  /** 🕒 Calculate release date (2 days before first session) */
  // const firstSessionDate = new Date(dates[0]);
  // const releaseDateBase = new Date(firstSessionDate);
  // releaseDateBase.setUTCDate(firstSessionDate.getUTCDate() - 2);

  const creationDate = new Date(); // today's date or event creation timestamp
  const firstSessionDate = new Date(dates[0]);

  // Ideal release = 20 days before
  const idealFirstRelease = new Date(firstSessionDate);
  idealFirstRelease.setUTCDate(idealFirstRelease.getUTCDate() - 20);

  // Final release date base = max(today, ideal release)
  const releaseDateBase =
    idealFirstRelease > creationDate ? idealFirstRelease : creationDate;

  /** 🧾 Construct session objects */
  const sessions = dates.map((date, idx) => {
    const releaseDate = new Date(releaseDateBase);
    releaseDate.setUTCDate(releaseDate.getUTCDate() + Math.floor(idx / 7) * 7);
    releaseDate.setUTCHours(0, 0, 0, 0);

    return {
      date,
      startTime: eventPayload.startTime, // string "HH:mm"
      endTime: eventPayload.endTime,
      releaseDate,
      event: eventId,
      tickets: buildTickets(eventPayload.tickets),
      seats: seatMap,
      occupancy: 0,
    };
  });

  /** 💾 Insert sessions into DB */
  await Session.insertMany(sessions);

  return sessions;
}

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      recurrence,
      startDate,
      endDate,
      startTime,
      endTime,
      languages,
      ageLimit,
      selectedWeekdays = [],
      location,
      category,
      thumbnailImage = "",
      bannerImage = "",
      tickets = [],
      venue, // expect venue id
    } = req.body;

    // Basic validation
    if (
      !title ||
      !description ||
      !recurrence ||
      !startDate ||
      !startTime ||
      !endTime ||
      !location ||
      !category ||
      !languages ||
      languages.length === 0 ||
      !ageLimit ||
      !tickets ||
      !Array.isArray(tickets) ||
      tickets.length === 0 ||
      !venue
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if ((recurrence === "multi-day" || recurrence === "weekly") && !endDate) {
      return res.status(400).json({
        success: false,
        message: "endDate is required for multi-day or weekly events",
      });
    }

    if (
      recurrence === "weekly" &&
      (!selectedWeekdays || selectedWeekdays.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "selectedWeekdays is required for weekly recurrence",
      });
    }

    if (
      (recurrence === "weekly" || recurrence === "multi-day") &&
      new Date(startDate) > new Date(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    // Time validation (HH:mm)
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (sh > eh || (sh === eh && sm >= em)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Authorization
    const userRole = req.user.role;
    if (userRole !== "organizer") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // fetch venue details (required to create seat maps)
    const venueDetails = await Venue.findById(venue).lean();
    if (!venueDetails) {
      return res.status(400).json({ success: false, message: "Invalid venue" });
    }
    if (
      !venueDetails.seatingLayout ||
      venueDetails.seatingLayout.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected venue has no seating layout defined",
      });
    }

    // Compute startingPrice from tickets (min price)
    const numericPrices = tickets
      .map((t) => Number(t.price || 0))
      .filter((p) => !isNaN(p));
    const startingPrice = numericPrices.length ? Math.min(...numericPrices) : 0;

    // Create Event

    const organizerDoc = await Organizer.findOne({ user: req.user._id });
    if (!organizerDoc) {
      return res.status(404).json({
        success: false,
        message: "Organizer profile not found for this user",
      });
    }

    const newEvent = new Event({
      title,
      description,
      recurrence,
      startDate,
      endDate: endDate || undefined,
      startTime,
      endTime,
      selectedWeekdays,
      ageLimit,
      languages,
      location,
      category,
      bannerImage,
      thumbnailImage,
      organizer: organizerDoc._id,
      venue, // store venue id
      startingPrice,
    });

    await newEvent.save();

    // add event reference to organizer (if Organizer model exists)
    try {
      await Organizer.findOneAndUpdate(
        { user: req.user._id },
        { $push: { eventsHosted: newEvent._id } },
        { new: true }
      );
    } catch (e) {
      // non-fatal; log and continue
      console.warn("Unable to update organizer.eventsHosted:", e.message);
    }

    // Create sessions with seats & tickets
    const createdSessions = await createSessionsForEvent({
      eventId: newEvent._id,
      eventPayload: {
        startDate,
        endDate,
        startTime,
        endTime,
        recurrence,
        selectedWeekdays,
        tickets,
      },
      venueDetails,
    });

    return res.status(201).json({
      success: true,
      message: "Event & sessions created successfully",
      data: {
        event: newEvent,
        sessionsCreated: createdSessions.length,
      },
    });
  } catch (err) {
    console.error("Error in createEvent:", err);
    return res.status(500).json({
      success: false,
      message: "Error creating event",
      error: err.message,
    });
  }
};

const getFilteredEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      recurrence,
      age,
      minRating,
      language,
      startDate,
      endDate,
      startTime,
      endTime,
      page,
      limit,
      isFeatured,
      location,
    } = req.query;
    let query = {};
    // query.$or = [
    //   { title: { $regex: search, $options: "i" } },
    //   { description: { $regex: search, $options: "i" } },
    // ];
    // let skip = (page - 1) * limit;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      const categories = category.split(",");
      query.category = { $in: categories };
    }
    if (recurrence) {
      query.recurrence = recurrence;
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.$or = [
        { startDate: { $gte: start, $lte: end } }, // event starts in range
        { endDate: { $gte: start, $lte: end } }, // event ends in range
      ];
    }

    if (startTime && endTime) {
      query.$and = [
        { startTime: { $lte: endTime } }, // event starts before filter ends
        { endTime: { $gte: startTime } }, // event ends after filter starts
      ];
    }
    const statusArray = ["upcoming", "ongoing"];

    query.status = { $in: statusArray };

    if (age) {
      query.ageLimit = { $gte: Number(age) };
    }
    if (language) {
      const languages = language.split(",");
      query.languages = { $in: languages };
    }
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    if (isFeatured) {
      query.isFeatured = isFeatured === "true"; // Convert to boolean
    }

    if (location) {
      if (req.userLocation.lat && req.userLocation.lng) {
        const lat = parseFloat(req.userLocation.lat);
        const lng = parseFloat(req.userLocation.lng);

        // Increase radius temporarily for testing (e.g., 50km)
        const radius = 20 / 6378.1; // in radians

        query.location = {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius],
          },
        };
      }
    }

    let eventsQuery = Event.find(query);
    let totalItems = await Event.countDocuments(query);
    let totalPages = 1; // default

    if (page && limit) {
      const skip = (page - 1) * limit;
      totalPages = Math.ceil(totalItems / limit);

      eventsQuery = eventsQuery.skip(skip).limit(limit);
    }

    const events = await eventsQuery.lean().populate({
      path: "ratings.user",
      select: "username userProfileImage", // send only required fields
    });

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
      totalItems: totalItems,
      totalPages: totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: err.message,
    });
  }
};

const getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.user?._id;
    const statusArray = ["upcoming", "ongoing"];
    let query = { status: { $in: statusArray } };
    let recommendedEvents = [];
    if (userId) {
      const user = await userModel.findById(userId).lean();

      // Example: user has interacted eventIds
      const interactedEventIds = user?.interestedEvents || []; // [eventId1, eventId2]

      if (interactedEventIds.length) {
        // Step 1: Get categories and organizers from those events
        const pastEvents = await Event.find({
          _id: { $in: interactedEventIds },
        })
          .select("category organizer")
          .lean();

        const categories = [...new Set(pastEvents.map((e) => e.category))];
        const organizers = [
          ...new Set(pastEvents.map((e) => e.organizer.toString())),
        ];

        // Step 2: Recommend based on categories/organizers
        recommendedEvents = await Event.find({
          _id: { $nin: interactedEventIds }, // exclude already interacted
          status: { $in: statusArray },
          $or: [
            { category: { $in: categories } },
            { organizer: { $in: organizers } },
          ],
        })
          .sort({ interestedUsers: -1 })
          .limit(10)
          .lean()
          .populate({
            path: "ratings.user",
            select: "username userProfileImage", // send only required fields
          });
      }
    }
    return res.json({
      success: true,
      data: recommendedEvents,
    });
  } catch (err) {
    console.error("Error in getRecommendedEvents:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTrendingEvents = async (req, res) => {
  try {
    const statusArray = ["upcoming", "ongoing"];

    const trendingEvents = await Event.aggregate([
      { $match: { status: { $in: statusArray } } },

      // ⭐ FAST lookup for sessions (only needed field)
      {
        $lookup: {
          from: "sessions",
          let: { eventId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$event", "$$eventId"] } } },
            { $project: { occupancy: 1 } },
          ],
          as: "sessions",
        },
      },

      // ⭐ Compute totals efficiently
      {
        $addFields: {
          sessionCount: { $size: "$sessions" },
          totalTicketsSold: {
            $reduce: {
              input: "$sessions",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.occupancy"] },
            },
          },
        },
      },

      // ⭐ Compute avgTicketsSold + trendingScore (same logic)
      {
        $addFields: {
          avgTicketsSold: {
            $cond: [
              { $gt: ["$sessionCount", 0] },
              { $divide: ["$totalTicketsSold", "$sessionCount"] },
              0,
            ],
          },
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$averageRating", 0] }, 10] },
              { $ifNull: ["$interestedUsers", 0] },
              { $multiply: [{ $ifNull: ["$avgTicketsSold", 0] }, 2] },
              { $ifNull: ["$totalTicketsSold", 0] },
            ],
          },
        },
      },

      // ⭐ Efficient lookup for rating users
      {
        $lookup: {
          from: "users",
          localField: "ratings.user",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, userProfileImage: 1 } }],
          as: "usersPopulated",
        },
      },

      // ⭐ Keep exact same output for ratings (same mapping, optimized)
      {
        $addFields: {
          ratings: {
            $map: {
              input: "$ratings",
              as: "r",
              in: {
                _id: "$$r._id",
                rating: "$$r.rating",
                review: "$$r.review",
                createdAt: "$$r.createdAt",
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$usersPopulated",
                        as: "u",
                        cond: { $eq: ["$$u._id", "$$r.user"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },

      { $sort: { trendingScore: -1 } },
      { $limit: 10 },
    ]);

    return res.json({ success: true, data: trendingEvents });
  } catch (err) {
    console.error("Error in getTrendingEvents:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPopularEvents = async (req, res) => {
  try {
    const statusArray = ["upcoming", "ongoing"];
    const query = {
      status: { $in: statusArray },
    };

    // ⭐ GEO FILTER — optimized
    if (req.userLocation?.lat && req.userLocation?.lng) {
      const lat = parseFloat(req.userLocation.lat);
      const lng = parseFloat(req.userLocation.lng);

      // Use $nearSphere → FASTER than $geoWithin for sorted results
      query.location = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 20000, // 20km (same as your original radius)
        },
      };
    }

    const popularEvents = await Event.find(query)
      .sort({
        interestedUsers: -1,
        averageRating: -1,
      })
      .limit(10)
      .populate({
        path: "ratings.user",
        select: "username userProfileImage",
      })
      .lean({ virtuals: true }); // ⭐ lean() improved, faster + keeps virtuals

    return res.json({
      success: true,
      data: popularEvents,
    });
  } catch (err) {
    console.error("Error in getPopularEvents:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getSimilarEvents = async (req, res) => {
  try {
    const { id } = req.params;

    const statusArray = ["upcoming", "ongoing"];

    // 1. Get base event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const lat = parseFloat(event.location.coordinates[1]);
    const lng = parseFloat(event.location.coordinates[0]);
    const radius = 20 / 6378.1;

    // 2. Query similar events
    let similarEvents = await Event.find({
      _id: { $ne: event._id }, // exclude current event
      status: { $in: statusArray },
      $or: [{ category: event.category }, { organizer: event.organizer }],
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius], // location constraint
        },
      },
    })
      .limit(10)
      .sort({ interestedUsers: -1, averageRating: -1 })
      .populate({
        path: "ratings.user",
        select: "username userProfileImage", // send only required fields
      });

    if (similarEvents.length < 10) {
      const remaining = 10 - similarEvents.length;

      const locationEvents = await Event.find({
        _id: { $nin: [event._id, ...similarEvents.map((e) => e._id)] }, // avoid duplicates
        status: { $in: statusArray },
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius],
          },
        },
      })
        .sort({ interestedUsers: -1, averageRating: -1 }) // popularity-based
        .limit(remaining)
        .populate({
          path: "ratings.user",
          select: "username userProfileImage", // send only required fields
        });

      // Step 3: Merge results
      similarEvents = [...similarEvents, ...locationEvents];
    }

    // 3. Response
    res.json(similarEvents);
  } catch (error) {
    console.error("Error fetching similar events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id).populate({
      path: "ratings.user",
      select: "username userProfileImage", // send only required fields
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: err.message,
    });
  }
};

const getEventsByUserInterests = async (req, res) => {
  const { page = 1, limit = 8, status } = req.query; // default values
  const skip = (page - 1) * limit;

  try {
    const userId = req.user._id;
    const totalCount = await userModel
      .findById(userId)
      .populate({
        path: "interestedEvents",
        match: status ? { status } : {}, // ✅ apply status filter
        select: "_id",
      })
      .lean();
    const totalItems = totalCount.interestedEvents.length;
    const totalPages = Math.ceil(totalItems / limit);
    const user = await userModel.findById(userId).populate({
      path: "interestedEvents",
      match: status ? { status } : {},
      options: {
        skip: parseInt(skip),
        limit: parseInt(limit),
      },
      populate: {
        path: "ratings.user",
        select: "username userProfileImage",
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const events = user.interestedEvents;
    res
      .status(200)
      .json({ success: true, data: events, totalPages, totalItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching user's interested events",
      error: err.message,
    });
  }
};

const getSessionsByEventId = async (req, res) => {
  const { id } = req.params;
  const now = new Date();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const sessions = await Session.find({
      event: id,
      releaseDate: { $lte: now },
      date: { $gte: startOfDay },
    })
      .select("date startTime endTime occupancy")
      .sort({ date: 1, startTime: 1 })
      .lean();

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "sessions not found",
      });
    }

    // Convert current time → minutes
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const filteredSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);

      // Check if the session is today
      const isToday =
        sessionDate.getFullYear() === now.getFullYear() &&
        sessionDate.getMonth() === now.getMonth() &&
        sessionDate.getDate() === now.getDate();

      if (!isToday) {
        // Future dates are valid
        return true;
      }

      // Convert "HH:MM" startTime → minutes
      const [h, m] = session.startTime.split(":").map(Number);
      const sessionStartMinutes = h * 60 + m;

      // keep only sessions that have not started yet
      return sessionStartMinutes >= nowMinutes;
    });

    if (filteredSessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no upcoming sessions for today",
      });
    }

    res.status(200).json({
      success: true,
      message: "sessions fetched successfully",
      data: filteredSessions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "error fetching sessions",
      error: err.message,
    });
  }
};

const getSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "session not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "session fetched successfully",
      data: session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "error fetching session",
      error: err.message,
    });
  }
};

const getSessionsCount = async (req, res) => {
  try {
    const { id } = req.params;

    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activeSession = await Session.findOne({
      event: id,
      releaseDate: { $lte: now },
      date: { $gte: startOfDay },
    }).select("_id");

    res.json({
      success: true,
      sessionsAvailable: !!activeSession,
    });
  } catch (err) {
    console.error("Error checking session availability:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const writeReview = async (req, res) => {
  try {
    const { id } = req.params; // event id
    const userId = req.user._id; // from auth middleware
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure user has booked the event
    const hasBooked = await Booking.findOne({
      user: userId,
      event: id,
    });

    if (!hasBooked) {
      return res.status(403).json({
        success: false,
        message: "You must book this event before writing a review",
      });
    }
    // Prevent duplicate review by same user
    const alreadyReviewed = event.ratings.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this event",
      });
    }

    // Add review
    event.ratings.push({
      user: userId,
      rating,
      review,
      createdAt: new Date(),
    });

    // Recalculate average rating
    const avg =
      event.ratings.reduce((acc, r) => acc + r.rating, 0) /
      event.ratings.length;

    event.averageRating = Number(avg.toFixed(1));

    await event.save();

    // 6. UPDATE ORGANIZER RATING (Optimized)
    const organizerId = event.organizer;

    const organizer = await Organizer.findById(organizerId).select(
      "averageRating totalReviews"
    );

    if (organizer) {
      const currentSum = organizer.averageRating * organizer.totalReviews;
      const newSum = currentSum + rating;

      const newTotalReviews = organizer.totalReviews + 1;
      const newAverage = newSum / newTotalReviews;

      organizer.totalReviews = newTotalReviews;
      organizer.averageRating = Number(newAverage.toFixed(1));

      await organizer.save();
    }

    // Return updated event with populated user
    const updatedEvent = await Event.findById(id).populate(
      "ratings.user",
      "username userProfileImage"
    );

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting review",
      error: error.message,
    });
  }
};

const updateEventName = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "event not found",
      });
    }
    event.title = title || event.title;
    await event.save();
    res.status(200).json({
      success: true,
      message: "event title updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "error occured",
    });
  }
};

const updateEventImage = async (req, res) => {
  const { id } = req.params;
  const { url, type } = req.body;

  if (!url || !type) {
    return res.status(400).json({
      success: false,
      message: "Both 'url' and 'type' are required",
    });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (type === "banner") {
      event.bannerImage = url;
    } else if (type === "thumbnail") {
      event.thumbnailImage = url;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid image type. Use 'banner' or 'thumbnail'.",
      });
    }

    await event.save();

    return res.status(200).json({
      success: true,
      message: `${type} image updated successfully`,
      data: event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating event image",
      error: err.message,
    });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    recurrence,
    startDate,
    endDate,
    startTime,
    endTime,
    selectedWeekdays,
    ageLimit,
    languages,
    location,
    category,
    bannerImage,
    tickets,
  } = req.body;
  try {
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (sh > eh || (sh === eh && sm >= em)) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
    }
    if (recurrence === "weekly" && selectedWeekdays.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Weekdays are required for weekly recurrence",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    if (
      recurrence ||
      startDate ||
      endDate ||
      startTime ||
      endTime ||
      selectedWeekdays ||
      tickets
    ) {
      event.sessions = generateSessions(
        startDate || event.startDate,
        endDate || event.endDate,
        startTime || event.startTime,
        endTime || event.endTime,
        recurrence || event.recurrence,
        selectedWeekdays || event.selectedWeekdays,
        tickets
      );
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.recurrence = recurrence || event.recurrence;
    event.selectedWeekdays = selectedWeekdays || event.selectedWeekdays;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.languages = languages || event.languages;
    event.ageLimit = ageLimit || event.ageLimit;
    event.location = location || event.location;
    event.category = category || event.category;
    event.bannerImage = bannerImage || event.bannerImage;
    event.thumbnailImage = thumbnailImage || event.thumbnailImage;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: err.message,
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: err.message,
    });
  }
};

const getEventsByOrganizerId = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, rating, page = 1, limit = 10 } = req.query; // default values

    let sortObj = {};

    if (date) {
      sortObj.startDate = parseInt(date); // 1 → asc, -1 → desc
    }
    if (rating) {
      sortObj.averageRating = parseInt(rating);
    }

    // convert page/limit to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // query with sort + pagination
    let events = await Event.find({ organizer: id })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: "ratings.user",
        select: "username userProfileImage",
      })
      .lean();

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No events found" });
    }

    // attach starting price
    const eventsWithPrice = await Promise.all(
      events.map(async (event) => {
        const sessions = await Session.find({ event: event._id }).lean();
        const allTicketPrices = sessions.flatMap((s) =>
          s.tickets.map((t) => t.price)
        );
        const startingPrice =
          allTicketPrices.length > 0 ? Math.min(...allTicketPrices) : 0;
        return { ...event, startingPrice };
      })
    );

    // total count for frontend pagination
    const totalCount = await Event.countDocuments({ organizer: id });

    res.status(200).json({
      success: true,
      data: eventsWithPrice,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getCategories = async (req, res) => {
  const categories = Event.schema.path("category").enumValues;
  res.status(200).json({ success: true, categories });
};

const getTicketTypes = async (req, res) => {
  res.status(200).json({ success: true, ticketTypes });
};

module.exports = {
  createEvent,
  getFilteredEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getCategories,
  getTicketTypes,
  getSessionById,
  getSessionsByEventId,
  getEventsByOrganizerId,
  getEventsByUserInterests,
  getSimilarEvents,
  getPopularEvents,
  getRecommendedEvents,
  getTrendingEvents,
  getSessionsCount,
  updateEventName,
  // updateBannerImage,
  // updateThumbnailImage,
  updateEventImage,
  writeReview,
};
