import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Box,
  Card,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const ReviewStep = ({ eventData }) => {
  if (!eventData) return null;

  const {
    title,
    category,
    recurrence,
    startDate,
    startTime,
    location,
    ageLimit,
    languages,
    description,
    tickets,
    bannerImage,
    thumbnailImage,
  } = eventData;

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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 6,
        px: 2,
        background: "linear-gradient(135deg, #eef2f3 0%, #ffffff 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Banner */}
        {bannerImage && (
          <Box
            sx={{
              height: 320,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={bannerImage}
              alt="Event Banner"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
              }}
            />
          </Box>
        )}

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1e293b",
              textAlign: "center",
              mb: 1,
            }}
          >
            {title || "Untitled Event"}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "center",
              color: "#64748b",
              mb: 4,
              fontWeight: 500,
            }}
          >
            {category || "Uncategorized"}
          </Typography>

          {/* Event Details Grid */}
          <Grid
            container
            spacing={2}
            sx={{
              mb: 4,
              background: "#f8fafc",
              borderRadius: 3,
              px: 3,
              py: 2,
              border: "1px solid #e2e8f0",
            }}
          >
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarMonthIcon sx={{ color: "#0ea5e9" }} />
                <Typography fontWeight={600}>
                  {startDate ? formatPrettyDate(startDate) : "Date TBD"}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccessTimeIcon sx={{ color: "#0ea5e9" }} />
                <Typography fontWeight={600}>
                  {startTime || "Time TBD"}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LocationOnIcon sx={{ color: "#0ea5e9" }} />
                <Typography fontWeight={600}>
                  {location?.label || "Venue TBD"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* Description */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1.5, fontWeight: 700, color: "#1e293b" }}
            >
              About This Event
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#475569", lineHeight: 1.8 }}
            >
              {description || "No description provided yet."}
            </Typography>
          </Box>

          {/* Badges Section */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                Recurrence
              </Typography>
              <Chip label={recurrence} color="primary" variant="outlined" />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                Age Limit
              </Typography>
              <Chip label={ageLimit || "All Ages"} color="secondary" />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                Languages
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {languages?.length
                  ? languages.map((lang, i) => (
                      <Chip
                        key={i}
                        label={lang}
                        variant="outlined"
                        color="success"
                        size="small"
                      />
                    ))
                  : "—"}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 5 }} />

          {/* Ticket Pricing */}
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 700, color: "#1e293b" }}
          >
            Ticket Pricing
          </Typography>

          {tickets?.length ? (
            <Grid container spacing={3}>
              {tickets.map((t, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      textAlign: "center",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <ConfirmationNumberIcon
                      sx={{ color: "#6366f1", mb: 1 }}
                      fontSize="large"
                    />
                    <Typography variant="h6" fontWeight={700}>
                      {t.section || "Section"}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, mt: 1, color: "#2563eb" }}
                    >
                      ₹{t.price}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "#64748b" }}
                    >
                      Capacity: {t.capacity}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tickets available yet.
            </Typography>
          )}

          <Divider sx={{ my: 5 }} />

          {/* Thumbnail Preview */}
          {thumbnailImage && (
            <Box
              sx={{
                textAlign: "center",
                backgroundColor: "#f1f5f9",
                borderRadius: 3,
                py: 4,
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Event Card Preview
              </Typography>

              <Card
                sx={{
                  width: 340,
                  mx: "auto",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              >
                <CardMedia
                  component="img"
                  image={thumbnailImage}
                  height="200"
                  sx={{ objectFit: "cover" }}
                />

                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {location?.label || "Venue TBD"}
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReviewStep;
