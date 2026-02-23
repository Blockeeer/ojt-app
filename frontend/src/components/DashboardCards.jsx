import { formatDateShort, parseDate } from '../utils/dateHelpers';

const CARD_CONFIG = (props) => [
  {
    label: 'Hours Rendered',
    value: `${props.totalRendered}h`,
    sub: `of ${props.requiredHours}h required`,
    icon: '⏱',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    valueColor: 'text-indigo-700',
    subColor: 'text-indigo-400',
  },
  {
    label: 'Remaining',
    value: `${props.remainingHours}h`,
    sub: 'hours to finish',
    icon: '🎯',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    valueColor: 'text-amber-700',
    subColor: 'text-amber-400',
  },
  {
    label: 'Progress',
    value: `${props.percentComplete.toFixed(1)}%`,
    sub: 'completion rate',
    icon: '📈',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
    valueColor: 'text-emerald-700',
    subColor: 'text-emerald-400',
  },
  {
    label: 'Finish Date',
    value: props.projectedEndDate
      ? formatDateShort(parseDate(props.projectedEndDate))
      : 'N/A',
    sub: props.daysRemaining != null
      ? `${props.daysRemaining} days left`
      : 'OJT Complete!',
    icon: '📅',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    valueColor: 'text-violet-700',
    subColor: 'text-violet-400',
  },
  {
    label: 'Days Present',
    value: String(props.totalDaysAttended),
    sub: 'working days logged',
    icon: '✅',
    gradient: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-50',
    valueColor: 'text-sky-700',
    subColor: 'text-sky-400',
  },
];

export default function DashboardCards({
  totalRendered,
  requiredHours,
  remainingHours,
  percentComplete,
  projectedEndDate,
  daysRemaining,
  totalDaysAttended,
}) {
  const cards = CARD_CONFIG({
    totalRendered, requiredHours, remainingHours,
    percentComplete, projectedEndDate, daysRemaining, totalDaysAttended,
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, sub, icon, bg, valueColor, subColor }) => (
        <div key={label} className={`${bg} rounded-2xl p-4 relative overflow-hidden`}>
          {/* Icon */}
          <div className="text-2xl mb-2 leading-none">{icon}</div>
          {/* Label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            {label}
          </p>
          {/* Value */}
          <p className={`text-xl font-extrabold ${valueColor} leading-tight`}>{value}</p>
          {/* Sub */}
          <p className={`text-[11px] font-medium mt-0.5 ${subColor}`}>{sub}</p>
        </div>
      ))}
    </div>
  );
}
