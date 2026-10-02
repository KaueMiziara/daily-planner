import type { PlannedReminder } from './planner';
import type { ReminderScheduler } from './scheduler';

const signatureOf = (reminders: PlannedReminder[]) =>
  reminders.map((r) => `${r.id}@${r.fireAt.getTime()}@${r.title}@${r.body}`).join('|');

export function createReminderSync(scheduler: ReminderScheduler) {
  let lastSignature: string | null = null;
  let queue: Promise<void> = Promise.resolve();

  const run = async (reminders: PlannedReminder[], signature: string) => {
    const allowed = reminders.length > 0 && (await scheduler.ensurePermission());
    await scheduler.replaceAll(allowed ? reminders : []);
    lastSignature = signature;
  };

  return {
    sync(reminders: PlannedReminder[]): Promise<void> {
      const signature = signatureOf(reminders);
      if (signature === lastSignature) return queue;
      queue = queue
        .then(() => run(reminders, signature))
        .catch((error) => console.warn('Reminder sync failed', error));
      return queue;
    },

    invalidate() {
      lastSignature = null;
    },
  };
}
