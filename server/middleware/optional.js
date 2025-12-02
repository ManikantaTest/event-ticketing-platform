const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await userModel.findById(decoded.userId).lean();
    } catch (err) {
      console.error("JWT error:", err.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

module.exports = optionalAuth;
