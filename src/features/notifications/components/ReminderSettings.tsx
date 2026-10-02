import { Linking, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { scheduleTestReminder } from '../expoScheduler';
import { useNotificationsEnabled } from '../hooks';

export function ReminderSettings() {
  const { spacing } = useTheme();
  const enabled = useNotificationsEnabled();

  return (
    <View>
      <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        Reminders
      </AppText>
      <AppText muted style={{ marginBottom: spacing.sm }}>
        {enabled === null
          ? 'Checking…'
          : enabled
            ? 'Notifications are on.'
            : "Notifications are off, so reminders won't appear."}
      </AppText>
      {enabled === false ? (
        <Button title="Open system settings" onPress={() => void Linking.openSettings()} />
      ) : null}
      {__DEV__ ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button
            title="Send test reminder (10 s)"
            variant="ghost"
            onPress={() => void scheduleTestReminder(10)}
          />
        </View>
      ) : null}
    </View>
  );
}
