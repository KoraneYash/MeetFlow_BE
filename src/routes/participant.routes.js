const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
    addParticipant,
    getParticipants,
    updateParticipantStatus,
    removeParticipant
} = require("../controllers/participant.controller");

router.post("/", authenticate, addParticipant);

router.get("/:meetingId", authenticate, getParticipants);

router.patch("/:id/status", authenticate, updateParticipantStatus);

router.delete("/:id", authenticate, removeParticipant);

module.exports = router;