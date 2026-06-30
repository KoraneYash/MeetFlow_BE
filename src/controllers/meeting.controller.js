const prisma = require("../config/prisma");

const {
  validateMeetingAvailability,
  checkMeetingOverlap,
} = require("../utils/meetingValidation");

// ===============================================
// CREATE MEETING
// ===============================================

const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      meetingLink,
    } = req.body;

    // Required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, Start Time and End Time are required.",
      });
    }

    const meetingStart = new Date(startTime);
    const meetingEnd = new Date(endTime);

    // Invalid Date check
    if (
      isNaN(meetingStart.getTime()) ||
      isNaN(meetingEnd.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    // End must be after Start
    if (meetingEnd <= meetingStart) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than Start time.",
      });
    }

    // Check organizer availability
    const availabilityCheck =
      await validateMeetingAvailability(
        req.user.id,
        meetingStart,
        meetingEnd
      );

    if (!availabilityCheck.valid) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.message,
      });
    }

    // Check overlapping meetings
    const overlapCheck =
      await checkMeetingOverlap(
        req.user.id,
        meetingStart,
        meetingEnd
      );

    if (!overlapCheck.valid) {
      return res.status(409).json({
        success: false,
        message: overlapCheck.message,
      });
    }

    // Create Meeting
    const meeting = await prisma.meeting.create({
      data: {
        organizerId: req.user.id,
        title,
        description,
        startTime: meetingStart,
        endTime: meetingEnd,
        location,
        meetingLink,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully.",
      data: meeting,
    });
  } catch (error) {
    console.error("Create Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ===============================================
// UPDATE MEETING
// ===============================================

const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Use old values if not provided

    const title = req.body.title ?? meeting.title;
    const description = req.body.description ?? meeting.description;
    const location = req.body.location ?? meeting.location;
    const meetingLink = req.body.meetingLink ?? meeting.meetingLink;

    const meetingStart = req.body.startTime
      ? new Date(req.body.startTime)
      : meeting.startTime;

    const meetingEnd = req.body.endTime
      ? new Date(req.body.endTime)
      : meeting.endTime;

    // Validate dates

    if (
      isNaN(meetingStart.getTime()) ||
      isNaN(meetingEnd.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    if (meetingEnd <= meetingStart) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than Start time.",
      });
    }

    // Availability validation

    const availabilityCheck =
      await validateMeetingAvailability(
        req.user.id,
        meetingStart,
        meetingEnd
      );

    if (!availabilityCheck.valid) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.message,
      });
    }

    // Overlap validation
    // Ignore current meeting

    const overlapCheck =
      await checkMeetingOverlap(
        req.user.id,
        meetingStart,
        meetingEnd,
        id
      );

    if (!overlapCheck.valid) {
      return res.status(409).json({
        success: false,
        message: overlapCheck.message,
      });
    }

    // Update Meeting

    const updatedMeeting = await prisma.meeting.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        location,
        meetingLink,
        startTime: meetingStart,
        endTime: meetingEnd,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully.",
      data: updatedMeeting,
    });

  } catch (error) {

    console.error("Update Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }
};

// ===============================================
// GET ALL MEETINGS
// ===============================================

const getMeetings = async (req, res) => {
  try {

    const meetings = await prisma.meeting.findMany({
      where: {
        organizerId: req.user.id
      },

      orderBy: {
        startTime: "asc"
      }
    });

    return res.status(200).json({
      success: true,
      data: meetings
    });

  } catch (error) {

    console.error("Get Meetings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};

// ===============================================
// GET SINGLE MEETING
// ===============================================

const getMeetingById = async (req, res) => {
  try {

    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found."
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized."
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting
    });

  } catch (error) {

    console.error("Get Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};

// ===============================================
// DELETE MEETING
// ===============================================

const deleteMeeting = async (req, res) => {
  try {

    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found."
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized."
      });
    }

    await prisma.meeting.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully."
    });

  } catch (error) {

    console.error("Delete Meeting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
};