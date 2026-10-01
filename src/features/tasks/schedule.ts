import { endOfDay, startOfDay } from 'date-fns';

export type Schedulable = { startAt: Date | null; endAt: Date | null; allDay: boolean };

function span(task: Schedulable) {
  const first = task.startAt ?? task.endAt;
  const last = task.endAt ?? task.startAt;
  return first && last ? { first, last } : null;
}

export function normalizeAllDay<T extends Schedulable>(task: T): T {
  const range = span(task);
  if (!task.allDay || !range) return task;
  return { ...task, startAt: startOfDay(range.first), endAt: endOfDay(range.last) };
}

export function isScheduledOn(task: Schedulable, day: Date): boolean {
  const range = span(task);
  if (!range) return false;
  return (
    range.first.getTime() <= endOfDay(day).getTime() &&
    range.last.getTime() >= startOfDay(day).getTime()
  );
}

export function selectToday<T extends Schedulable & { done: boolean }>(tasks: T[], now: Date): T[] {
  const sortKey = (t: T) => (t.startAt ?? t.endAt)?.getTime() ?? Number.POSITIVE_INFINITY;
  return tasks
    .filter((t) => span(t) === null || isScheduledOn(t, now))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const ka = sortKey(a);
      const kb = sortKey(b);
      return ka === kb ? 0 : ka < kb ? -1 : 1;
    });
}
