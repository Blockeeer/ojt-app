import { useState, useEffect } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import DatePicker from '../components/DatePicker';
import AttendanceTable from '../components/AttendanceTable';
import {
  getTodayStr,
  getPhaseForDate,
  isWorkingDay,
} from '../utils/dateHelpers';
import {
  calculateRenderedHours,
  validateTimeEntry,
  generateId,
  formatTime12h,
} from '../utils/timeCalculator';

export default function Attendance() {
  const [attendance, setAttendance] = useLocalStorage(STORAGE_KEYS.ATTENDANCE, []);
  const [settings]                  = useLocalStorage(STORAGE_KEYS.SETTINGS,   DEFAULT_SETTINGS);
  const [holidays]                  = useLocalStorage(STORAGE_KEYS.HOLIDAYS,    DEFAULT_HOLIDAYS);
  const [schedule]                  = useLocalStorage(STORAGE_KEYS.SCHEDULE,    DEFAULT_SCHEDULE);

  const today = getTodayStr();

  // Form state
  const [selectedDate, setSelectedDate] = useState(today);
  const [timeIn, setTimeIn]             = useState('');
  const [timeOut, setTimeOut]           = useState('');
  const [notes, setNotes]               = useState('');
  const [isAbsent, setIsAbsent]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [errors, setErrors]             = useState([]);
  const [successMsg, setSuccessMsg]     = useState('');

  // Derived schedule info for selected date
  const phase             = getPhaseForDate(selectedDate, schedule);
  const selectedWorking   = isWorkingDay(selectedDate, schedule, holidays);
  const selectedHoliday   = holidays.find((h) => h.date === selectedDate);

  // Pre-fill form whenever selectedDate changes
  useEffect(() => {
    const existing = attendance.find((r) => r.date === selectedDate);
    if (existing) {
      setEditId(existing.id);
      setTimeIn(existing.timeIn || '');
      setTimeOut(existing.timeOut || '');
      setNotes(existing.notes || '');
      setIsAbsent(!existing.timeIn);
    } else {
      setEditId(null);
      setTimeIn(phase ? phase.shiftStart : '');
      setTimeOut(phase ? phase.shiftEnd : '');
      setNotes('');
      setIsAbsent(false);
    }
    setErrors([]);
    setSuccessMsg('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Live preview of calculated hours
  const previewHours =
    !isAbsent && timeIn && timeOut && phase
      ? calculateRenderedHours(timeIn, timeOut, phase)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg('');

    let renderedHours = 0;

    if (!isAbsent && selectedWorking) {
      if (!phase) {
        setErrors(['This date is not within any defined schedule phase.']);
        return;
      }
      const { valid, errors: valErrors } = validateTimeEntry(timeIn, timeOut, phase);
      if (!valid) {
        setErrors(valErrors);
        return;
      }
      renderedHours = calculateRenderedHours(timeIn, timeOut, phase);
    }

    const entry = {
      id: editId || generateId(),
      date: selectedDate,
      timeIn:  isAbsent ? null : timeIn,
      timeOut: isAbsent ? null : timeOut,
      renderedHours,
      notes,
    };

    if (editId) {
      setAttendance((prev) => prev.map((r) => (r.id === editId ? entry : r)));
      setSuccessMsg('Entry updated successfully.');
    } else {
      setAttendance((prev) => [...prev, entry]);
      setSuccessMsg('Entry saved successfully.');
    }
  };

  const handleEdit = (record) => {
    setSelectedDate(record.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this attendance entry? This cannot be undone.')) {
      setAttendance((prev) => prev.filter((r) => r.id !== id));
      if (editId === id) {
        setEditId(null);
        setSelectedDate(today);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setSelectedDate(today);
  };

  return (
    <div className="pt-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Attendance</h1>

      {/* Time Entry Form */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {editId ? 'Edit Entry' : 'Log Attendance'}
          </h2>
          {editId && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
              Editing
            </span>
          )}
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-red-600 text-sm">{e}</p>
            ))}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-emerald-700 text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date picker */}
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
            min={settings.startDate}
            max={today}
            isWorkingDay={selectedWorking}
          />

          {/* Holiday notice */}
          {selectedHoliday && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-blue-700 text-sm font-medium">
                🎌 {selectedHoliday.name}
              </p>
              <p className="text-blue-600 text-xs mt-0.5 capitalize">
                {selectedHoliday.type} holiday — this day is excluded from the schedule.
              </p>
            </div>
          )}

          {/* Non-working rest day notice */}
          {!selectedWorking && !selectedHoliday && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-700 text-sm font-medium">Rest Day</p>
              <p className="text-amber-600 text-xs mt-0.5">
                This is not a scheduled working day. Saving will record 0 hours (for notes only).
              </p>
            </div>
          )}

          {/* Absent toggle — only show on working days */}
          {selectedWorking && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={(e) => setIsAbsent(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Mark as Absent (0 hours)</span>
            </label>
          )}

          {/* Time inputs — only show when working day and not absent */}
          {selectedWorking && !isAbsent && (
            <>
              <div>
                <label className="label">Time In</label>
                <input
                  type="time"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="input-field"
                />
                {phase && (
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled start: {formatTime12h(phase.shiftStart)} — arrivals before this are clamped.
                  </p>
                )}
              </div>

              <div>
                <label className="label">Time Out</label>
                <input
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  className="input-field"
                />
                {phase && (
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled end: {formatTime12h(phase.shiftEnd)} — departures after this are clamped.
                  </p>
                )}
              </div>

              {/* Live hours preview */}
              {previewHours !== null && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">Calculated hours</p>
                    <p className="text-lg font-bold text-indigo-600">{previewHours}h</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Lunch break ({formatTime12h(phase?.lunchStart)} – {formatTime12h(phase?.lunchEnd)}) auto-deducted
                  </p>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="e.g. Remote work, field visit, makeup day..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editId ? 'Update Entry' : 'Save Entry'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Attendance history */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">
          History
          <span className="ml-2 text-xs font-normal text-gray-400">
            ({attendance.length} {attendance.length === 1 ? 'entry' : 'entries'})
          </span>
        </h2>
        <AttendanceTable
          records={attendance}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
