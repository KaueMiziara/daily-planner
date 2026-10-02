import { addDays, set, startOfDay } from 'date-fns';
import type { TaskOccurrence } from '@/features/tasks';

export const REMINDER_HORIZON_DAYS = 7;
export const MAX_REMINDERS = 60;
export const ALL_DAY_REMINDER_HOUR = 9;

export type ReminderKind = 'start' | 'due' | 'allDay';

export type PlannedReminder = {
  id: string;
  taskId: string;
  kind: ReminderKind;
  fireAt: Date;
  title: string;
  body: string;
};

export type ReminderSource = Pick<
  TaskOccurrence,
  'id' | 'title' | 'startAt' | 'endAt' | 'allDay' | 'done' | 'occurrenceKey'
>;

type Candidate = Pick<PlannedReminder, 'kind' | 'fireAt' | 'body'>;

function candidatesFor(o: ReminderSource): Candidate[] {
  if (o.allDay) {
    const day = o.startAt ?? o.endAt;
    if (!day) return [];
    return [
      {
        kind: 'allDay',
        fireAt: set(startOfDay(day), { hours: ALL_DAY_REMINDER_HOUR }),
        body: 'Planned for today',
      },
    ];
  }

  const result: Candidate[] = [];
  if (o.startAt) result.push({ kind: 'start', fireAt: o.startAt, body: 'Starting now' });
  if (o.endAt && o.endAt.getTime() !== o.startAt?.getTime()) {
    result.push({ kind: 'due', fireAt: o.endAt, body: 'Due now' });
  }
  return result;
}

export function planReminders(
  occurrences: ReminderSource[],
  now: Date,
  limit = MAX_REMINDERS,
): PlannedReminder[] {
  const horizon = addDays(now, REMINDER_HORIZON_DAYS).getTime();

  return occurrences
    .filter((o) => !o.done)
    .flatMap((o) =>
      candidatesFor(o).map((c): PlannedReminder => ({
        ...c,
        id: `${o.id}:${o.occurrenceKey}:${c.kind}`,
        taskId: o.id,
        title: o.title,
      })),
    )
    .filter((r) => r.fireAt.getTime() > now.getTime() && r.fireAt.getTime() <= horizon)
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime() || a.id.localeCompare(b.id))
    .slice(0, limit);
}
