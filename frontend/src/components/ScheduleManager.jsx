import { useState } from 'react';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { formatTime12h } from '../utils/timeCalculator';

const DAY_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
const ALL_WEEKDAYS = [1, 2, 3, 4, 5];

export default function ScheduleManager({ schedule, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(schedule);

  const handleDraftChange = (phaseIdx, field, value) => {
    setDraft((prev) =>
      prev.map((p, i) => (i === phaseIdx ? { ...p, [field]: value } : p))
    );
  };

  const toggleWorkDay = (phaseIdx, day) => {
    setDraft((prev) =>
      prev.map((p, i) => {
        if (i !== phaseIdx) return p;
        const days = p.workDays.includes(day)
          ? p.workDays.filter((d) => d !== day)
          : [...p.workDays, day].sort((a, b) => a - b);
        return { ...p, workDays: days };
      })
    );
  };

  const handleSave = () => {
    // Recompute netDailyHours based on shift/lunch times
    const updated = draft.map((p) => {
      const toMin  = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const shift  = toMin(p.shiftEnd)   - toMin(p.shiftStart);
      const lunch  = toMin(p.lunchEnd)   - toMin(p.lunchStart);
      const net    = Math.max(0, (shift - lunch) / 60);
      return { ...p, netDailyHours: Math.round(net * 100) / 100 };
    });
    onUpdate(updated);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(schedule);
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      {draft.map((phase, idx) => (
        <div key={phase.id} className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">{phase.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDateShort(parseDate(phase.startDate))} –{' '}
                {phase.endDate ? formatDateShort(parseDate(phase.endDate)) : 'Ongoing'}
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-lg">
              {phase.netDailyHours}h/day
            </span>
          </div>

          {editing ? (
            <div className="space-y-3">
              {/* Working days */}
              <div>
                <p className="label">Working Days</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ALL_WEEKDAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleWorkDay(idx, d)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        phase.workDays.includes(d)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-500 border-gray-300'
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Shift Start</label>
                  <input
                    type="time"
                    value={phase.shiftStart}
                    onChange={(e) => handleDraftChange(idx, 'shiftStart', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Shift End</label>
                  <input
                    type="time"
                    value={phase.shiftEnd}
                    onChange={(e) => handleDraftChange(idx, 'shiftEnd', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Lunch Start</label>
                  <input
                    type="time"
                    value={phase.lunchStart}
                    onChange={(e) => handleDraftChange(idx, 'lunchStart', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Lunch End</label>
                  <input
                    type="time"
                    value={phase.lunchEnd}
                    onChange={(e) => handleDraftChange(idx, 'lunchEnd', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phase Start</label>
                  <input
                    type="date"
                    value={phase.startDate}
                    onChange={(e) => handleDraftChange(idx, 'startDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Phase End</label>
                  <input
                    type="date"
                    value={phase.endDate || ''}
                    onChange={(e) =>
                      handleDraftChange(idx, 'endDate', e.target.value || null)
                    }
                    className="input-field"
                  />
                  {!phase.endDate && (
                    <p className="text-xs text-gray-400 mt-1">Leave empty for open-ended</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Read-only view */
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 flex-wrap">
                {phase.workDays.map((d) => (
                  <span
                    key={d}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                  >
                    {DAY_LABELS[d]}
                  </span>
                ))}
              </div>
              <p>
                Shift:{' '}
                <span className="font-medium text-gray-800">
                  {formatTime12h(phase.shiftStart)} – {formatTime12h(phase.shiftEnd)}
                </span>
              </p>
              <p>
                Lunch:{' '}
                <span className="font-medium text-gray-800">
                  {formatTime12h(phase.lunchStart)} – {formatTime12h(phase.lunchEnd)}
                </span>{' '}
                <span className="text-xs text-amber-600">(auto-deducted)</span>
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        {editing ? (
          <>
            <button onClick={handleSave} className="btn-primary flex-1">
              Save Schedule
            </button>
            <button onClick={handleCancel} className="btn-secondary flex-1">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => { setDraft(schedule); setEditing(true); }}
            className="btn-secondary w-full"
          >
            Edit Schedule
          </button>
        )}
      </div>
    </div>
  );
}
