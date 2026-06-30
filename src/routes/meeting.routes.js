const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} = require("../controllers/meeting.controller");

router.post("/", authenticate, createMeeting);

router.get("/", authenticate, getMeetings);

router.get("/:id", authenticate, getMeetingById);

router.put("/:id", authenticate, updateMeeting);

router.delete("/:id", authenticate, deleteMeeting);

module.exports = router;