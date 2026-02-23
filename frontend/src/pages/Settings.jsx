import { useState } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import HolidayManager from '../components/HolidayManager';
import ScheduleManager from '../components/ScheduleManager';

export default function Settings() {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [holidays, setHolidays] = useLocalStorage(STORAGE_KEYS.HOLIDAYS, DEFAULT_HOLIDAYS);
  const [schedule, setSchedule] = useLocalStorage(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);

  const [infoDraft, setInfoDraft]   = useState(settings);
  const [infoSaved, setInfoSaved]   = useState(false);

  const handleSaveInfo = () => {
    setSettings(infoDraft);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2500);
  };

  const handleAddHoliday = (holiday) => {
    setHolidays((prev) => [...prev, holiday]);
  };

  const handleDeleteHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const handleResetAttendance = () => {
    if (
      window.confirm(
        'This will permanently delete ALL attendance records.\nYour settings and schedule will be kept.\n\nContinue?'
      )
    ) {
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      window.location.reload();
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        'This will reset EVERYTHING — attendance, settings, holidays, and schedule.\nThis cannot be undone.\n\nAre you sure?'
      )
    ) {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  return (
    <div className="pt-6 pb-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Student Information */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Student Information</h2>

        <div>
          <label className="label">Student Name</label>
          <input
            type="text"
            value={infoDraft.studentName}
            onChange={(e) =>
              setInfoDraft((d) => ({ ...d, studentName: e.target.value }))
            }
            placeholder="Your full name"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Required OJT Hours</label>
          <input
            type="number"
            value={infoDraft.requiredHours}
            onChange={(e) =>
              setInfoDraft((d) => ({ ...d, requiredHours: Number(e.target.value) }))
            }
            min={1}
            max={10000}
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">
            Default is 486 hours. Check with your school for the exact requirement.
          </p>
        </div>

        <div>
          <label className="label">OJT Start Date</label>
          <input
            type="date"
            value={infoDraft.startDate}
            onChange={(e) =>
              setInfoDraft((d) => ({ ...d, startDate: e.target.value }))
            }
            className="input-field"
          />
        </div>

        <button
          onClick={handleSaveInfo}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            infoSaved
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {infoSaved ? '✓ Saved!' : 'Save Information'}
        </button>
      </section>

      {/* Schedule Configuration */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">Schedule Configuration</h2>
        <ScheduleManager schedule={schedule} onUpdate={setSchedule} />
      </section>

      {/* Holidays */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">Holidays</h2>
        <p className="text-xs text-gray-400 mb-3">
          Holidays are excluded from working day calculations. Philippine 2026 holidays are pre-loaded.
        </p>
        <HolidayManager
          holidays={holidays}
          onAdd={handleAddHoliday}
          onDelete={handleDeleteHoliday}
        />
      </section>

      {/* App Info */}
      <section className="card bg-gray-50">
        <h2 className="font-semibold text-gray-700 mb-2 text-sm">About This App</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          All data is stored locally in your browser using localStorage. Clearing your browser data
          will erase all records. Use the export feature (if available) to back up your data.
        </p>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400 space-y-0.5">
          <p>Storage: Browser localStorage</p>
          <p>Version: 1.0.0</p>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="card border border-red-200">
        <h2 className="font-semibold text-red-700 mb-3">Danger Zone</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Reset Attendance Records</p>
            <p className="text-xs text-gray-500 mb-2">
              Deletes all time logs. Settings, schedule, and holidays are preserved.
            </p>
            <button onClick={handleResetAttendance} className="btn-danger w-full">
              Reset Attendance Only
            </button>
          </div>
          <div className="border-t border-red-100 pt-3">
            <p className="text-sm font-medium text-gray-700">Reset Everything</p>
            <p className="text-xs text-gray-500 mb-2">
              Resets all data including settings, schedule, holidays, and attendance.
            </p>
            <button
              onClick={handleResetAll}
              className="w-full py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-300"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
