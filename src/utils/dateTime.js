/**
 * Returns date parts in the user's timezone.
 * No external libraries required.
 */

const getUserLocalDate = (utcDate, timezone = "Asia/Kolkata") => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);

  const weekday = parts.find((p) => p.type === "weekday").value;

  const hour = Number(parts.find((p) => p.type === "hour").value);

  const minute = Number(parts.find((p) => p.type === "minute").value);

  return {
    weekday,
    hour,
    minute,
  };
};

/**
 * Returns dayOfWeek
 * Sunday = 0
 * Monday = 1
 * ...
 * Saturday = 6
 */

const getDayOfWeek = (utcDate, timezone) => {
  const { weekday } = getUserLocalDate(utcDate, timezone);

  const map = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday];
};

/**
 * Returns minutes from midnight
 * Example:
 * 09:30 -> 570
 */

const getMinutesSinceMidnight = (utcDate, timezone) => {
  const { hour, minute } = getUserLocalDate(utcDate, timezone);

  return hour * 60 + minute;
};

/**
 * Converts "09:30" -> 570
 */

const timeStringToMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
};

/**
 * Checks if meeting lies inside availability
 */

const isWithinAvailability = (
  meetingStartMinutes,
  meetingEndMinutes,
  availabilityStart,
  availabilityEnd
) => {
  const start = timeStringToMinutes(availabilityStart);
  const end = timeStringToMinutes(availabilityEnd);

  return (
    meetingStartMinutes >= start &&
    meetingEndMinutes <= end
  );
};

module.exports = {
  getUserLocalDate,
  getDayOfWeek,
  getMinutesSinceMidnight,
  timeStringToMinutes,
  isWithinAvailability,
};