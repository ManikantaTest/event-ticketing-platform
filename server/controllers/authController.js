const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Organizer = require("../models/organizerModel");
const { default: admin } = require("../config/firebaseAdmin");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required",
    });
  }

  const user = await User.findOne({ email });
  const organizer = await Organizer.findOne({ email });

  if (user || organizer) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: "user", // default role
  });

  try {
    await newUser.save();

    // 🔹 Generate JWT token (same as login)
    const token = jwt.sign(
      { userId: newUser._id, userRole: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
      userRole: newUser.role,
      interestedEvents: newUser.interestedEvents || [],
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: err.message,
    });
  }
};

const registerOrganizer = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { orgName, orgEmail, orgDescription, phone } = req.body;
    if (!orgName || !orgEmail) {
      return res.status(400).json({
        success: false,
        message: "Organization Name and Email are required",
      });
    }
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If already organizer
    const existingOrganizer = await Organizer.findOne({ user: userId });
    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: "User is already registered as an organizer",
      });
    }
    // Create new organizer linked to user
    const newOrganizer = new Organizer({
      user: userId,
      orgName,
      orgEmail,
      phone,
      orgDescription,
    });

    await newOrganizer.save();
    // Update user role
    user.role = "organizer";
    await user.save();
    res.status(201).json({
      success: true,
      message: "Organizer registered successfully",
      organizer: newOrganizer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registering organizer",
      error: err.message,
    });
  }
};

const authenticate = async (doc, password) => {
  const isPasswordValid = await bcrypt.compare(password, doc.password);
  if (!isPasswordValid) return null;
  const token = jwt.sign(
    { userId: doc._id, userRole: doc.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return {
    userId: doc._id,
    userRole: doc.role,
    userInterests: doc.interestedEvents,
    token,
  };
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  const [user, organizer] = await Promise.all([
    User.findOne({ email }),
    Organizer.findOne({ email }),
  ]);
  if (!user && !organizer) {
    return res.status(404).json({ success: false, message: "Email not found" });
  }

  if (user) {
    const auth = await authenticate(user, password);
    if (!auth)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    return res
      .status(200)
      .json({ success: true, message: "Login successful", ...auth });
  }

  if (organizer) {
    const auth = await authenticate(organizer, password);
    if (!auth)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    return res
      .status(200)
      .json({ success: true, message: "Login successful", ...auth });
  }
};

const oauthLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth token",
      });
    }

    const firebaseToken = googleToken;

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(firebaseToken);
    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth Token",
      });
    }

    const email = decoded.email;
    const username = decoded.name || email.split("@")[0];

    let user = await User.findOne({ email });

    let organizer = await Organizer.findOne({ orgEmail: email }).populate(
      "user"
    );

    // If user does NOT exist → create new user
    if (!user && !organizer) {
      user = await User.create({
        email,
        username,
        role: "user",
        isOAuth: true,
      });
    }

    // Organizer Login Case
    if (organizer) {
      const jwtToken = jwt.sign(
        {
          userId: organizer.user._id,
          userRole: "organizer",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        message: "Login successful",
        userId: organizer.user._id,
        userRole: "organizer",
        userInterests: organizer.user.interestedEvents || [],
        token: jwtToken,
      });
    }

    const jwtToken = jwt.sign(
      {
        userId: user._id,
        userRole: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      userId: user._id,
      userRole: user.role,
      userInterests: user.interestedEvents || [],
      token: jwtToken,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  registerUser,
  registerOrganizer,
  loginUser,
  oauthLogin,
};
