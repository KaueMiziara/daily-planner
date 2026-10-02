import { z } from 'zod';

export const taskInputSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description is too long')
      .nullable()
      .transform((v) => v || null),
    startAt: z.date().nullable(),
    endAt: z.date().nullable(),
    allDay: z.boolean(),
    estimateMinutes: z
      .number()
      .int()
      .positive('Must be greater than 0')
      .max(24 * 60, 'Must be under 24 hours')
      .nullable(),
    recurrenceRule: z.string().nullable(),
  })
  .refine((t) => !t.startAt || !t.endAt || t.endAt >= t.startAt, {
    message: 'The deadline must be after the start',
    path: ['endAt'],
  })
  .refine((t) => !t.recurrenceRule || Boolean(t.startAt ?? t.endAt), {
    message: 'Set a start or due date to repeat this task',
    path: ['recurrenceRule'],
  });

export type TaskFormInput = z.input<typeof taskInputSchema>;
export type TaskInput = z.output<typeof taskInputSchema>;
