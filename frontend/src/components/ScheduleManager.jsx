import { useState } from 'react';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { formatTime12h } from '../utils/timeCalculator';

const DAY_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
const ALL_WEEKDAYS = [1, 2, 3, 4, 5];

export default function ScheduleManager({ schedule, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(schedule);

  const handleDraftChange = (phaseIdx, field, value) =>
    setDraft((prev) => prev.map((p, i) => (i === phaseIdx ? { ...p, [field]: value } : p)));

  const toggleWorkDay = (phaseIdx, day) =>
    setDraft((prev) =>
      prev.map((p, i) => {
        if (i !== phaseIdx) return p;
        const days = p.workDays.includes(day)
          ? p.workDays.filter((d) => d !== day)
          : [...p.workDays, day].sort((a, b) => a - b);
        return { ...p, workDays: days };
      })
    );

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const PHASE_COLORS = ['from-sky-500 to-blue-600', 'from-teal-500 to-emerald-600'];
  const PHASE_BG     = ['bg-sky-50', 'bg-teal-50'];

  return (
    <div className="space-y-3">
      {draft.map((phase, idx) => (
        <div key={phase.id} className={`rounded-2xl border border-slate-100 overflow-hidden`}>
          {/* Phase header */}
          <div className={`bg-gradient-to-r ${PHASE_COLORS[idx] || 'from-slate-500 to-slate-600'} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">{phase.label}</p>
                <p className="text-white/70 text-xs mt-0.5">
                  {formatDateShort(parseDate(phase.startDate))} –{' '}
                  {phase.endDate ? formatDateShort(parseDate(phase.endDate)) : 'Ongoing'}
                </p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-1.5 text-right">
                <p className="text-white font-extrabold text-lg leading-none">{phase.netDailyHours}h</p>
                <p className="text-white/70 text-[10px]">per day</p>
              </div>
            </div>
          </div>

          {/* Phase body */}
          <div className="p-4">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <p className="label">Working Days</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ALL_WEEKDAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleWorkDay(idx, d)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                          phase.workDays.includes(d)
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {DAY_LABELS[d]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Shift Start', 'shiftStart'],
                    ['Shift End',   'shiftEnd'],
                    ['Lunch Start', 'lunchStart'],
                    ['Lunch End',   'lunchEnd'],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input
                        type="time"
                        value={phase[field]}
                        onChange={(e) => handleDraftChange(idx, field, e.target.value)}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="label">Daily Hours</p>
                  <div className="flex gap-2">
                    {[8, 10].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleDraftChange(idx, 'netDailyHours', h)}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${
                          phase.netDailyHours === h
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {h}h / day
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                      onChange={(e) => handleDraftChange(idx, 'endDate', e.target.value || null)}
                      className="input-field"
                    />
                    {!phase.endDate && <p className="text-[10px] text-slate-400 mt-1">Empty = ongoing</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-1.5 flex-wrap">
                  {phase.workDays.map((d) => (
                    <span key={d} className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg">
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`${PHASE_BG[idx] || 'bg-slate-50'} rounded-xl p-2.5`}>
                    <p className="text-slate-400 font-semibold mb-0.5">Shift</p>
                    <p className="font-bold text-slate-700">
                      {formatTime12h(phase.shiftStart)} – {formatTime12h(phase.shiftEnd)}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5">
                    <p className="text-amber-400 font-semibold mb-0.5">Lunch</p>
                    <p className="font-bold text-amber-700">
                      {formatTime12h(phase.lunchStart)} – {formatTime12h(phase.lunchEnd)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        {editing ? (
          <>
            <button onClick={handleSave} className="btn-primary flex-1">Save Schedule</button>
            <button onClick={() => { setDraft(schedule); setEditing(false); }} className="btn-secondary flex-1">Cancel</button>
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
