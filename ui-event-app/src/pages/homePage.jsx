import {
  BusinessCenter,
  Celebration,
  Code,
  EmojiEmotions,
  MusicNote,
  Palette,
  School,
  SportsBasketball,
  VolunteerActivism,
} from "@mui/icons-material";
import { Box, Container, Grid, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BannerShow from "../components/bannerShow";
import EventGridShow from "../components/eventGridShow";
import {
  fetchFilteredEvents,
  fetchPopularEvents,
  fetchRecommendedEvents,
  fetchTrendingEvents,
} from "../redux/slices/eventSlice";

import { CheckCircle } from "@mui/icons-material";
import { Button, CardMedia, InputAdornment, TextField } from "@mui/material";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: <MusicNote sx={{ color: "#8e24aa" }} />,
    label: "Music",
    bg: "#f3e5f5",
  },
  {
    icon: <SportsBasketball sx={{ color: "#fb8c00" }} />,
    label: "Sports",
    bg: "#fff3e0",
  },
  {
    icon: <School sx={{ color: "#1e88e5" }} />,
    label: "Workshops",
    bg: "#e3f2fd",
  },
  {
    icon: <BusinessCenter sx={{ color: "#3949ab" }} />,
    label: "Conferences",
    bg: "#e8eaf6",
  },
  {
    icon: <Celebration sx={{ color: "#d81b60" }} />,
    label: "Festivals",
    bg: "#fce4ec",
  },
  {
    icon: <Code sx={{ color: "#43a047" }} />,
    label: "Tech & Innovation",
    bg: "#e8f5e9",
  },
  {
    icon: <VolunteerActivism sx={{ color: "#e53935" }} />,
    label: "Charity",
    bg: "#ffebee",
  },
  {
    icon: <EmojiEmotions sx={{ color: "#fdd835" }} />,
    label: "Comedy",
    bg: "#fffde7",
  },
  {
    icon: <Palette sx={{ color: "#6d4c41" }} />,
    label: "Exhibitions",
    bg: "#efebe9",
  },
];

function CategoryCard({ icon, label, color = "#6366f1", onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 150,
        height: 150,
        background: "white",
        borderRadius: "22px",
        border: "1px solid #ececec",
        boxShadow: "0 6px 22px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.4,
        cursor: "pointer",
        transition: "all 0.25s ease",
        textAlign: "center",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
        },
      }}
    >
      {/* Perfectly centered pastel circle */}
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `${color}1A`, // even softer pastel
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon perfectly centered */}
        <Box
          sx={{
            fontSize: 30,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 0, // ensures exact icon centering
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Label */}
      <Typography
        fontWeight={600}
        fontSize={15}
        sx={{
          color: "#2c2c2c",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          px: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const locationLabel = useSelector(
    (state) => state.location.location
  )?.label.split(", ")[0];
  const { filteredEvents } = useSelector((state) => state.event);

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  useEffect(() => {
    dispatch(fetchTrendingEvents()).unwrap();
    dispatch(fetchRecommendedEvents()).unwrap();
  }, [dispatch]);

  useEffect(() => {
    if (!locationLabel) return;
    dispatch(fetchPopularEvents()).unwrap();
    dispatch(
      fetchFilteredEvents({
        params: {
          isFeatured: true,
          location: true,
          page: 1,
          limit: 10,
        },
        key: "featured",
      })
    ).unwrap();
  }, [dispatch, locationLabel]);

  const handleCategory = (label) => {
    // navigate("/search", { state: label });
    navigate(`/category/${encodeURIComponent(label)}`);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Box sx={{ bgcolor: "#f7f7f7" }}>
            {/* Header */}

            {/* Banner Slideshow (static) */}
            {filteredEvents?.featured?.data?.length > 0 && (
              <Box>
                <BannerShow />
              </Box>
            )}

            {/* Categories */}
            <Box pt={6} pb={8} bgcolor="#fff">
              <Container>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  textAlign="center"
                  mb={4}
                >
                  Explore Events by Category
                </Typography>
                <Grid container justifyContent="center" spacing={3}>
                  {categories.map((c) => (
                    <Grid item xs={6} md={4} lg={2} key={c.label}>
                      <CategoryCard
                        {...c}
                        onClick={() => handleCategory(c.label)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>

            {/* Popular Events */}
            {filteredEvents?.popular && filteredEvents.popular.length > 0 && (
              <Box pb={8} sx={{ bgcolor: "#fff" }}>
                <Container
                  disableGutters
                  maxWidth={false}
                  sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12 } }}
                >
                  <EventGridShow
                    title={`Popular in ${locationLabel}`}
                    events={filteredEvents.popular}
                  />
                </Container>
              </Box>
            )}
            {/* Online Events */}
            {filteredEvents?.trending && filteredEvents.trending.length > 0 && (
              <Box pb={8} sx={{ bgcolor: "#fff" }}>
                <Container
                  disableGutters
                  maxWidth={false}
                  sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12 } }}
                >
                  <EventGridShow
                    title="Trending events online"
                    events={filteredEvents.trending}
                  />
                </Container>
              </Box>
            )}
            {filteredEvents?.recommended &&
              filteredEvents.recommended.length > 0 && (
                <Box pb={8} sx={{ bgcolor: "#fff" }}>
                  <Container
                    disableGutters
                    maxWidth={false}
                    sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12 } }}
                  >
                    <EventGridShow
                      title="Events based on your interests"
                      events={filteredEvents.recommended}
                    />
                  </Container>
                </Box>
              )}
            {role === "user" && (
              <Box py={6} sx={{ bgcolor: "#f3f1ff" }}>
                <Container>
                  <Box
                    mx="auto"
                    sx={{
                      maxWidth: 960,
                      bgcolor: "#fff",
                      borderRadius: "48px",
                      overflow: "hidden",
                      boxShadow: 4,
                      display: "flex", // force side-by-side
                      flexDirection: "row",
                    }}
                  >
                    {/* Registration content */}
                    <Box
                      flex={0.6} // 60% width
                      p={4}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                    >
                      <Typography variant="h5" fontWeight={800} mb={2}>
                        Become an Event Organizer
                      </Typography>
                      <Typography color="text.secondary" mb={3}>
                        Host your own events and reach thousands of attendees.
                        Our platform provides all the tools you need to create,
                        promote and manage successful events.
                      </Typography>
                      <Box
                        display="flex"
                        flexDirection="column"
                        gap={1.5}
                        mb={3}
                      >
                        {[
                          "Easy event creation and management",
                          "Powerful promotional tools",
                          "Secure payment processing",
                        ].map((t) => (
                          <Box
                            key={t}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <CheckCircle sx={{ color: "#6755f2ff" }} />
                            <Typography>{t}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Button
                        component={Link}
                        to="/register/organizer"
                        variant="contained"
                        sx={{
                          bgcolor: "#6755f2ff",
                          "&:hover": { bgcolor: "primary.dark" },
                          alignSelf: "flex-start",
                          borderRadius: 4,
                        }}
                      >
                        Register as Organizer
                      </Button>
                    </Box>

                    {/* Image */}
                    <Box flex={0.4} sx={{ minWidth: 280 }}>
                      <CardMedia
                        component="img"
                        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                        alt="Event organization"
                        sx={{
                          width: "100%",
                          height: "100%",
                          maxHeight: 370, // reduced height
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </Box>
                  </Box>
                </Container>
              </Box>
            )}

            {/* Newsletter */}
            <Box py={6} sx={{ bgcolor: "#f7f7f7" }}>
              <Container sx={{ maxWidth: 640 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  textAlign="center"
                  mb={1}
                >
                  Never Miss an Event
                </Typography>
                <Typography color="text.secondary" textAlign="center" mb={3}>
                  Subscribe to our newsletter and get personalized event
                  recommendations.
                </Typography>
                <Box
                  component="form"
                  display="flex"
                  mx="auto"
                  sx={{ maxWidth: 560 }}
                >
                  <TextField
                    placeholder="Your email address"
                    fullWidth
                    sx={{
                      bgcolor: "#fff",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ p: 0 }}>
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "#6755f2ff",
                              "&:hover": { bgcolor: "primary.dark" },
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              height: "100%",
                            }}
                          >
                            Subscribe
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Container>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
