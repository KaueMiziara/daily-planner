import '../handler';
import { useNotificationTapRouting, useReminderSync } from '../hooks';

export function NotificationEffects() {
  useReminderSync();
  useNotificationTapRouting();
  return null;
}
