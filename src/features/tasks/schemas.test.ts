import { describe, expect, it } from '@jest/globals';
import { taskInputSchema } from './schemas';

const valid = {
  title: 'Buy milk',
  description: null,
  startAt: null,
  endAt: null,
  allDay: false,
  estimateMinutes: null,
  recurrenceRule: null,
};

describe('taskInputSchema', () => {
  it('rejects a blank title', () => {
    expect(taskInputSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false);
  });

  it('rejects a deadline before the start and reports it on endAt', () => {
    const result = taskInputSchema.safeParse({
      ...valid,
      startAt: new Date(2026, 9, 1, 15),
      endAt: new Date(2026, 9, 1, 14),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['endAt']);
  });

  it('turns a blank description into null', () => {
    expect(taskInputSchema.parse({ ...valid, description: '  ' }).description).toBeNull();
  });
});
