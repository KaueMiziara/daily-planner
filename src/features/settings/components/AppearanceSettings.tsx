import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useThemeStore } from '@/theme/store';
import type { ThemeMode } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';
import { ThemePackPicker } from './ThemePackPicker';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

export function AppearanceSettings() {
  const { colors, spacing, radius } = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <View>
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

      <AppText variant="heading" style={{ marginTop: spacing.lg, marginBottom: spacing.xs }}>
        Theme
      </AppText>
      <AppText variant="caption" muted style={{ marginBottom: spacing.sm }}>
        Each theme has its own light and dark look.
      </AppText>
      <ThemePackPicker />
    </View>
  );
}
