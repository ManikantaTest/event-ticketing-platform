import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchVenueAvailability,
  fetchVenueInfo,
} from "../../redux/slices/eventSlice";

const TicketDetailsStep = ({
  eventData,
  setEventData,
  handleInputChange,
  errors,
}) => {
  const dispatch = useDispatch();

  const [venues, setVenues] = useState([]);
  const [venueDetails, setVenueDetails] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  // 🔹 Fetch available venues when startDate changes
  useEffect(() => {
    setLoading(true);

    dispatch(
      fetchVenueAvailability({
        startDate: eventData.startDate,
        endDate: eventData.endDate,
      })
    )
      .unwrap()
      .then((venues) => setVenues(venues))
      .catch((err) => console.error("❌ Failed to fetch venues:", err))
      .finally(() => setLoading(false));
  }, [eventData.startDate, eventData.endDate]);

  // 🔹 Restore selected venue when returning to this step
  useEffect(() => {
    if (eventData.venue && venues.length > 0) {
      const matched = venues.find((v) => v._id === eventData.venue);
      if (matched) {
        setSelectedVenue({
          id: matched._id,
          label: `${matched.name}${matched.city ? `, ${matched.city}` : ""}`,
          city: matched.city,
          state: matched.state,
          coordinates: matched.location?.coordinates,
        });
      }
    }
  }, [eventData.venue, venues]);

  // ✅ Ensure venueDetails persists after coming back
  // If tickets already exist, rebuild minimal venueDetails from them
  useEffect(() => {
    if (!venueDetails && eventData.tickets?.length > 0) {
      // reconstruct from tickets to keep UI visible
      setVenueDetails({
        seatingLayout: eventData.tickets.map((t) => ({
          section: t.section,
          sectionCapacity: t.capacity,
          rows: [],
        })),
      });
    }
  }, [venueDetails, eventData.tickets]);

  function formatPrettyDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    // Suffix: 1st, 2nd, 3rd, 4th...
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${day}${suffix} ${month} ${year}`;
  }

  // 🔹 Fetch venue details when user selects new venue
  const handleVenueSelect = async (_, newValue) => {
    setSelectedVenue(newValue);
    if (!newValue) {
      handleInputChange("venue", "");
      handleInputChange("location", {
        type: "Point",
        coordinates: [0, 0],
        label: "",
      });
      setVenueDetails(null);
      setEventData((prev) => ({ ...prev, tickets: [] }));
      return;
    }

    // update venue + location in parent state
    handleInputChange("venue", newValue.id);
    handleInputChange("location", {
      type: "Point",
      coordinates: newValue.coordinates || [0, 0],
      label: newValue.label,
    });
    dispatch(fetchVenueInfo({ id: newValue.id }))
      .unwrap()
      .then((details) => {
        setVenueDetails(details);
        setEventData((prev) => {
          const newTickets = details.seatingLayout.map((layout) => {
            const existingTicket = prev.tickets.find(
              (t) => t.section === layout.section
            );
            return {
              section: layout.section,
              capacity: layout.sectionCapacity,
              price: existingTicket?.price || "",
            };
          });
          return { ...prev, tickets: newTickets };
        });
      })
      .catch((err) => console.error("Venue fetch failed:", err));
  };

  // 🔹 Update ticket price
  const handlePriceChange = (section, price) => {
    setEventData((prev) => {
      const updated = (prev.tickets || []).map((t) =>
        t.section === section ? { ...t, price } : t
      );
      return { ...prev, tickets: updated };
    });
  };

  // 🔹 UI
  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: 4,
        borderRadius: 3,
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
      >
        Select Venue & Configure Tickets
      </Typography>

      {eventData.startDate && (
        <Typography
          variant="body2"
          textAlign="center"
          color="success.main"
          sx={{ mb: 2, fontWeight: 500 }}
        >
          ✅ Showing venues available for{" "}
          {eventData.endDate
            ? `${formatPrettyDate(eventData.startDate)} → ${formatPrettyDate(
                eventData.endDate
              )}`
            : formatPrettyDate(eventData.startDate)}
        </Typography>
      )}

      <Autocomplete
        options={venues.map((v) => ({
          id: v._id,
          label: `${v.name}${v.city ? `, ${v.city}` : ""}`,
          city: v.city,
          state: v.state,
          coordinates: v.location?.coordinates,
        }))}
        getOptionLabel={(opt) => opt.label || ""}
        value={selectedVenue}
        loading={loading}
        onChange={handleVenueSelect}
        isOptionEqualToValue={(opt, val) => opt.id === val?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Venue"
            placeholder="Available venues for selected dates"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{ mb: 5 }}
          />
        )}
      />

      {/* ------------------------------------------------------------ */}
      {/* 🎭 Seating Layout (Inserted below the above Ticket section) */}
      {/* ------------------------------------------------------------ */}

      {venueDetails && (
        <Box
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 3,
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Seating Layout Preview
          </Typography>

          {/* SCREEN */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
            <div
              className="w-2/3 h-6 bg-gray-800 rounded-b-full shadow-inner"
              style={{ backgroundColor: "#0c172f" }}
            />
          </Box>

          {/* SECTIONS */}
          <Box>
            {venueDetails.seatingLayout.map((section, sIdx) => (
              <Box key={sIdx} sx={{ mb: 4 }}>
                <Box
                  onClick={() => setOpenSection(section)}
                  className="h-20 px-10 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition mx-auto shadow-sm w-3/4"
                  style={{ backgroundColor: "#f3f3f5" }}
                >
                  <span className="font-bold">
                    Click to view {section.section} seats
                  </span>
                </Box>
              </Box>
            ))}
          </Box>

          {/* MODAL */}
          {openSection && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => setOpenSection(null)}
            >
              <div
                className="bg-white rounded-2xl w-11/12 md:w-2/3 max-h-[80vh] overflow-hidden shadow-lg p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Screen */}
                <div className="relative flex justify-center mb-12 w-full">
                  <div
                    className="w-full md:w-2/3 h-6 bg-gray-800 rounded-b-full shadow-inner"
                    style={{ backgroundColor: "#0c172f" }}
                  />
                  <span className="absolute -bottom-6 text-sm text-gray-600">
                    SCREEN
                  </span>
                </div>

                {/* Seats */}
                <div className="max-h-[50vh] overflow-y-auto flex flex-col items-center gap-3 pb-1">
                  {openSection.rows.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-medium text-sm">
                        {row.label}
                      </span>

                      <div className="flex gap-2">
                        {row.seats.map((seatId) => {
                          let classes =
                            "w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium transition bg-gray-100 hover:bg-gray-200 text-gray-700";

                          return (
                            <button
                              key={seatId}
                              disabled
                              className={classes}
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Box>
      )}

      {/* 🎟️ Ticket Price Section */}
      {venueDetails ? (
        <Grid container spacing={3} justifyContent="center">
          {venueDetails.seatingLayout.map((section, idx) => {
            const ticket =
              eventData.tickets.find((t) => t.section === section.section) ||
              {};
            return (
              <Grid item xs={12} sm={8} md={6} key={idx}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #E2E8F0",
                    backgroundColor: "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#6366F1",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {section.section}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: "#EEF2FF",
                        color: "#4338CA",
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Capacity: {section.sectionCapacity}
                    </Typography>
                  </Box>

                  <TextField
                    label="Ticket Price (₹)"
                    type="number"
                    fullWidth
                    size="small"
                    value={ticket.price || ""}
                    error={!!errors[`ticket_price_${idx}`]}
                    helperText={errors[`ticket_price_${idx}`] || ""}
                    onChange={(e) =>
                      handlePriceChange(section.section, e.target.value)
                    }
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Please select a venue to configure ticket prices.
        </Typography>
      )}
    </Box>
  );
};

export default TicketDetailsStep;
