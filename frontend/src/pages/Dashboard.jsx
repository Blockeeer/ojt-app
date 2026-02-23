import { useMemo } from 'react';
import { useLocalStorage, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from '../data/defaults';
import { DEFAULT_HOLIDAYS } from '../data/philippineHolidays';
import DashboardCards from '../components/DashboardCards';
import { summarizeAttendance, formatTime12h } from '../utils/timeCalculator';
import {
  getTodayStr, getPhaseForDate, isWorkingDay,
  projectCompletionDate, countExpectedWorkingDays,
  formatDateDisplay, formatDateShort, formatDayShort, parseDate,
} from '../utils/dateHelpers';

const DAY_NAMES = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };

export default function Dashboard() {
  const [settings]   = useLocalStorage(STORAGE_KEYS.SETTINGS,  DEFAULT_SETTINGS);
  const [attendance] = useLocalStorage(STORAGE_KEYS.ATTENDANCE, []);
  const [holidays]   = useLocalStorage(STORAGE_KEYS.HOLIDAYS,   DEFAULT_HOLIDAYS);
  const [schedule]   = useLocalStorage(STORAGE_KEYS.SCHEDULE,   DEFAULT_SCHEDULE);

  const today        = getTodayStr();
  const todayPhase   = getPhaseForDate(today, schedule);
  const todayWorking = isWorkingDay(today, schedule, holidays);
  const todayHoliday = holidays.find((h) => h.date === today);

  const stats = useMemo(() => {
    const { totalRendered, totalDays } = summarizeAttendance(attendance);
    const remaining  = Math.max(0, settings.requiredHours - totalRendered);
    const percent    = Math.min((totalRendered / settings.requiredHours) * 100, 100);
    const projected  = projectCompletionDate(remaining, today, schedule, holidays);
    const daysLeft   = projected ? countExpectedWorkingDays(today, projected, schedule, holidays) : null;
    return {
      totalRendered:     Math.round(totalRendered * 100) / 100,
      remainingHours:    Math.round(remaining * 100) / 100,
      percentComplete:   percent,
      projectedEndDate:  projected,
      daysRemaining:     daysLeft,
      totalDaysAttended: totalDays,
    };
  }, [attendance, settings, schedule, holidays, today]);

  const recentRecords = useMemo(
    () => [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [attendance]
  );

  const todayRecord = attendance.find((r) => r.date === today);
  const isComplete  = stats.percentComplete >= 100;

  return (
    <div className="space-y-5">

      {/* ── Hero Header ── */}
      <div className="relative -mx-4 px-4 pt-10 pb-8 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sky-100 text-sm font-medium">{formatDateDisplay(parseDate(today))}</p>
              <h1 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                {settings.studentName ? `Hi, ${settings.studentName.split(' ')[0]}` : 'OJT Tracker'}
              </h1>
            </div>
            {isComplete && (
              <span className="bg-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                COMPLETE
              </span>
            )}
          </div>

          <div className="mt-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sky-100 text-xs font-semibold">Overall Progress</span>
              <span className="text-white text-sm font-extrabold">{stats.percentComplete.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>
            <p className="text-sky-100 text-xs mt-2">
              {stats.totalRendered}h rendered · {stats.remainingHours}h remaining · {settings.requiredHours}h total
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <DashboardCards
        totalRendered={stats.totalRendered}
        requiredHours={settings.requiredHours}
        remainingHours={stats.remainingHours}
        percentComplete={stats.percentComplete}
        projectedEndDate={stats.projectedEndDate}
        daysRemaining={stats.daysRemaining}
        totalDaysAttended={stats.totalDaysAttended}
      />

      {/* ── Today's Schedule ── */}
      <div>
        <p className="section-title">Today's Schedule</p>
        <div className="card">
          {todayHoliday ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">
                🎌
              </div>
              <div>
                <p className="font-bold text-slate-800">{todayHoliday.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{todayHoliday.type} holiday — rest day</p>
              </div>
            </div>
          ) : todayWorking && todayPhase ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-blue">{todayPhase.label}</span>
                <span className="text-xs text-slate-400">
                  {todayPhase.workDays.map((d) => DAY_NAMES[d]).join(' · ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-sky-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">Morning</p>
                  <p className="text-sm font-bold text-sky-700">
                    {formatTime12h(todayPhase.shiftStart)} – {formatTime12h(todayPhase.lunchStart)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Afternoon</p>
                  <p className="text-sm font-bold text-blue-700">
                    {formatTime12h(todayPhase.lunchEnd)} – {formatTime12h(todayPhase.shiftEnd)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Lunch Break</p>
                  <p className="text-sm font-bold text-amber-700">
                    {formatTime12h(todayPhase.lunchStart)} – {formatTime12h(todayPhase.lunchEnd)}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Net Hours</p>
                  <p className="text-2xl font-extrabold text-emerald-600">{todayPhase.netDailyHours}h</p>
                </div>
              </div>

              {todayRecord ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Logged today</p>
                    <p className="text-xs text-emerald-600">
                      {todayRecord.timeIn
                        ? `${formatTime12h(todayRecord.timeIn)} – ${formatTime12h(todayRecord.timeOut)} · ${todayRecord.renderedHours}h`
                        : 'Marked absent'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">!</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-700">No attendance logged yet for today.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                😴
              </div>
              <div>
                <p className="font-bold text-slate-700">Rest Day</p>
                <p className="text-xs text-slate-400 mt-0.5">No scheduled work today.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <p className="section-title">Recent Activity</p>
        <div className="card">
          {recentRecords.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-semibold text-slate-500">No records yet</p>
              <p className="text-xs text-slate-400 mt-1">Go to Attendance to log your time.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentRecords.map((r) => {
                const hrs = r.renderedHours || 0;
                return (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${hrs > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {formatDateShort(parseDate(r.date))}
                          <span className="ml-1.5 text-xs font-medium text-slate-400">
                            {formatDayShort(parseDate(r.date))}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.timeIn ? `${formatTime12h(r.timeIn)} – ${formatTime12h(r.timeOut)}` : 'Absent'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold px-2.5 py-1 rounded-xl ${
                      hrs > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {hrs > 0 ? `${hrs}h` : '0h'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
