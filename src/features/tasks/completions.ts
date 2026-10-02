import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskCompletions } from './db/schema';

export const completionRepository = {
  allQuery() {
    return db.select().from(taskCompletions);
  },

  async setDone(taskId: string, occurrenceDate: string, done: boolean): Promise<void> {
    if (done) {
      await db
        .insert(taskCompletions)
        .values({ taskId, occurrenceDate, completedAt: new Date() })
        .onConflictDoNothing();
    } else {
      await db
        .delete(taskCompletions)
        .where(
          and(
            eq(taskCompletions.taskId, taskId),
            eq(taskCompletions.occurrenceDate, occurrenceDate),
          ),
        );
    }
  },
};

export function toggleTaskDone(task: {
  id: string;
  occurrenceKey: string;
  done: boolean;
}): Promise<void> {
  return completionRepository.setDone(task.id, task.occurrenceKey, !task.done);
}
