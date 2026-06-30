const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
    createAvailability,
    getAvailabilities,
    updateAvailability,
    deleteAvailability
} = require("../controllers/availability.controller");

router.post("/", authenticate, createAvailability);

router.get("/", authenticate, getAvailabilities);

router.put("/:id", authenticate, updateAvailability);

router.delete("/:id", authenticate, deleteAvailability);

module.exports = router;