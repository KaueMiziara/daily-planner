import { describe, expect, it } from '@jest/globals';
import type { PlannedReminder } from './planner';
import type { ReminderScheduler } from './scheduler';
import { createReminderSync } from './sync';

const reminder = (id: string): PlannedReminder => ({
  id,
  taskId: 't1',
  kind: 'start',
  fireAt: new Date(2026, 9, 5, 14),
  title: 'Task',
  body: 'Starting now',
});

function fakeScheduler(granted: boolean) {
  const calls = { ensurePermission: 0, replaceAll: [] as PlannedReminder[][] };
  const scheduler: ReminderScheduler = {
    async ensurePermission() {
      calls.ensurePermission += 1;
      return granted;
    },
    async replaceAll(reminders) {
      calls.replaceAll.push(reminders);
    },
  };
  return { scheduler, calls };
}

describe('createReminderSync', () => {
  it('neither prompts for permission nor schedules anything when there is nothing to remind about', async () => {
    const { scheduler, calls } = fakeScheduler(true);
    await createReminderSync(scheduler).sync([]);
    expect(calls.ensurePermission).toBe(0);
    expect(calls.replaceAll).toEqual([[]]);
  });

  it('schedules the plan once permission is granted', async () => {
    const { scheduler, calls } = fakeScheduler(true);
    await createReminderSync(scheduler).sync([reminder('a')]);
    expect(calls.replaceAll).toEqual([[reminder('a')]]);
  });

  it('leaves the schedule empty when permission is denied', async () => {
    const { scheduler, calls } = fakeScheduler(false);
    await createReminderSync(scheduler).sync([reminder('a')]);
    expect(calls.replaceAll).toEqual([[]]);
  });

  it('skips an unchanged plan until invalidated', async () => {
    const { scheduler, calls } = fakeScheduler(true);
    const reminderSync = createReminderSync(scheduler);

    await reminderSync.sync([reminder('a')]);
    await reminderSync.sync([reminder('a')]);
    expect(calls.replaceAll).toHaveLength(1);

    reminderSync.invalidate();
    await reminderSync.sync([reminder('a')]);
    expect(calls.replaceAll).toHaveLength(2);
  });
});
