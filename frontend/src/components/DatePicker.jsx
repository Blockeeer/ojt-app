export default function DatePicker({ value, onChange, min, max, label, isWorkingDay }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pr-28"
        />
        {value && isWorkingDay !== undefined && (
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none ${
            isWorkingDay
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {isWorkingDay ? '✓ Work Day' : '✗ Rest Day'}
          </span>
        )}
      </div>
    </div>
  );
}
