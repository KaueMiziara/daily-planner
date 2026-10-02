import { describe, expect, it } from '@jest/globals';
import {
  expandOccurrences,
  parseRecurrence,
  serializeRecurrence,
  type Recurrence,
} from './recurrence';

const at = (day: number, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute);
const endOfDayAt = (day: number) => new Date(2026, 9, day, 23, 59, 59, 999);

// Monday 5 Oct 2026, 09:00-10:00, unless overridden.
const series = (
  rule: string | null,
  startAt: Date | null = at(5, 9),
  endAt: Date | null = at(5, 10),
  allDay = false,
) => ({ recurrenceRule: rule, startAt, endAt, allDay });
const keys = (list: { occurrenceKey: string }[]) => list.map((o) => o.occurrenceKey);

describe('serializeRecurrence / parseRecurrence', () => {
  it('writes standard RRULE strings', () => {
    expect(serializeRecurrence(null)).toBeNull();
    expect(serializeRecurrence({ freq: 'daily', interval: 1, weekdays: [] })).toBe('FREQ=DAILY');
    expect(serializeRecurrence({ freq: 'weekly', interval: 2, weekdays: [3, 1] })).toBe(
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE',
    );
  });

  it('round-trips every kind of preset', () => {
    const cases: Recurrence[] = [
      { freq: 'daily', interval: 1, weekdays: [] },
      { freq: 'daily', interval: 3, weekdays: [] },
      { freq: 'weekly', interval: 2, weekdays: [1, 3] },
      { freq: 'monthly', interval: 1, weekdays: [] },
    ];
    for (const recurrence of cases) {
      expect(parseRecurrence(serializeRecurrence(recurrence))).toEqual(recurrence);
    }
  });

  it('returns null for rules it cannot represent', () => {
    expect(parseRecurrence(null)).toBeNull();
    expect(parseRecurrence('FREQ=YEARLY')).toBeNull();
    expect(parseRecurrence('FREQ=DAILY;INTERVAL=0')).toBeNull();
    expect(parseRecurrence('FREQ=WEEKLY;BYDAY=XX')).toBeNull();
  });
});

describe('expandOccurrences', () => {
  it('repeats daily and keeps the time and duration', () => {
    const result = expandOccurrences(series('FREQ=DAILY'), at(5), endOfDayAt(7));
    expect(keys(result)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
    expect(result[1]).toEqual({ occurrenceKey: '2026-10-06', startAt: at(6, 9), endAt: at(6, 10) });
  });

  it('does not produce occurrences before the series starts', () => {
    const result = expandOccurrences(series('FREQ=DAILY'), at(1), endOfDayAt(6));
    expect(keys(result)).toEqual(['2026-10-05', '2026-10-06']);
  });

  it('only returns occurrences that overlap the requested range', () => {
    const result = expandOccurrences(series('FREQ=DAILY'), at(6), endOfDayAt(6));
    expect(keys(result)).toEqual(['2026-10-06']);
  });

  it('repeats weekly on the chosen weekdays', () => {
    const result = expandOccurrences(series('FREQ=WEEKLY;BYDAY=MO,WE'), at(5), endOfDayAt(18));
    expect(keys(result)).toEqual(['2026-10-05', '2026-10-07', '2026-10-12', '2026-10-14']);
  });

  it('honours the interval', () => {
    const result = expandOccurrences(
      series('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO'),
      at(5),
      new Date(2026, 10, 3),
    );
    expect(keys(result)).toEqual(['2026-10-05', '2026-10-19', '2026-11-02']);
  });

  it('skips months that do not have the day (monthly on the 31st)', () => {
    const result = expandOccurrences(
      series('FREQ=MONTHLY', new Date(2026, 0, 31, 9), new Date(2026, 0, 31, 10)),
      new Date(2026, 0, 1),
      new Date(2026, 3, 30),
    );
    expect(keys(result)).toEqual(['2026-01-31', '2026-03-31']);
  });

  it('keeps the span of a multi-day all-day task and finds it from its second day', () => {
    const task = series('FREQ=WEEKLY;BYDAY=MO', at(5), endOfDayAt(6), true);
    const result = expandOccurrences(task, at(13), endOfDayAt(13));
    expect(result).toEqual([
      { occurrenceKey: '2026-10-12', startAt: at(12), endAt: endOfDayAt(13) },
    ]);
  });

  it('repeats a deadline-only task by its deadline', () => {
    const result = expandOccurrences(series('FREQ=DAILY', null, at(5, 18)), at(6), endOfDayAt(6));
    expect(result).toEqual([{ occurrenceKey: '2026-10-06', startAt: null, endAt: at(6, 18) }]);
  });

  it('repeats a start-only task without inventing a deadline', () => {
    const result = expandOccurrences(series('FREQ=DAILY', at(5, 9), null), at(6), endOfDayAt(6));
    expect(result).toEqual([{ occurrenceKey: '2026-10-06', startAt: at(6, 9), endAt: null }]);
  });

  it('returns nothing without a rule or a date', () => {
    expect(expandOccurrences(series(null), at(1), endOfDayAt(30))).toEqual([]);
    expect(expandOccurrences(series('FREQ=DAILY', null, null), at(1), endOfDayAt(30))).toEqual([]);
  });
});
