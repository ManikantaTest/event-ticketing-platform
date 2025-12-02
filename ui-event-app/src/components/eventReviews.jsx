import {
  Box,
  Typography,
  Avatar,
  Rating,
  Link,
  Stack,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

// Demo data
const reviews = [
  {
    avatar: "/avatars/sarah.jpg", // Use your own avatar path or leave blank for a generated color/avatar
    name: "Sarah Johnson",
    time: "2 months ago",
    rating: 5,
    text: "TechEvents Pro organized our company's annual conference and exceeded all expectations. The attention to detail and professional service was outstanding. Would definitely work with them again!",
  },
  {
    avatar: "/avatars/michael.jpg",
    name: "Michael Chen",
    time: "3 months ago",
    rating: 4,
    text: "Great experience attending their DevCon event. Very well organized with excellent speakers and networking opportunities. The only improvement could be better food options.",
  },
];
const totalReviews = 253;

export default function ReviewsCard({
  title = "Reviews",
  reviewsData = reviews,
  reviewTotal = totalReviews,
}) {
  return (
    <Paper sx={{ borderRadius: 3, mb: 4, p: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <StarIcon sx={{ color: "#111", fontSize: 28 }} />
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Box>

      {/* Reviews */}
      <Stack spacing={3} mb={2}>
        {reviewsData.map((review, idx) => (
          <Box display="flex" key={idx}>
            <Avatar
              src={review.avatar}
              alt={review.name}
              sx={{ mr: 2, width: 48, height: 48 }}
            />
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight={700}>{review.name}</Typography>
                <Typography color="text.secondary" fontSize={14}>
                  {review.time}
                </Typography>
              </Box>
              <Rating
                value={review.rating}
                readOnly
                precision={1}
                size="small"
                sx={{
                  mb: 0.5,
                  mt: 0.5,
                  color: "#FFC107",
                  "& .MuiRating-iconEmpty": { color: "#ffc10780" },
                }}
              />
              <Typography color="text.secondary" fontSize={16}>
                {review.text}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Footer */}
      <Box mt={1}>
        <Link
          href="#"
          underline="hover"
          fontWeight={700}
          fontSize={15}
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          View all {reviewTotal} reviews
          <StarIcon
            sx={{
              ml: 0.5,
              fontSize: 18,
              transform: "rotate(-45deg)",
              color: "inherit",
            }}
          />
        </Link>
      </Box>
    </Paper>
  );
}
