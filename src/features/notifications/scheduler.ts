import type { PlannedReminder } from './planner';

export interface ReminderScheduler {
  ensurePermission(): Promise<boolean>;
  replaceAll(reminders: PlannedReminder[]): Promise<void>;
}
