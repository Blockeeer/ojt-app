export const DEFAULT_SETTINGS = {
  requiredHours: 486,
  studentName: '',
  startDate: '2026-02-02',
};

export const DEFAULT_SCHEDULE = [
  {
    id: 'phase1',
    label: 'Phase 1',
    startDate: '2026-02-02',
    endDate: '2026-03-27',
    workDays: [1, 2, 3, 4], // 1=Mon, 2=Tue, 3=Wed, 4=Thu (ISO day of week)
    shiftStart: '07:00',
    shiftEnd: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    netDailyHours: 10,
  },
  {
    id: 'phase2',
    label: 'Phase 2',
    startDate: '2026-03-28',
    endDate: null, // open-ended
    workDays: [1, 2, 3, 4, 5], // Mon–Fri
    shiftStart: '08:00',
    shiftEnd: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    netDailyHours: 8,
  },
];
