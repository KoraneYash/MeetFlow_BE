const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes")
const availabilityRoutes = require("./routes/availability.routes");
const meetingRoutes = require("./routes/meeting.routes");
const participantRoutes = require("./routes/participant.routes")

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API's are running"
    });
});

app.use("/api/auth", authRoutes)

app.use("/api/availability", availabilityRoutes);

app.use("/api/meetings", meetingRoutes);

app.use("/api/participants",participantRoutes);

module.exports = app;