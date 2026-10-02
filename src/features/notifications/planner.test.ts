import { describe, expect, it } from '@jest/globals';
import { planReminders, type ReminderSource } from './planner';

const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute);
const endOfDayAt = (day: number) => new Date(2026, 9, day, 23, 59, 59, 999);

const occ = (overrides: Partial<ReminderSource> = {}): ReminderSource => ({
  id: 't1',
  title: 'Task',
  startAt: null,
  endAt: null,
  allDay: false,
  done: false,
  occurrenceKey: 'single',
  ...overrides,
});

const now = at(5, 12);
const ids = (list: { id: string }[]) => list.map((r) => r.id);

describe('planReminders', () => {
  it('schedules a start and a due reminder for a timed task', () => {
    const result = planReminders([occ({ startAt: at(5, 14), endAt: at(5, 15) })], now);
    expect(result).toEqual([
      {
        id: 't1:single:start',
        taskId: 't1',
        kind: 'start',
        fireAt: at(5, 14),
        title: 'Task',
        body: 'Starting now',
      },
      {
        id: 't1:single:due',
        taskId: 't1',
        kind: 'due',
        fireAt: at(5, 15),
        title: 'Task',
        body: 'Due now',
      },
    ]);
  });

  it('skips past reminders, done occurrences and anything beyond the 7-day window', () => {
    const result = planReminders(
      [
        occ({ id: 'past', startAt: at(5, 9), endAt: at(5, 10) }),
        occ({ id: 'done', startAt: at(5, 14), done: true }),
        occ({ id: 'far', startAt: at(13, 9) }),
        occ({ id: 'running', startAt: at(5, 9), endAt: at(5, 13) }),
        occ({ id: 'edge', startAt: at(12, 12) }),
      ],
      now,
    );
    expect(ids(result)).toEqual(['running:single:due', 'edge:single:start']);
  });

  it('handles start-only, deadline-only and same-moment tasks', () => {
    const result = planReminders(
      [
        occ({ id: 'start-only', startAt: at(5, 13) }),
        occ({ id: 'deadline-only', endAt: at(5, 14) }),
        occ({ id: 'point', startAt: at(5, 15), endAt: at(5, 15) }),
      ],
      now,
    );
    expect(ids(result)).toEqual([
      'start-only:single:start',
      'deadline-only:single:due',
      'point:single:start',
    ]);
  });

  it('reminds all-day tasks once, at 9:00 on their first day', () => {
    const task = occ({ allDay: true, startAt: at(6, 0), endAt: endOfDayAt(7) });
    const result = planReminders([task], now);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: 'allDay',
      fireAt: at(6, 9),
      body: 'Planned for today',
    });
  });

  it('does not remind an all-day task whose 9:00 has already passed today', () => {
    const task = occ({ allDay: true, startAt: at(5, 0), endAt: endOfDayAt(5) });
    expect(planReminders([task], now)).toEqual([]);
    expect(planReminders([task], at(5, 7))).toHaveLength(1);
  });

  it('gives every occurrence of a recurring task its own reminder id', () => {
    const result = planReminders(
      [
        occ({ startAt: at(6, 9), occurrenceKey: '2026-10-06' }),
        occ({ startAt: at(7, 9), occurrenceKey: '2026-10-07' }),
      ],
      now,
    );
    expect(ids(result)).toEqual(['t1:2026-10-06:start', 't1:2026-10-07:start']);
  });

  it('orders by time and keeps only the soonest ones when over the limit', () => {
    const result = planReminders(
      [
        occ({ id: 'c', startAt: at(5, 15) }),
        occ({ id: 'a', startAt: at(5, 13) }),
        occ({ id: 'e', startAt: at(5, 17) }),
        occ({ id: 'b', startAt: at(5, 14) }),
        occ({ id: 'd', startAt: at(5, 16) }),
      ],
      now,
      3,
    );
    expect(ids(result)).toEqual(['a:single:start', 'b:single:start', 'c:single:start']);
  });
});
