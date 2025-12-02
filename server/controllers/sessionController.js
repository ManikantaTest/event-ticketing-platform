const Session = require("../models/sessionModel");

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const deletedSession = await Session.findByIdAndDelete(sessionId);
    if (!deletedSession) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting session",
      error: err.message,
    });
  }
};

module.exports = {
  deleteSession,
};
