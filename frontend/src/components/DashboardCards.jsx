import { formatDateShort, parseDate } from '../utils/dateHelpers';

const CARD_CONFIG = (props) => [
  {
    label: 'Hours Rendered',
    value: `${props.totalRendered}h`,
    sub: `of ${props.requiredHours}h required`,
    icon: '⏱',
    bg: 'bg-sky-50',
    valueColor: 'text-sky-700',
    subColor: 'text-sky-400',
  },
  {
    label: 'Remaining',
    value: `${props.remainingHours}h`,
    sub: 'hours to finish',
    icon: '🎯',
    bg: 'bg-amber-50',
    valueColor: 'text-amber-700',
    subColor: 'text-amber-400',
  },
  {
    label: 'Progress',
    value: `${props.percentComplete.toFixed(1)}%`,
    sub: 'completion rate',
    icon: '📈',
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
    bg: 'bg-blue-50',
    valueColor: 'text-blue-700',
    subColor: 'text-blue-400',
  },
  {
    label: 'Days Present',
    value: String(props.totalDaysAttended),
    sub: 'working days logged',
    icon: '✅',
    bg: 'bg-cyan-50',
    valueColor: 'text-cyan-700',
    subColor: 'text-cyan-400',
  },
];

export default function DashboardCards({
  totalRendered, requiredHours, remainingHours,
  percentComplete, projectedEndDate, daysRemaining, totalDaysAttended,
}) {
  const cards = CARD_CONFIG({
    totalRendered, requiredHours, remainingHours,
    percentComplete, projectedEndDate, daysRemaining, totalDaysAttended,
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, sub, icon, bg, valueColor, subColor }) => (
        <div key={label} className={`${bg} rounded-2xl p-4 relative overflow-hidden border border-white`}>
          <div className="text-2xl mb-2 leading-none">{icon}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
          <p className={`text-xl font-extrabold ${valueColor} leading-tight`}>{value}</p>
          <p className={`text-[11px] font-medium mt-0.5 ${subColor}`}>{sub}</p>
        </div>
      ))}
    </div>
  );
}
