import { describe, expect, it } from '@jest/globals';
import {
  isOverdue,
  isScheduledOn,
  normalizeAllDay,
  overlapsRange,
  selectForDay,
  selectToday,
  summarizeDays,
  toDayKey,
} from './schedule';

const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute);

describe('normalizeAllDay', () => {
  it('stretches an all-day task to cover whole days', () => {
    const result = normalizeAllDay({ allDay: true, startAt: at(1, 14, 30), endAt: at(2, 9) });
    expect(result.startAt).toEqual(at(1, 0, 0));
    expect(result.endAt).toEqual(new Date(2026, 9, 2, 23, 59, 59, 999));
  });

  it('gives a start-only all-day task a deadline at the end of that day', () => {
    const result = normalizeAllDay({ allDay: true, startAt: at(1, 14), endAt: null });
    expect(result.endAt).toEqual(new Date(2026, 9, 1, 23, 59, 59, 999));
  });

  it('leaves timed tasks untouched', () => {
    const task = { allDay: false, startAt: at(1, 14, 30), endAt: at(1, 15) };
    expect(normalizeAllDay(task)).toEqual(task);
  });
});

describe('overlapsRange', () => {
  const from = at(5, 10);
  const to = at(5, 11);

  it('treats the range ends as inclusive', () => {
    expect(overlapsRange({ startAt: at(5, 9), endAt: at(5, 10) }, from, to)).toBe(true);
    expect(overlapsRange({ startAt: at(5, 11), endAt: at(5, 12) }, from, to)).toBe(true);
  });

  it('rejects tasks that end just before or start just after the range', () => {
    expect(overlapsRange({ startAt: at(5, 9), endAt: at(5, 9, 59) }, from, to)).toBe(false);
    expect(overlapsRange({ startAt: at(5, 11, 1), endAt: at(5, 12) }, from, to)).toBe(false);
  });

  it('matches a task that fully contains the range, and a point task inside it', () => {
    expect(overlapsRange({ startAt: at(5, 8), endAt: at(5, 20) }, from, to)).toBe(true);
    expect(overlapsRange({ startAt: at(5, 10, 30), endAt: null }, from, to)).toBe(true);
  });

  it('never matches an undated task', () => {
    expect(overlapsRange({ startAt: null, endAt: null }, from, to)).toBe(false);
  });
});

describe('isScheduledOn', () => {
  const day = at(5, 12);

  it('matches a task starting that day', () => {
    expect(isScheduledOn({ startAt: at(5, 9), endAt: at(5, 10) }, day)).toBe(true);
  });

  it('matches the middle day of a multi-day task', () => {
    expect(isScheduledOn({ startAt: at(3, 9), endAt: at(7, 18) }, day)).toBe(true);
  });

  it('uses the deadline day for a deadline-only task', () => {
    expect(isScheduledOn({ startAt: null, endAt: at(5, 18) }, day)).toBe(true);
    expect(isScheduledOn({ startAt: null, endAt: at(6, 18) }, day)).toBe(false);
  });

  it('does not match other days or undated tasks', () => {
    expect(isScheduledOn({ startAt: at(4, 9), endAt: at(4, 10) }, day)).toBe(false);
    expect(isScheduledOn({ startAt: null, endAt: null }, day)).toBe(false);
  });
});

describe('isOverdue', () => {
  const task = { allDay: false, startAt: at(5, 9), endAt: at(5, 10), done: false };

  it('is not overdue until the deadline has actually passed', () => {
    expect(isOverdue(task, at(5, 10))).toBe(false);
    expect(isOverdue(task, at(5, 10, 1))).toBe(true);
  });

  it('is never overdue once done', () => {
    expect(isOverdue({ ...task, done: true }, at(9))).toBe(false);
  });

  it('does not treat a start time as a deadline', () => {
    expect(isOverdue({ ...task, endAt: null, done: false }, at(9))).toBe(false);
  });

  it('only makes an all-day task overdue after its day ends', () => {
    const allDay = normalizeAllDay({ allDay: true, startAt: at(5, 8), endAt: null, done: false });
    expect(isOverdue(allDay, at(5, 23, 30))).toBe(false);
    expect(isOverdue(allDay, at(6, 0, 1))).toBe(true);
  });
});

describe('selectToday', () => {
  const task = (
    id: string,
    startAt: Date | null,
    extra: Partial<{ endAt: Date | null; done: boolean; completedAt: Date | null }> = {},
  ) => ({
    id,
    startAt,
    endAt: null as Date | null,
    allDay: false,
    done: false,
    completedAt: null as Date | null,
    ...extra,
  });
  const now = at(5, 12);
  const ids = (list: { id: string }[]) => list.map((t) => t.id);

  it('splits overdue from today, oldest overdue first', () => {
    const { overdue, today } = selectToday(
      [
        task('overdue-new', null, { endAt: at(4, 10) }),
        task('overdue-old', null, { endAt: at(3, 10) }),
        task('later', at(5, 15)),
        task('early', at(5, 8)),
      ],
      now,
    );
    expect(ids(overdue)).toEqual(['overdue-old', 'overdue-new']);
    expect(ids(today)).toEqual(['early', 'later']);
  });

  it('lists a task whose deadline passed earlier today as overdue, not as today', () => {
    const { overdue, today } = selectToday([task('missed', at(5, 8), { endAt: at(5, 9) })], now);
    expect(ids(overdue)).toEqual(['missed']);
    expect(today).toEqual([]);
  });

  it("sinks today's finished tasks and drops other days, even finished ones", () => {
    const { overdue, today } = selectToday(
      [
        task('finished', at(5, 7), { done: true }),
        task('pending', at(5, 9)),
        task('yesterday-done', at(4, 9), { done: true }),
        task('tomorrow', at(6, 9)),
      ],
      now,
    );
    expect(overdue).toEqual([]);
    expect(ids(today)).toEqual(['pending', 'finished']);
  });

  it('keeps pending undated tasks, and finished ones only on their completion day', () => {
    const { today } = selectToday(
      [
        task('pending', null),
        task('done-today', null, { done: true, completedAt: at(5, 9) }),
        task('done-before', null, { done: true, completedAt: at(2, 9) }),
      ],
      now,
    );
    expect(ids(today)).toEqual(['pending', 'done-today']);
  });

  it('shows only the latest missed occurrence of a recurring task', () => {
    const missed = (day: number) => ({
      ...task('daily', at(day, 9), { endAt: at(day, 10) }),
      recurring: true,
    });
    const { overdue } = selectToday([missed(2), missed(3), missed(4)], now);
    expect(overdue.map((t) => t.startAt)).toEqual([at(4, 9)]);
  });
});

describe('selectForDay', () => {
  it('includes multi-day tasks on each of their days and skips undated ones', () => {
    const task = (id: string, startAt: Date | null, endAt: Date | null, done = false) => ({
      id,
      startAt,
      endAt,
      allDay: false,
      done,
    });
    const result = selectForDay(
      [
        task('finished', at(5, 7), at(5, 8), true),
        task('morning', at(5, 8), at(5, 9)),
        task('spanning', at(3, 9), at(7, 18)),
        task('other-day', at(6, 9), at(6, 10)),
        task('undated', null, null),
      ],
      at(5, 12),
    );
    expect(result.map((t) => t.id)).toEqual(['spanning', 'morning', 'finished']);
  });
});

describe('summarizeDays', () => {
  const task = (startAt: Date, endAt: Date, done: boolean, overdue: boolean) => ({
    startAt,
    endAt,
    allDay: false,
    done,
    overdue,
  });

  it('counts each task on every day it covers and leaves empty days out', () => {
    const summary = summarizeDays(
      [
        task(at(4, 9), at(6, 18), false, false),
        task(at(4, 8), at(4, 9), false, true),
        task(at(5, 10), at(5, 11), true, false),
      ],
      [at(3), at(4), at(5), at(6), at(7)],
    );
    expect(summary.get(toDayKey(at(3)))).toBeUndefined();
    expect(summary.get(toDayKey(at(4)))).toEqual({ pending: 2, done: 0, overdue: 1 });
    expect(summary.get(toDayKey(at(5)))).toEqual({ pending: 1, done: 1, overdue: 0 });
    expect(summary.get(toDayKey(at(6)))).toEqual({ pending: 1, done: 0, overdue: 0 });
    expect(summary.get(toDayKey(at(7)))).toBeUndefined();
  });
});
