import { addDays, startOfMonth, startOfWeek } from 'date-fns';

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEK_STARTS_ON: WeekStart = 0;

export function getMonthGrid(month: Date, weekStartsOn: WeekStart): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn });
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  );
}
