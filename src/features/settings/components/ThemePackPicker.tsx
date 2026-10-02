import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { packs } from '@/theme/packs';
import { useThemeStore } from '@/theme/store';
import type { ThemeVariant } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';

function Swatch({ variant }: { variant: ThemeVariant }) {
  const { radius } = useTheme();
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.sm,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variant.colors.background,
      }}
    >
      {variant.background ? (
        <Image
          source={variant.background.image}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: variant.colors.primary }}
      />
    </View>
  );
}

export function ThemePackPicker() {
  const { colors, spacing, radius } = useTheme();
  const packId = useThemeStore((s) => s.packId);
  const setPackId = useThemeStore((s) => s.setPackId);

  return (
    <View style={{ gap: spacing.sm }}>
      {packs.map((pack) => {
        const selected = pack.id === packId;
        return (
          <Pressable
            key={pack.id}
            onPress={() => setPackId(pack.id)}
            accessibilityRole="button"
            accessibilityLabel={`${pack.name} theme`}
            accessibilityState={{ selected }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.sm,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Swatch variant={pack.light} />
            <Swatch variant={pack.dark} />
            <AppText style={{ flex: 1, marginLeft: spacing.xs }}>{pack.name}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
