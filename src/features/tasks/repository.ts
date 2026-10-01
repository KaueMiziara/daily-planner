import { and, asc, eq, isNull } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import { db } from '@/lib/db';
import { tasks, type Task } from './db/schema';
import { taskInputSchema, type TaskInput } from './schemas';

const notDeleted = isNull(tasks.deletedAt);

export const taskRepository = {
  activeQuery() {
    return db
      .select()
      .from(tasks)
      .where(notDeleted)
      .orderBy(asc(tasks.startAt), asc(tasks.createdAt));
  },

  async getById(id: string): Promise<Task | null> {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), notDeleted))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(input: TaskInput): Promise<Task> {
    const data = taskInputSchema.parse(input);
    const now = new Date();
    const [created] = await db
      .insert(tasks)
      .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
      .returning();
    return created;
  },

  async update(id: string, input: TaskInput): Promise<Task | null> {
    const data = taskInputSchema.parse(input);
    const [updated] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), notDeleted))
      .returning();
    return updated ?? null;
  },

  async softDelete(id: string): Promise<void> {
    const now = new Date();
    await db.update(tasks).set({ deletedAt: now, updatedAt: now }).where(eq(tasks.id, id));
  },
};
