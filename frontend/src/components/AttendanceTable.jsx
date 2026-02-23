import { format } from 'date-fns';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { formatTime12h } from '../utils/timeCalculator';

export default function AttendanceTable({ records, onEdit, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">No records yet</p>
        <p className="text-xs text-slate-400 mt-1">Use the form above to log your time.</p>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((record) => {
        const hrs = record.renderedHours || 0;
        const isAbsent = !record.timeIn;
        return (
          <div
            key={record.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              isAbsent
                ? 'bg-red-50 border-red-100'
                : 'bg-slate-50 border-slate-100 hover:bg-white'
            }`}
          >
            {/* Left color indicator */}
            <div className={`w-1 h-10 rounded-full shrink-0 ${hrs > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />

            {/* Date info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {formatDateShort(parseDate(record.date))}
                <span className="ml-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {format(parseDate(record.date), 'EEE')}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {record.timeIn
                  ? `${formatTime12h(record.timeIn)} – ${formatTime12h(record.timeOut)}`
                  : 'Absent'}
              </p>
            </div>

            {/* Hours badge */}
            <span className={`text-sm font-extrabold px-2.5 py-1 rounded-xl shrink-0 ${
              hrs > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}>
              {hrs > 0 ? `${hrs}h` : '0h'}
            </span>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(record)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(record.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
