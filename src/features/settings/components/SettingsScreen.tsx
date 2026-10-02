import { ScrollView } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { ReminderSettings } from '@/features/notifications';
import { useTheme } from '@/theme/useTheme';
import { AppearanceSettings } from './AppearanceSettings';

export function SettingsScreen() {
  const { spacing } = useTheme();

  return (
    <Screen>
      <AppText variant="title">Settings</AppText>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AppearanceSettings />
        <ReminderSettings />
      </ScrollView>
    </Screen>
  );
}
