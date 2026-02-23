import { formatDateShort, parseDate } from '../utils/dateHelpers';

const CARDS = (props) => [
  {
    label: 'Hours Rendered',
    value: `${props.totalRendered}h`,
    sub: `of ${props.requiredHours}h required`,
    valueColor: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    label: 'Hours Remaining',
    value: `${props.remainingHours}h`,
    sub: 'to complete OJT',
    valueColor: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    label: 'Progress',
    value: `${props.percentComplete.toFixed(1)}%`,
    sub: 'completion rate',
    valueColor: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    label: 'Projected End',
    value: props.projectedEndDate
      ? formatDateShort(parseDate(props.projectedEndDate))
      : 'N/A',
    sub: props.daysRemaining != null
      ? `~${props.daysRemaining} working days left`
      : 'Complete!',
    valueColor: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    label: 'Days Attended',
    value: props.totalDaysAttended,
    sub: 'total working days',
    valueColor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
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
  const cards = CARDS({
    totalRendered,
    requiredHours,
    remainingHours,
    percentComplete,
    projectedEndDate,
    daysRemaining,
    totalDaysAttended,
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, sub, valueColor, bg, border }) => (
        <div key={label} className={`rounded-xl p-4 border ${bg} ${border}`}>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{sub}</p>
        </div>
      ))}
    </div>
  );
}
