import { useMemo } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import DashboardCards from '../components/DashboardCards';
import { summarizeAttendance, formatTime12h } from '../utils/timeCalculator';
import {
  getTodayStr,
  getPhaseForDate,
  isWorkingDay,
  projectCompletionDate,
  countExpectedWorkingDays,
  formatDateDisplay,
  formatDateShort,
  formatDayShort,
  parseDate,
} from '../utils/dateHelpers';

const DAY_NAMES = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };

export default function Dashboard() {
  const [settings]   = useLocalStorage(STORAGE_KEYS.SETTINGS,   DEFAULT_SETTINGS);
  const [attendance] = useLocalStorage(STORAGE_KEYS.ATTENDANCE,  []);
  const [holidays]   = useLocalStorage(STORAGE_KEYS.HOLIDAYS,    DEFAULT_HOLIDAYS);
  const [schedule]   = useLocalStorage(STORAGE_KEYS.SCHEDULE,    DEFAULT_SCHEDULE);

  const today         = getTodayStr();
  const todayPhase    = getPhaseForDate(today, schedule);
  const todayWorking  = isWorkingDay(today, schedule, holidays);
  const todayHoliday  = holidays.find((h) => h.date === today);

  const stats = useMemo(() => {
    const { totalRendered, totalDays } = summarizeAttendance(attendance);
    const remaining    = Math.max(0, settings.requiredHours - totalRendered);
    const percent      = Math.min((totalRendered / settings.requiredHours) * 100, 100);
    const projected    = projectCompletionDate(remaining, today, schedule, holidays);
    const daysLeft     = projected
      ? countExpectedWorkingDays(today, projected, schedule, holidays)
      : null;

    return {
      totalRendered:    Math.round(totalRendered * 100) / 100,
      remainingHours:   Math.round(remaining * 100) / 100,
      percentComplete:  percent,
      projectedEndDate: projected,
      daysRemaining:    daysLeft,
      totalDaysAttended: totalDays,
    };
  }, [attendance, settings, schedule, holidays, today]);

  const recentRecords = useMemo(
    () => [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [attendance]
  );

  const todayRecord = attendance.find((r) => r.date === today);

  return (
    <div className="pt-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">OJT Tracker</h1>
          {stats.percentComplete >= 100 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
              COMPLETE
            </span>
          )}
        </div>
        {settings.studentName && (
          <p className="text-sm text-gray-500 mt-0.5">Hello, {settings.studentName}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{formatDateDisplay(parseDate(today))}</p>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-600">
            {stats.percentComplete.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {stats.totalRendered}h rendered · {stats.remainingHours}h remaining · {settings.requiredHours}h total
        </p>
      </div>

      {/* Stats cards */}
      <DashboardCards
        totalRendered={stats.totalRendered}
        requiredHours={settings.requiredHours}
        remainingHours={stats.remainingHours}
        percentComplete={stats.percentComplete}
        projectedEndDate={stats.projectedEndDate}
        daysRemaining={stats.daysRemaining}
        totalDaysAttended={stats.totalDaysAttended}
      />

      {/* Today's schedule */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Today's Schedule</h2>
        {todayHoliday ? (
          <div className="flex items-start gap-2">
            <span className="text-lg">🎌</span>
            <div>
              <p className="font-medium text-gray-700">{todayHoliday.name}</p>
              <p className="text-xs text-gray-400 capitalize">{todayHoliday.type} holiday — no work today</p>
            </div>
          </div>
        ) : todayWorking && todayPhase ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {todayPhase.label}
              </span>
              <span className="text-xs text-gray-400">
                {todayPhase.workDays.map((d) => DAY_NAMES[d]).join(', ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Morning</p>
                <p className="font-medium text-gray-700">
                  {formatTime12h(todayPhase.shiftStart)} – {formatTime12h(todayPhase.lunchStart)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Afternoon</p>
                <p className="font-medium text-gray-700">
                  {formatTime12h(todayPhase.lunchEnd)} – {formatTime12h(todayPhase.shiftEnd)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <p className="text-xs text-amber-600">Lunch (deducted)</p>
                <p className="font-medium text-amber-700">
                  {formatTime12h(todayPhase.lunchStart)} – {formatTime12h(todayPhase.lunchEnd)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-xs text-emerald-600">Net Hours</p>
                <p className="font-bold text-emerald-700">{todayPhase.netDailyHours}h</p>
              </div>
            </div>
            {todayRecord ? (
              <div className="mt-2 bg-indigo-50 rounded-lg p-2 text-xs text-indigo-700">
                Logged today: {todayRecord.timeIn ? `${formatTime12h(todayRecord.timeIn)} – ${formatTime12h(todayRecord.timeOut)}` : 'Absent'} · {todayRecord.renderedHours}h
              </div>
            ) : (
              <p className="text-xs text-amber-600 mt-1">No attendance logged yet for today.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Today is a rest day — no scheduled work.</p>
        )}
      </div>

      {/* Recent activity */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Activity</h2>
        {recentRecords.length === 0 ? (
          <p className="text-sm text-gray-400">
            No records yet. Go to Attendance to log your time.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentRecords.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {formatDateShort(parseDate(r.date))}
                    <span className="ml-1.5 text-xs text-gray-400">
                      {formatDayShort(parseDate(r.date))}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.timeIn
                      ? `${formatTime12h(r.timeIn)} – ${formatTime12h(r.timeOut)}`
                      : 'Absent'}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    (r.renderedHours || 0) > 0 ? 'text-emerald-600' : 'text-red-400'
                  }`}
                >
                  {r.renderedHours ? `${r.renderedHours}h` : '0h'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
