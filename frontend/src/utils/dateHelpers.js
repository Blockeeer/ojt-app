import {
  parseISO,
  format,
  getISODay,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isEqual,
  addDays,
} from 'date-fns';

/** Parse 'YYYY-MM-DD' string to a Date at local midnight. */
export function parseDate(dateStr) {
  return parseISO(dateStr);
}

/** Format a Date to 'YYYY-MM-DD'. */
export function formatDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

/** Format a Date to e.g. "Monday, February 23, 2026". */
export function formatDateDisplay(date) {
  return format(date, 'EEEE, MMMM d, yyyy');
}

/** Format a Date to e.g. "Feb 23, 2026". */
export function formatDateShort(date) {
  return format(date, 'MMM d, yyyy');
}

/** Format a Date to e.g. "Mon" */
export function formatDayShort(date) {
  return format(date, 'EEE');
}

/** Return today as 'YYYY-MM-DD'. */
export function getTodayStr() {
  return formatDateKey(new Date());
}

/**
 * Returns the schedule phase config that covers a given date string.
 * Returns null if the date falls outside all defined phases.
 */
export function getPhaseForDate(dateStr, schedulePhases) {
  const date = parseDate(dateStr);
  for (const phase of schedulePhases) {
    const phaseStart = parseDate(phase.startDate);
    const phaseEnd = phase.endDate ? parseDate(phase.endDate) : null;

    const afterStart =
      isEqual(date, phaseStart) || isAfter(date, phaseStart);
    const beforeEnd =
      phaseEnd === null ||
      isEqual(date, phaseEnd) ||
      isBefore(date, phaseEnd);

    if (afterStart && beforeEnd) return phase;
  }
  return null;
}

/**
 * Returns true if the given date string is a scheduled working day
 * (correct phase, correct day-of-week, not a holiday).
 */
export function isWorkingDay(dateStr, schedulePhases, holidays) {
  const phase = getPhaseForDate(dateStr, schedulePhases);
  if (!phase) return false;

  const isoDay = getISODay(parseDate(dateStr)); // 1=Mon … 7=Sun
  if (!phase.workDays.includes(isoDay)) return false;

  const holidaySet = new Set(holidays.map((h) => h.date));
  if (holidaySet.has(dateStr)) return false;

  return true;
}

/**
 * Returns all 'YYYY-MM-DD' working day strings between startDate and endDate (inclusive).
 */
export function getExpectedWorkingDays(startDate, endDate, schedulePhases, holidays) {
  const days = eachDayOfInterval({
    start: parseDate(startDate),
    end: parseDate(endDate),
  });
  return days
    .map((d) => formatDateKey(d))
    .filter((dateStr) => isWorkingDay(dateStr, schedulePhases, holidays));
}

/**
 * Counts expected working days between startDate and endDate (inclusive).
 */
export function countExpectedWorkingDays(startDate, endDate, schedulePhases, holidays) {
  return getExpectedWorkingDays(startDate, endDate, schedulePhases, holidays).length;
}

/**
 * Projects the estimated completion date given remaining hours.
 * Walks forward from startFromDate, subtracting netDailyHours for each working day.
 * Returns 'YYYY-MM-DD' string or null if not determinable within maxDays.
 */
export function projectCompletionDate(
  remainingHours,
  startFromDate,
  schedulePhases,
  holidays,
  maxDays = 500
) {
  if (remainingHours <= 0) return startFromDate;

  let current = parseDate(startFromDate);
  let hoursLeft = remainingHours;

  for (let i = 0; i < maxDays; i++) {
    const dateStr = formatDateKey(current);
    if (isWorkingDay(dateStr, schedulePhases, holidays)) {
      const phase = getPhaseForDate(dateStr, schedulePhases);
      hoursLeft -= phase.netDailyHours;
      if (hoursLeft <= 0) return dateStr;
    }
    current = addDays(current, 1);
  }

  return null;
}
