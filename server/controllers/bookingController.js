const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Session = require("../models/sessionModel");

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { eventId, sessionId, selectedSeats } = req.body;
    const userId = req.user._id; // assuming auth middleware

    // 1. Validate Event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // 2. Validate Session
    const session = await Session.findOne({ _id: sessionId, event: eventId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // 3. Check seats availability
    for (let seat of selectedSeats) {
      const seatDoc = session.seats.find(
        (s) => s.seatId === seat.seatId && s.section === seat.section
      );

      if (!seatDoc) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatId} not found in this session`,
        });
      }

      if (seatDoc.status === "booked") {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatId} is already booked`,
        });
      }
    }

    // 4. Update seats + tickets availability
    selectedSeats.forEach((seat) => {
      const seatDoc = session.seats.find(
        (s) => s.seatId === seat.seatId && s.section === seat.section
      );

      seatDoc.status = "booked";
      seatDoc.user = userId;

      // decrement ticket availability in the correct section
      const ticketDoc = session.tickets.find((t) => t.type === seat.section);
      if (ticketDoc && ticketDoc.available > 0) {
        ticketDoc.available -= 1;
      }
    });

    session.occupancy += selectedSeats.length;

    const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    // 5. Create booking record
    const booking = new Booking({
      user: userId,
      event: eventId,
      session: sessionId,
      ticketsSummary: selectedSeats.reduce((acc, seat) => {
        let existing = acc.find((t) => t.type === seat.section);
        if (existing) {
          existing.quantity += 1;
          existing.totalPrice += seat.price;
        } else {
          acc.push({ type: seat.section, quantity: 1, totalPrice: seat.price });
        }
        return acc;
      }, []),
      seats: selectedSeats.map((s) => ({
        seatId: s.seatId,
        section: s.section,
        price: s.price,
      })),
      totalAmount,
      status: "confirmed",
    });

    // 6. Save changes
    await Promise.all([session.save(), booking.save()]);

    return res.status(201).json({
      success: true,
      message: "Booking successful",
      booking,
    });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get bookings for logged-in user
const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title date location thumbnailImage")
      .populate("user", "username email")
      .populate("session", "date startTime endTime");

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: err.message,
    });
  }
};

const isUserBookedEvent = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      user: req.user._id,
      event: req.params.eventId,
    });
    return res.status(200).json({
      success: true,
      message: "Booking status fetched successfully",
      data: !!booking,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error checking booking status",
      error: err.message,
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  const bookingId = req.params.id;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required",
    });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    // Restore tickets to event
    const event = await Event.findById(booking.event._id);
    booking.tickets.forEach((t) => {
      const eventTicket = event.tickets.find((et) => et.type === t.type);
      if (eventTicket) {
        eventTicket.available += t.quantity;
      }
    });
    await event.save();

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: err.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const bookingId = req.params.id;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required",
    });
  }

  try {
    const booking = await Booking.findById(bookingId)
      .populate("event", "title date location")
      .populate("user", "username email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: err.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookingsByUser,
  cancelBooking,
  getBookingById,
  isUserBookedEvent,
};
