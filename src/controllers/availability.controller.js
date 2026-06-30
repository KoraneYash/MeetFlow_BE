const prisma = require("../config/prisma");
const { timeStringToMinutes } = require("../utils/dateTime");

// ===============================================
// CREATE AVAILABILITY
// ===============================================

const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration, breakDuration } =
      req.body;

    if (dayOfWeek === undefined || !startTime || !endTime || !slotDuration) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    // Validate timings

    if (timeStringToMinutes(startTime) >= timeStringToMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time.",
      });
    }

    // Check duplicate availability

    const existingAvailability = await prisma.availability.findFirst({
      where: {
        userId: req.user.id,
        dayOfWeek,
      },
    });

    if (existingAvailability) {
      return res.status(409).json({
        success: false,
        message: "Availability already exists for this day.",
      });
    }

    const availability = await prisma.availability.create({
      data: {
        userId: req.user.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
        breakDuration,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Availability created successfully.",
      data: availability,
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
// GET ALL AVAILABILITIES
// ===============================================

const getAvailabilities = async (req, res) => {
  try {
    const availabilities = await prisma.availability.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: availabilities,
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
// UPDATE AVAILABILITY
// ===============================================

const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await prisma.availability.findUnique({
      where: {
        id,
      },
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (availability.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const duplicate = await prisma.availability.findFirst({
      where: {
        userId: req.user.id,
        dayOfWeek: req.body.dayOfWeek ?? availability.dayOfWeek,
        id: {
          not: id,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Availability already exists for this day.",
      });
    }

    const startTime = req.body.startTime ?? availability.startTime;

    const endTime = req.body.endTime ?? availability.endTime;

    if (timeStringToMinutes(startTime) >= timeStringToMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time.",
      });
    }

    const updatedAvailability = await prisma.availability.update({
      where: {
        id,
      },
      data: {
        dayOfWeek: req.body.dayOfWeek ?? availability.dayOfWeek,

        startTime,

        endTime,

        slotDuration: req.body.slotDuration ?? availability.slotDuration,

        breakDuration: req.body.breakDuration ?? availability.breakDuration,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully.",
      data: updatedAvailability,
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
// DELETE AVAILABILITY
// ===============================================

const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await prisma.availability.findUnique({
      where: {
        id,
      },
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (availability.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await prisma.availability.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createAvailability,
  getAvailabilities,
  updateAvailability,
  deleteAvailability,
};
