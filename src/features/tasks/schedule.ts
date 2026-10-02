import { endOfDay, format, isSameDay, startOfDay } from 'date-fns';

export type Schedulable = { startAt: Date | null; endAt: Date | null; allDay: boolean };
type Span = Pick<Schedulable, 'startAt' | 'endAt'>;
type WithStatus = Schedulable & { done: boolean };

function span(task: Span) {
  const first = task.startAt ?? task.endAt;
  const last = task.endAt ?? task.startAt;
  return first && last ? { first, last } : null;
}

export function normalizeAllDay<T extends Schedulable>(task: T): T {
  const range = span(task);
  if (!task.allDay || !range) return task;
  return { ...task, startAt: startOfDay(range.first), endAt: endOfDay(range.last) };
}

export function overlapsRange(task: Span, from: Date, to: Date): boolean {
  const range = span(task);
  if (!range) return false;
  return range.first.getTime() <= to.getTime() && range.last.getTime() >= from.getTime();
}

export function isScheduledOn(task: Span, day: Date): boolean {
  return overlapsRange(task, startOfDay(day), endOfDay(day));
}

export function isOverdue(task: WithStatus, now: Date): boolean {
  return !task.done && task.endAt !== null && task.endAt.getTime() < now.getTime();
}

const timeKey = (t: Span) => (t.startAt ?? t.endAt)?.getTime() ?? Number.POSITIVE_INFINITY;

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

type TodayCandidate = WithStatus & { id: string; recurring?: boolean; completedAt?: Date | null };

export function selectToday<T extends TodayCandidate>(
  tasks: T[],
  now: Date,
): { overdue: T[]; today: T[] } {
  const missed = tasks.filter((t) => isOverdue(t, now));

  const latestMissed = new Map<string, number>();
  for (const t of missed) {
    if (t.recurring) {
      latestMissed.set(t.id, Math.max(latestMissed.get(t.id) ?? 0, t.endAt?.getTime() ?? 0));
    }
  }
  const overdue = missed
    .filter((t) => !t.recurring || t.endAt?.getTime() === latestMissed.get(t.id))
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
