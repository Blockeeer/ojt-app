/** Parse 'HH:mm' to total minutes from midnight. */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/** Convert minutes from midnight back to 'HH:mm'. */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Format 'HH:mm' (24h) to '7:00 AM' / '1:00 PM' display format. */
export function formatTime12h(timeStr) {
  if (!timeStr) return '--';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Calculates net rendered hours for a single attendance entry.
 *
 * Rules:
 * 1. Clamp timeIn  → max(timeIn, shiftStart)   — early arrivals don't count
 * 2. Clamp timeOut → min(timeOut, shiftEnd)     — late departures don't count
 * 3. If clamped window is zero or negative → 0h
 * 4. Subtract lunch overlap using interval-intersection formula
 * 5. Cap result at phase.netDailyHours
 *
 * @param {string} timeIn   - 'HH:mm'
 * @param {string} timeOut  - 'HH:mm'
 * @param {Object} phase    - { shiftStart, shiftEnd, lunchStart, lunchEnd, netDailyHours }
 * @returns {number} net hours (e.g. 10.0, 5.5)
 */
export function calculateRenderedHours(timeIn, timeOut, phase) {
  if (!timeIn || !timeOut || !phase) return 0;

  const shiftStartMin  = timeToMinutes(phase.shiftStart);
  const shiftEndMin    = timeToMinutes(phase.shiftEnd);
  const lunchStartMin  = timeToMinutes(phase.lunchStart);
  const lunchEndMin    = timeToMinutes(phase.lunchEnd);
  const timeInMin      = timeToMinutes(timeIn);
  const timeOutMin     = timeToMinutes(timeOut);

  const effectiveIn    = Math.max(timeInMin, shiftStartMin);
  const effectiveOut   = Math.min(timeOutMin, shiftEndMin);

  if (effectiveOut <= effectiveIn) return 0;

  const rawMinutes = effectiveOut - effectiveIn;

  // Interval intersection: overlap of [effectiveIn, effectiveOut] with [lunchStart, lunchEnd]
  const lunchOverlap = Math.max(
    0,
    Math.min(effectiveOut, lunchEndMin) - Math.max(effectiveIn, lunchStartMin)
  );

  const netMinutes = rawMinutes - lunchOverlap;
  const netHours   = Math.min(netMinutes / 60, phase.netDailyHours);

  return Math.round(netHours * 100) / 100;
}

/**
 * Validates a time-in / time-out pair against a phase config.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateTimeEntry(timeIn, timeOut, phase) {
  const errors = [];

  if (!timeIn)  errors.push('Time-in is required.');
  if (!timeOut) errors.push('Time-out is required.');
  if (errors.length) return { valid: false, errors };

  if (timeToMinutes(timeOut) <= timeToMinutes(timeIn)) {
    errors.push('Time-out must be after time-in.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregates an array of attendance records into summary stats.
 * @returns {{ totalRendered: number, totalDays: number }}
 */
export function summarizeAttendance(records) {
  const totalRendered = records.reduce(
    (sum, r) => sum + (r.renderedHours || 0),
    0
  );
  const totalDays = records.filter((r) => (r.renderedHours || 0) > 0).length;
  return {
    totalRendered: Math.round(totalRendered * 100) / 100,
    totalDays,
  };
}

/** Generates a unique ID for attendance entries. */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
