export const DEFAULT_SETTINGS = {
  requiredHours: 486,
  studentName: '',
  startDate: '2026-02-02',
};

export const DEFAULT_SCHEDULE = [
  {
    id: 'phase1',
    label: 'OJT Schedule',
    startDate: '2026-02-02',
    endDate: null, // open-ended
    workDays: [1, 2, 3, 4, 5, 6, 7], // Mon–Sun (all days allowed)
    shiftStart: '07:00',
    shiftEnd: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    netDailyHours: 10,
  },
];
