import { useState } from 'react';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { generateId } from '../utils/timeCalculator';

export default function HolidayManager({ holidays, onAdd, onDelete }) {
  const [form, setForm]   = useState({ name: '', date: '', type: 'regular' });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      setError('Holiday name and date are required.');
      return;
    }
    if (holidays.some((h) => h.date === form.date)) {
      setError('A holiday already exists on this date.');
      return;
    }
    onAdd({ id: generateId(), name: form.name.trim(), date: form.date, type: form.type });
    setForm({ name: '', date: '', type: 'regular' });
    setError('');
    setShowForm(false);
  };

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-3">
      {/* Toggle add form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary w-full flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Holiday
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">New Holiday</h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Cancel
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
          <button type="submit" className="btn-primary w-full">
            Add Holiday
          </button>
        </form>
      )}

      {/* Holiday list */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">
            Holidays
            <span className="ml-1.5 text-xs font-normal text-gray-400">({holidays.length})</span>
          </h3>
        </div>

        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No holidays added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {sorted.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateShort(parseDate(h.date))} ·{' '}
                    <span className={h.type === 'regular' ? 'text-red-500' : 'text-amber-500'}>
                      {h.type === 'regular' ? 'Regular' : 'Special'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => onDelete(h.id)}
                  className="text-red-500 text-xs font-medium hover:underline ml-4 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
