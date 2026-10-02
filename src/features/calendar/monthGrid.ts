import { addDays, startOfMonth, startOfWeek } from 'date-fns';
import type { WeekStart } from '@/utils/week';

export function getMonthGrid(month: Date, weekStartsOn: WeekStart): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn });
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  );
}
