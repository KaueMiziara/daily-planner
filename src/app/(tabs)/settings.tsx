import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useThemeStore } from '@/theme/store';
import type { ThemeMode } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';
import { ReminderSettings } from '@/features/notifications';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <Screen>
      <AppText variant="title">Settings</AppText>
      <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        Appearance
      </AppText>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {MODES.map((m) => {
          const selected = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: selected ? colors.primary : colors.surface,
              }}
            >
              <AppText style={{ color: selected ? colors.onPrimary : colors.text }}>{m}</AppText>
            </Pressable>
          );
        })}
      </View>
      <ReminderSettings />
    </Screen>
  );
}
