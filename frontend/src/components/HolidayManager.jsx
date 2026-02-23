import { useState } from 'react';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { generateId } from '../utils/timeCalculator';

export default function HolidayManager({ holidays, onAdd, onDelete }) {
  const [form, setForm]         = useState({ name: '', date: '', type: 'regular' });
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) { setError('Holiday name and date are required.'); return; }
    if (holidays.some((h) => h.date === form.date)) { setError('A holiday already exists on this date.'); return; }
    onAdd({ id: generateId(), name: form.name.trim(), date: form.date, type: form.type });
    setForm({ name: '', date: '', type: 'regular' });
    setError('');
    setShowForm(false);
  };

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-3">

      {/* Add button / form toggle */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Holiday
        </button>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-800">New Holiday</p>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Holiday Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Labor Day"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="input-field"
              >
                <option value="regular">Regular Holiday</option>
                <option value="special">Special Non-Working Holiday</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Add Holiday</button>
          </form>
        </div>
      )}

      {/* Holiday list */}
      {sorted.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <p className="text-2xl mb-1">🗓</p>
          <p className="text-xs font-medium">No holidays added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className={`w-2 h-8 rounded-full shrink-0 ${h.type === 'regular' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{h.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDateShort(parseDate(h.date))} ·{' '}
                  <span className={h.type === 'regular' ? 'text-red-500 font-semibold' : 'text-amber-600 font-semibold'}>
                    {h.type === 'regular' ? 'Regular' : 'Special'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onDelete(h.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
