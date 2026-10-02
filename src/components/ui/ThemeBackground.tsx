import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export function ThemeBackground() {
  const { colors, background } = useTheme();
  if (!background) return null;

  return (
    <>
      <Image source={background.image} contentFit="cover" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.background, opacity: background.scrim ?? 0.7 },
        ]}
      />
    </>
  );
}
