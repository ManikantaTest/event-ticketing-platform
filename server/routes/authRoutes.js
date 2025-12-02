const express = require("express");
const {
  registerUser,
  loginUser,
  registerOrganizer,
  oauthLogin,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/register-organizer", verifyToken, registerOrganizer);
router.post("/login", loginUser);
router.post("/oauth-login", oauthLogin);

module.exports = router;
