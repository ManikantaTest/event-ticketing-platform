const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { deleteSession } = require("../controllers/sessionController");

const router = express.Router();

router.delete("/:sessionId", verifyToken, deleteSession);

module.exports = router;
