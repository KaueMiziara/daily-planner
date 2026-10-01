import { endOfDay, format, isSameDay, startOfDay } from 'date-fns';

export type Schedulable = { startAt: Date | null; endAt: Date | null; allDay: boolean };
type WithStatus = Schedulable & { done: boolean };

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

export function isOverdue(task: WithStatus, now: Date): boolean {
  return !task.done && task.endAt !== null && task.endAt.getTime() < now.getTime();
}

const timeKey = (t: Schedulable) => (t.startAt ?? t.endAt)?.getTime() ?? Number.POSITIVE_INFINITY;

function byPendingThenTime(a: WithStatus, b: WithStatus): number {
  if (a.done !== b.done) return a.done ? 1 : -1;
  const ka = timeKey(a);
  const kb = timeKey(b);
  return ka === kb ? 0 : ka < kb ? -1 : 1;
}

function belongsToday(task: WithStatus & { completedAt?: Date | null }, now: Date): boolean {
  if (span(task) === null) {
    return !task.done || (task.completedAt != null && isSameDay(task.completedAt, now));
  }
  return isScheduledOn(task, now);
}

export function selectToday<T extends WithStatus & { completedAt?: Date | null }>(
  tasks: T[],
  now: Date,
): { overdue: T[]; today: T[] } {
  const overdue = tasks
    .filter((t) => isOverdue(t, now))
    .sort((a, b) => (a.endAt?.getTime() ?? 0) - (b.endAt?.getTime() ?? 0));
  const today = tasks
    .filter((t) => !isOverdue(t, now) && belongsToday(t, now))
    .sort(byPendingThenTime);
  return { overdue, today };
}

export function selectForDay<T extends WithStatus>(tasks: T[], day: Date): T[] {
  return tasks.filter((t) => isScheduledOn(t, day)).sort(byPendingThenTime);
}

export type DaySummary = { pending: number; done: number; overdue: number };

export const toDayKey = (day: Date) => format(day, 'yyyy-MM-dd');

export function summarizeDays<T extends WithStatus & { overdue: boolean }>(
  tasks: T[],
  days: Date[],
): Map<string, DaySummary> {
  const result = new Map<string, DaySummary>();
  for (const day of days) {
    const summary: DaySummary = { pending: 0, done: 0, overdue: 0 };
    for (const task of tasks) {
      if (!isScheduledOn(task, day)) continue;
      if (task.done) summary.done += 1;
      else summary.pending += 1;
      if (task.overdue) summary.overdue += 1;
    }
    if (summary.pending + summary.done > 0) result.set(toDayKey(day), summary);
  }
  return result;
}
