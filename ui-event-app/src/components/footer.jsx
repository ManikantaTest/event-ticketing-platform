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
        <Container disableGutters>
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
                <Facebook />
                <Twitter />
                <Instagram />
              </Box>
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography variant="h6" fontWeight={800} mb={1}>
                For Attendees
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Button color="inherit">Browse Events</Button>
                <Button color="inherit">My Tickets</Button>
                <Button color="inherit">Gift Cards</Button>
                <Button color="inherit">Mobile App</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography variant="h6" fontWeight={800} mb={1}>
                For Organizers
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Button color="inherit">Create Events</Button>
                <Button color="inherit">Pricing</Button>
                <Button color="inherit">Resources</Button>
                <Button color="inherit">Support</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography variant="h6" fontWeight={800} mb={1}>
                Help
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Button color="inherit">Contact Us</Button>
                <Button color="inherit">FAQs</Button>
                <Button color="inherit">Terms of Service</Button>
                <Button color="inherit">Privacy Policy</Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: "1px solid #333",
              pt: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="rgba(255,255,255,0.6)" variant="body2">
              © 2023 EventTix. All rights reserved.
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                defaultValue="en"
                sx={{ color: "rgba(255,255,255,0.7)", bgcolor: "#222" }}
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
