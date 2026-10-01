import { describe, expect, it } from '@jest/globals';
import { getMonthGrid } from './monthGrid';

describe('getMonthGrid', () => {
  it('always returns 6 weeks of 7 days', () => {
    for (const month of [new Date(2026, 1, 1), new Date(2026, 9, 1), new Date(2027, 1, 1)]) {
      const grid = getMonthGrid(month, 0);
      expect(grid).toHaveLength(6);
      grid.forEach((week) => expect(week).toHaveLength(7));
    }
  });

  it('starts on the configured weekday, including days of the previous month', () => {
    expect(getMonthGrid(new Date(2026, 9, 15), 0)[0][0]).toEqual(new Date(2026, 8, 27));
    expect(getMonthGrid(new Date(2026, 9, 15), 1)[0][0]).toEqual(new Date(2026, 8, 28));
  });

  it('has no leading days when the month starts on the first weekday', () => {
    expect(getMonthGrid(new Date(2026, 1, 10), 0)[0][0]).toEqual(new Date(2026, 1, 1));
  });

  it('contains every day of the month exactly once, in order', () => {
    const october = getMonthGrid(new Date(2026, 9, 15), 0)
      .flat()
      .filter((d) => d.getMonth() === 9);
    expect(october.map((d) => d.getDate())).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });
});
