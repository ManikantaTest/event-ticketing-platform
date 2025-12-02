const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRouter = require("./routes/eventRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const authRouter = require("./routes/authRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const organizerRouter = require("./routes/organizerRoutes");
const userRouter = require("./routes/userRoutes");
const venueRouter = require("./routes/venueRoutes");
const sessionRouter = require("./routes/sessionRoutes");
const cookieParser = require("cookie-parser");

// Connect to MongoDB
connectDB();

// Load environment variables from .env file

const app = express();
require("./cron/eventStatusCron");

dotenv.config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "http://localhost:4173", // Vite preview (production build)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, mobile apps, etc.

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/events", eventRouter);
app.use("/bookings", bookingRouter);
app.use("/upload", uploadRouter);
app.use("/organizer", organizerRouter);
app.use("/user", userRouter);
app.use("/venue", venueRouter);
app.use("/sessions", sessionRouter);
// Connect to MongoDB

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing
module.exports = app;
