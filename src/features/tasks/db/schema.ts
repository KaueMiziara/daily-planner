import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startAt: integer('start_at', { mode: 'timestamp_ms' }),
  endAt: integer('end_at', { mode: 'timestamp_ms' }),
  allDay: integer('all_day', { mode: 'boolean' }).notNull().default(false),
  estimateMinutes: integer('estimate_minutes'),
  recurrenceRule: text('recurrence_rule'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});

export const taskCompletions = sqliteTable(
  'task_completions',
  {
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    occurrenceDate: text('occurrence_date').notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.occurrenceDate] })],
);

export type Task = typeof tasks.$inferSelect;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
