import { Facebook, Instagram, Twitter } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
const Footer = () => {
  return (
    <Box>
      <Box sx={{ bgcolor: "#111", color: "#fff", pt: 6, pb: 3 }}>
        <Container disableGutters sx={{ px: { xs: 3, sm: 4, md: 4, lg: 0 } }}>
          <Grid container spacing={4} mb={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" fontWeight={800} mb={1}>
                RezErvo
              </Typography>
              <Typography color="rgba(255,255,255,0.6)" mb={2}>
                The easiest way to discover and book tickets to the best events
                in your area and online.
              </Typography>

              <Box display="flex" gap={2}>
                <Facebook sx={{ cursor: "pointer" }} />
                <Twitter sx={{ cursor: "pointer" }} />
                <Instagram sx={{ cursor: "pointer" }} />
              </Box>
            </Grid>

            {/* Group the 3 SECTIONS TOGETHER INTO ONE BLOCK FOR SMALL SCREENS */}
            <Grid
              item
              xs={12}
              md={9}
              sx={{
                pl: { xs: 2, sm: 3, md: 0 }, // LEFT padding on small screens
              }}
            >
              <Grid container spacing={4}>
                {/* For Attendees */}
                <Grid item xs={12} sm={4} md={4}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    mb={1}
                    sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    For Attendees
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={{ xs: 0.3, sm: 0.5 }}
                  >
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Browse Events
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      My Tickets
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Gift Cards
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Mobile App
                    </Button>
                  </Box>
                </Grid>

                {/* For Organizers */}
                <Grid item xs={12} sm={4} md={4}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    mb={1}
                    sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    For Organizers
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={{ xs: 0.3, sm: 0.5 }}
                  >
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Create Events
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Pricing
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Resources
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Support
                    </Button>
                  </Box>
                </Grid>

                {/* Help */}
                <Grid item xs={12} sm={4} md={4}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    mb={1}
                    sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    Help
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={{ xs: 0.3, sm: 0.5 }}
                  >
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Contact Us
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      FAQs
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Terms of Service
                    </Button>
                    <Button
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                      }}
                    >
                      Privacy Policy
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Bottom Row */}
          <Box
            sx={{
              borderTop: "1px solid #333",
              pt: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              px: { xs: 2, sm: 3, md: 0 },
            }}
          >
            <Typography color="rgba(255,255,255,0.6)" variant="body2">
              © {new Date().getFullYear()} EventTix. All rights reserved.
            </Typography>

            <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 160 } }}>
              <Select
                defaultValue="en"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  bgcolor: "#222",
                  height: 36,
                }}
              >
                <MenuItem value="en">English (US)</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
