import { useState, useEffect } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import DatePicker from '../components/DatePicker';
import AttendanceTable from '../components/AttendanceTable';
import { getTodayStr, getPhaseForDate, isWorkingDay } from '../utils/dateHelpers';
import { calculateRenderedHours, validateTimeEntry, generateId, formatTime12h } from '../utils/timeCalculator';

export default function Attendance() {
  const [attendance, setAttendance] = useLocalStorage(STORAGE_KEYS.ATTENDANCE, []);
  const [settings]                  = useLocalStorage(STORAGE_KEYS.SETTINGS,   DEFAULT_SETTINGS);
  const [holidays]                  = useLocalStorage(STORAGE_KEYS.HOLIDAYS,    DEFAULT_HOLIDAYS);
  const [schedule]                  = useLocalStorage(STORAGE_KEYS.SCHEDULE,    DEFAULT_SCHEDULE);

  const today = getTodayStr();

  const [selectedDate, setSelectedDate] = useState(today);
  const [timeIn, setTimeIn]             = useState('');
  const [timeOut, setTimeOut]           = useState('');
  const [notes, setNotes]               = useState('');
  const [isAbsent, setIsAbsent]         = useState(false);
  const [hoursCap, setHoursCap]         = useState(10);
  const [editId, setEditId]             = useState(null);
  const [errors, setErrors]             = useState([]);
  const [successMsg, setSuccessMsg]     = useState('');

  const phase           = getPhaseForDate(selectedDate, schedule);
  const selectedWorking = isWorkingDay(selectedDate, schedule, holidays);
  const selectedHoliday = holidays.find((h) => h.date === selectedDate);

  useEffect(() => {
    const existing = attendance.find((r) => r.date === selectedDate);
    if (existing) {
      setEditId(existing.id);
      setTimeIn(existing.timeIn || '');
      setTimeOut(existing.timeOut || '');
      setNotes(existing.notes || '');
      setIsAbsent(!existing.timeIn);
      setHoursCap(existing.hoursCap || (phase ? phase.netDailyHours : 10));
    } else {
      setEditId(null);
      setTimeIn(phase ? phase.shiftStart : '');
      setTimeOut(phase ? phase.shiftEnd : '');
      setNotes('');
      setIsAbsent(false);
      setHoursCap(phase ? phase.netDailyHours : 10);
    }
    setErrors([]);
    setSuccessMsg('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const previewHours =
    !isAbsent && timeIn && timeOut && phase
      ? calculateRenderedHours(timeIn, timeOut, phase, hoursCap)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg('');

    let renderedHours = 0;
    if (!isAbsent) {
      if (!phase) { setErrors(['This date is not within any defined schedule phase.']); return; }
      const { valid, errors: valErrors } = validateTimeEntry(timeIn, timeOut, phase);
      if (!valid) { setErrors(valErrors); return; }
      renderedHours = calculateRenderedHours(timeIn, timeOut, phase, hoursCap);
    }

    const entry = {
      id: editId || generateId(),
      date: selectedDate,
      timeIn:  isAbsent ? null : timeIn,
      timeOut: isAbsent ? null : timeOut,
      renderedHours,
      hoursCap,
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
      if (editId === id) { setEditId(null); setSelectedDate(today); }
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="relative -mx-4 px-4 pt-10 pb-6 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="relative">
          <p className="text-sky-100 text-xs font-semibold uppercase tracking-widest mb-1">Log Time</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {editId ? 'Edit Attendance' : 'Attendance'}
          </h1>
          <p className="text-sky-100 text-xs mt-1">
            {attendance.length} {attendance.length === 1 ? 'entry' : 'entries'} recorded
          </p>
        </div>
      </div>

      {/* ── Time Entry Form ── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">
            {editId ? 'Edit Entry' : 'Log Attendance'}
          </h2>
          {editId && <span className="badge-blue">Editing</span>}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-red-600 text-sm font-medium">{e}</p>
            ))}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-emerald-700 text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
            min={settings.startDate}
            max={today}
            isWorkingDay={selectedWorking}
          />

          {selectedHoliday && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-xl shrink-0">🎌</span>
              <div>
                <p className="text-sm font-bold text-blue-800">{selectedHoliday.name}</p>
                <p className="text-xs text-blue-600 mt-0.5 capitalize">
                  {selectedHoliday.type} holiday — you can still log attendance
                </p>
              </div>
            </div>
          )}

          {!selectedWorking && !selectedHoliday && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <span className="text-xl shrink-0">😴</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Rest Day</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Not a scheduled working day — you can still log attendance
                </p>
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isAbsent}
              onChange={(e) => setIsAbsent(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">Mark as Absent</p>
              <p className="text-xs text-slate-400">Records 0 hours for this day</p>
            </div>
          </label>

          {!isAbsent && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Time In</label>
                  <input
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="input-field"
                  />
                  {phase && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Sched: {formatTime12h(phase.shiftStart)}
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
                    <p className="text-[10px] text-slate-400 mt-1">
                      Sched: {formatTime12h(phase.shiftEnd)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="label">Daily Hours Cap</p>
                <div className="flex gap-2">
                  {[8, 10].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHoursCap(h)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${
                        hoursCap === h
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {h}h / day
                    </button>
                  ))}
                </div>
              </div>

              {previewHours !== null && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-sky-500 uppercase tracking-wider">Calculated Hours</p>
                      <p className="text-[10px] text-sky-400 mt-0.5">
                        Lunch {formatTime12h(phase?.lunchStart)}–{formatTime12h(phase?.lunchEnd)} auto-deducted
                      </p>
                    </div>
                    <p className="text-3xl font-extrabold text-sky-600">{previewHours}h</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="e.g. Remote work, field visit..."
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editId ? 'Update Entry' : 'Save Entry'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setSelectedDate(today); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── History ── */}
      <div>
        <p className="section-title">
          History
          <span className="ml-2 normal-case font-medium text-slate-400">
            ({attendance.length} {attendance.length === 1 ? 'entry' : 'entries'})
          </span>
        </p>
        <AttendanceTable
          records={attendance}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className="h-2" />
    </div>
  );
}
