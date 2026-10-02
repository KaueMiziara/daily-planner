import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/theme/useTheme';
import { ThemeBackground } from './ThemeBackground';

export function Screen({ children, style, ...rest }: ViewProps) {
  const { colors, spacing } = useTheme();
  const breakpoint = useBreakpoint();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ThemeBackground />
      <View
        style={[
          {
            flex: 1,
            width: '100%',
            maxWidth: breakpoint === 'compact' ? undefined : 840,
            alignSelf: 'center',
            padding: spacing.md,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
