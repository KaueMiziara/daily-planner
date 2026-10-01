import { describe, expect, it } from '@jest/globals';
import { isScheduledOn, normalizeAllDay, selectToday } from './schedule';

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

describe('isScheduledOn', () => {
  const day = at(5, 12);

  it('matches a task starting that day', () => {
    expect(isScheduledOn({ allDay: false, startAt: at(5, 9), endAt: at(5, 10) }, day)).toBe(true);
  });

  it('matches the middle day of a multi-day task', () => {
    expect(isScheduledOn({ allDay: false, startAt: at(3, 9), endAt: at(7, 18) }, day)).toBe(true);
  });

  it('uses the deadline day for a deadline-only task', () => {
    expect(isScheduledOn({ allDay: false, startAt: null, endAt: at(5, 18) }, day)).toBe(true);
    expect(isScheduledOn({ allDay: false, startAt: null, endAt: at(6, 18) }, day)).toBe(false);
  });

  it('does not match other days or undated tasks', () => {
    expect(isScheduledOn({ allDay: false, startAt: at(4, 9), endAt: at(4, 10) }, day)).toBe(false);
    expect(isScheduledOn({ allDay: false, startAt: null, endAt: null }, day)).toBe(false);
  });
});

describe('selectToday', () => {
  const task = (id: string, startAt: Date | null, done = false) => ({
    id,
    startAt,
    endAt: null,
    allDay: false,
    done,
  });

  it('keeps today and undated tasks, drops other days, orders pending by time and done last', () => {
    const result = selectToday(
      [
        task('late', at(5, 10)),
        task('early', at(5, 8)),
        task('anytime', null),
        task('tomorrow', at(6, 9)),
        task('finished', at(5, 7), true),
      ],
      at(5, 12),
    );
    expect(result.map((t) => t.id)).toEqual(['early', 'late', 'anytime', 'finished']);
  });
});
