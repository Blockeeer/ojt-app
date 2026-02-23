import { useState } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import HolidayManager from '../components/HolidayManager';
import ScheduleManager from '../components/ScheduleManager';

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [holidays, setHolidays] = useLocalStorage(STORAGE_KEYS.HOLIDAYS, DEFAULT_HOLIDAYS);
  const [schedule, setSchedule] = useLocalStorage(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);

  const [infoDraft, setInfoDraft] = useState(settings);
  const [infoSaved, setInfoSaved] = useState(false);

  const handleSaveInfo = () => {
    setSettings(infoDraft);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2500);
  };

  const handleAddHoliday    = (h)  => setHolidays((prev) => [...prev, h]);
  const handleDeleteHoliday = (id) => setHolidays((prev) => prev.filter((h) => h.id !== id));

  const handleResetAttendance = () => {
    if (window.confirm('Delete ALL attendance records?\nSettings and schedule are kept.')) {
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      window.location.reload();
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset EVERYTHING?\nThis cannot be undone.')) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="relative -mx-4 px-4 pt-10 pb-6 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="relative">
          <p className="text-sky-100 text-xs font-semibold uppercase tracking-widest mb-1">Configure</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-sky-100 text-xs mt-1">Manage your OJT profile and schedule</p>
        </div>
      </div>

      {/* ── Student Info ── */}
      <div className="card">
        <SectionHeader icon="👤" title="Student Information" subtitle="Your OJT profile" />
        <div className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={infoDraft.studentName}
              onChange={(e) => setInfoDraft((d) => ({ ...d, studentName: e.target.value }))}
              placeholder="e.g. Juan Dela Cruz"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Required OJT Hours</label>
            <div className="relative">
              <input
                type="number"
                value={infoDraft.requiredHours}
                onChange={(e) => setInfoDraft((d) => ({ ...d, requiredHours: Number(e.target.value) }))}
                min={1}
                max={10000}
                className="input-field pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">hrs</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Default: 486 hours. Check with your school.</p>
          </div>

          <div>
            <label className="label">OJT Start Date</label>
            <input
              type="date"
              value={infoDraft.startDate}
              onChange={(e) => setInfoDraft((d) => ({ ...d, startDate: e.target.value }))}
              className="input-field"
            />
          </div>

          <button
            onClick={handleSaveInfo}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              infoSaved
                ? 'bg-emerald-500 text-white scale-95'
                : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-sm shadow-sky-200'
            }`}
          >
            {infoSaved ? '✓ Saved!' : 'Save Information'}
          </button>
        </div>
      </div>

      {/* ── Schedule ── */}
      <div className="card">
        <SectionHeader icon="📅" title="Schedule Configuration" subtitle="Work phases and shift times" />
        <ScheduleManager schedule={schedule} onUpdate={setSchedule} />
      </div>

      {/* ── Holidays ── */}
      <div className="card">
        <SectionHeader icon="🎌" title="Holidays" subtitle="PH 2026 holidays pre-loaded" />
        <HolidayManager
          holidays={holidays}
          onAdd={handleAddHoliday}
          onDelete={handleDeleteHoliday}
        />
      </div>

      {/* ── About ── */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">ℹ️</span>
          <p className="text-sm font-bold text-slate-600">About This App</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          All data is stored in your browser's localStorage. Clearing browser data will erase all records.
        </p>
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Storage: Browser localStorage</span>
          <span className="badge-blue">v1.0.0</span>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-bold text-red-700">Danger Zone</p>
        </div>

        <div className="bg-white rounded-xl p-3 space-y-2 border border-red-100">
          <p className="text-sm font-semibold text-slate-700">Reset Attendance Records</p>
          <p className="text-xs text-slate-500">Deletes all time logs. Settings and holidays are kept.</p>
          <button onClick={handleResetAttendance} className="btn-danger w-full mt-1">
            Reset Attendance Only
          </button>
        </div>

        <div className="bg-white rounded-xl p-3 space-y-2 border border-red-100">
          <p className="text-sm font-semibold text-slate-700">Reset Everything</p>
          <p className="text-xs text-slate-500">Resets ALL data — attendance, settings, schedule, and holidays.</p>
          <button
            onClick={handleResetAll}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-white text-red-600 border-2 border-red-300 hover:bg-red-50 active:scale-95 transition-all"
          >
            Reset All Data
          </button>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
