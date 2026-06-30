const prisma = require("../config/prisma");

const {
  getDayOfWeek,
  getMinutesSinceMidnight,
  isWithinAvailability,
} = require("./dateTime");

/**
 * Checks whether a meeting lies within the organizer's availability.
 */

const validateMeetingAvailability = async (
  organizerId,
  meetingStart,
  meetingEnd
) => {
  // Fetch organizer timezone
  const user = await prisma.user.findUnique({
    where: {
      id: organizerId,
    },
    select: {
      timezone: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const dayOfWeek = getDayOfWeek(meetingStart, user.timezone);

  const availability = await prisma.availability.findFirst({
    where: {
      userId: organizerId,
      dayOfWeek,
    },
  });

  if (!availability) {
    return {
      valid: false,
      message: "No availability found for this day.",
    };
  }

  const meetingStartMinutes = getMinutesSinceMidnight(
    meetingStart,
    user.timezone
  );

  const meetingEndMinutes = getMinutesSinceMidnight(
    meetingEnd,
    user.timezone
  );

  const available = isWithinAvailability(
    meetingStartMinutes,
    meetingEndMinutes,
    availability.startTime,
    availability.endTime
  );

  if (!available) {
    return {
      valid: false,
      message: "Meeting is outside your availability.",
    };
  }

  return {
    valid: true,
  };
};

/**
 * Checks whether the organizer already has an overlapping meeting.
 *
 * excludeMeetingId is used while updating a meeting.
 */

const checkMeetingOverlap = async (
  organizerId,
  meetingStart,
  meetingEnd,
  excludeMeetingId = null
) => {
  const where = {
    organizerId,

    startTime: {
      lt: meetingEnd,
    },

    endTime: {
      gt: meetingStart,
    },
  };

  // Ignore the current meeting during update
  if (excludeMeetingId) {
    where.id = {
      not: excludeMeetingId,
    };
  }

  const overlappingMeeting = await prisma.meeting.findFirst({
    where,
  });

  if (overlappingMeeting) {
    return {
      valid: false,
      message: "Meeting overlaps with an existing meeting.",
    };
  }

  return {
    valid: true,
  };
};

module.exports = {
  validateMeetingAvailability,
  checkMeetingOverlap,
};