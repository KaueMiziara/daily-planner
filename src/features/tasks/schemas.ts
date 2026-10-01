import { z } from 'zod';

export const taskInputSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120),
    description: z.string().trim().max(2000).nullable(),
    startAt: z.date().nullable(),
    endAt: z.date().nullable(),
    allDay: z.boolean(),
    estimateMinutes: z
      .number()
      .int()
      .positive()
      .max(24 * 60)
      .nullable(),
    recurrenceRule: z.string().nullable(),
  })
  .refine((t) => !t.startAt || !t.endAt || t.endAt >= t.startAt, {
    message: 'The deadline must be after the start',
    path: ['endAt'],
  });

export type TaskInput = z.infer<typeof taskInputSchema>;
