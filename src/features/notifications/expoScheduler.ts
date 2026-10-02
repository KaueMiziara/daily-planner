import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderScheduler } from './scheduler';

const CHANNEL_ID = 'reminders';

export const expoScheduler: ReminderScheduler = {
  async ensurePermission() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Task reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let status = await Notifications.getPermissionsAsync();
    if (!status.granted && status.canAskAgain) {
      status = await Notifications.requestPermissionsAsync();
    }
    return status.granted;
  },

  async replaceAll(reminders) {
    const wanted = new Set(reminders.map((r) => r.id));

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const stale = scheduled.filter(
      (n) => typeof n.content.data?.taskId === 'string' && !wanted.has(n.identifier),
    );
    await Promise.all(
      stale.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );

    for (const r of reminders) {
      await Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body, data: { taskId: r.taskId } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: r.fireAt,
          channelId: CHANNEL_ID,
        },
      });
    }
  },
};

export async function scheduleTestReminder(seconds = 10): Promise<boolean> {
  if (!(await expoScheduler.ensurePermission())) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Test reminder', body: 'Notifications are working.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}
