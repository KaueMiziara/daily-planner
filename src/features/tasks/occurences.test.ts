import { describe, expect, it } from '@jest/globals';
import type { Task } from './db/schema';
import { buildOccurrences, SINGLE_OCCURRENCE } from './occurrences';

const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute);
const endOfDayAt = (day: number) => new Date(2026, 9, day, 23, 59, 59, 999);

const makeTask = (overrides: Partial<Task> & { id: string }): Task => ({
  title: 'Task',
  description: null,
  startAt: null,
  endAt: null,
  allDay: false,
  estimateMinutes: null,
  recurrenceRule: null,
  createdAt: at(1),
  updatedAt: at(1),
  deletedAt: null,
  ...overrides,
});

describe('buildOccurrences', () => {
  it('always includes one-off tasks, so old overdue ones are never lost', () => {
    const task = makeTask({ id: 't', endAt: at(1, 10) });
    const result = buildOccurrences([task], [], { from: at(20), to: endOfDayAt(25) }, at(21, 12));
    expect(result).toHaveLength(1);
    expect(result[0].occurrenceKey).toBe(SINGLE_OCCURRENCE);
    expect(result[0].overdue).toBe(true);
  });

  it('marks a one-off task done from its "single" completion', () => {
    const task = makeTask({ id: 't', startAt: at(5, 9) });
    const completions = [
      { taskId: 't', occurrenceDate: SINGLE_OCCURRENCE, completedAt: at(5, 9, 30) },
    ];
    const [occurrence] = buildOccurrences(
      [task],
      completions,
      { from: at(5), to: endOfDayAt(5) },
      at(5, 12),
    );
    expect(occurrence.done).toBe(true);
  });

  it('tracks completion and overdue per occurrence of a recurring task', () => {
    const task = makeTask({
      id: 't',
      startAt: at(5, 9),
      endAt: at(5, 10),
      recurrenceRule: 'FREQ=DAILY',
    });
    const completions = [{ taskId: 't', occurrenceDate: '2026-10-06', completedAt: at(6, 9, 30) }];

    const result = buildOccurrences(
      [task],
      completions,
      { from: at(5), to: endOfDayAt(7) },
      at(6, 12),
    );

    expect(result.map((o) => [o.key, o.done, o.overdue])).toEqual([
      ['t:2026-10-05', false, true], // missed
      ['t:2026-10-06', true, false], // completed
      ['t:2026-10-07', false, false], // still to come
    ]);
    expect(result[1].completedAt).toEqual(at(6, 9, 30));
  });
});
