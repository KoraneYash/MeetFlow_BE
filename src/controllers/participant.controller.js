// ===============================================
// CREATE PARTICIPANT
// ===============================================

const prisma = require("../config/prisma");

const addParticipant = async (req, res) => {
  try {
    const { meetingId, name, email } = req.body;

    if (!meetingId || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    // Check meeting exists

    const meetingExists = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
      },
    });

    if (!meetingExists) {
      return res.status(404).json({
        success: false,
        message: "Meeting does not exist.",
      });
    }

    if (meetingExists.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingParticipant = await prisma.participant.findFirst({
      where: {
        meetingId,
        guestEmail: email,
      },
    });

    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message: "Participant already exists.",
      });
    }

    const participant = await prisma.participant.create({
      data: {
        meetingId,
        userId: user.id,
        guestName: user.name,
        guestEmail: email,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Participant created successfully.",
      data: participant,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================================
// GET PARTICIPANT
// ===============================================

const getParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const participants = await prisma.participant.findMany({
      where: {
        meetingId,
      },
    });

    if (!participants) {
      return res.status(404).json({
        success: false,
        message: "Participants not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================================
// UPDATE PARTICIPANT STATUS
// ===============================================

const updateParticipantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const participant = await prisma.participant.findUnique({
      where: {
        id,
      },
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "participant not found.",
      });
    }

    const updatedParticipant = await prisma.participant.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Participant status updated successfully.",
      data: updatedParticipant,
    });
  } catch (error) {
    console.error("Update Participant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ===============================================
// REMOVE PARTICIPANT 
// ===============================================

const removeParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await prisma.participant.findUnique({
      where: {
        id,
      },
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "participant not found.",
      });
    }

    await prisma.participant.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Participant deleted successfully.",
    });
  } catch (error) {
    console.error("Remove Participant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  addParticipant,
  getParticipants,
  updateParticipantStatus,
  removeParticipant,
};
