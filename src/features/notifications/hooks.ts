import { addDays, endOfDay, startOfDay } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useLoadedOccurrences } from '@/features/tasks';
import { useNow } from '@/hooks/useNow';
import { expoScheduler } from './expoScheduler';
import { planReminders, REMINDER_HORIZON_DAYS } from './planner';
import { createReminderSync } from './sync';

const reminderSync = createReminderSync(expoScheduler);

export function useReminderSync() {
  const now = useNow();
  const occurrences = useLoadedOccurrences(
    startOfDay(now),
    endOfDay(addDays(now, REMINDER_HORIZON_DAYS)),
  );

  const planned = useMemo(
    () => (occurrences ? planReminders(occurrences, now) : null),
    [occurrences, now],
  );

  useEffect(() => {
    if (planned) void reminderSync.sync(planned);
  }, [planned]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reminderSync.invalidate();
    });
    return () => subscription.remove();
  }, []);
}

export function useNotificationTapRouting() {
  useEffect(() => {
    const open = (response: Notifications.NotificationResponse | null) => {
      const taskId = response?.notification.request.content.data?.taskId;
      if (typeof taskId !== 'string') return;
      router.push({ pathname: '/task/[id]', params: { id: taskId } });
      Notifications.clearLastNotificationResponse();
    };

    open(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}

export function useNotificationsEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      Notifications.getPermissionsAsync().then((p) => {
        if (!cancelled) setEnabled(p.granted);
      });

    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return enabled;
}
