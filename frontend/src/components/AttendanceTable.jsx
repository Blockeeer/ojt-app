import { format } from 'date-fns';
import { formatDateShort, parseDate } from '../utils/dateHelpers';
import { formatTime12h } from '../utils/timeCalculator';

export default function AttendanceTable({ records, onEdit, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No attendance records yet.</p>
        <p className="text-xs mt-1">Use the form above to log your time.</p>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm min-w-[340px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
            <th className="text-center py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">In</th>
            <th className="text-center py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Out</th>
            <th className="text-center py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Hrs</th>
            <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((record) => {
            const isAbsent = !record.timeIn;
            const hrs = record.renderedHours || 0;
            return (
              <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-2">
                  <p className="font-medium text-gray-800">
                    {formatDateShort(parseDate(record.date))}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(parseDate(record.date), 'EEE')}
                  </p>
                </td>
                <td className="py-3 text-center text-gray-600">
                  {record.timeIn ? (
                    <span className="text-xs">{formatTime12h(record.timeIn)}</span>
                  ) : (
                    <span className="text-xs text-red-400 font-medium">Absent</span>
                  )}
                </td>
                <td className="py-3 text-center text-gray-600">
                  {record.timeOut ? (
                    <span className="text-xs">{formatTime12h(record.timeOut)}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`font-semibold text-sm ${
                      hrs > 0 ? 'text-emerald-600' : 'text-red-400'
                    }`}
                  >
                    {hrs > 0 ? `${hrs}h` : '0h'}
                  </span>
                </td>
                <td className="py-3 text-right space-x-3">
                  <button
                    onClick={() => onEdit(record)}
                    className="text-indigo-600 text-xs font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-red-500 text-xs font-medium hover:underline"
                  >
                    Del
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
