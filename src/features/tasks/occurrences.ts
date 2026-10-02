import type { Task } from './db/schema';
import { expandOccurrences, type Expanded } from './recurrence';
import { isOverdue } from './schedule';

export const SINGLE_OCCURRENCE = 'single';

export type CompletionRow = { taskId: string; occurrenceDate: string; completedAt: Date };

export type TaskOccurrence = Task & {
  key: string;
  occurrenceKey: string;
  recurring: boolean;
  done: boolean;
  completedAt: Date | null;
  overdue: boolean;
};

export function buildOccurrences(
  tasks: Task[],
  completions: CompletionRow[],
  range: { from: Date; to: Date },
  now: Date,
): TaskOccurrence[] {
  const completedAt = new Map<string, Date>(
    completions.map((c): [string, Date] => [`${c.taskId}:${c.occurrenceDate}`, c.completedAt]),
  );

  const result: TaskOccurrence[] = [];
  for (const task of tasks) {
    const occurrences: Expanded[] = task.recurrenceRule
      ? expandOccurrences(task, range.from, range.to)
      : [{ occurrenceKey: SINGLE_OCCURRENCE, startAt: task.startAt, endAt: task.endAt }];

    for (const occurrence of occurrences) {
      const key = `${task.id}:${occurrence.occurrenceKey}`;
      const doneAt = completedAt.get(key) ?? null;
      const done = doneAt !== null;
      const dated = { ...task, startAt: occurrence.startAt, endAt: occurrence.endAt };
      result.push({
        ...dated,
        key,
        occurrenceKey: occurrence.occurrenceKey,
        recurring: Boolean(task.recurrenceRule),
        done,
        completedAt: doneAt,
        overdue: isOverdue({ ...dated, done }, now),
      });
    }
  }
  return result;
}
