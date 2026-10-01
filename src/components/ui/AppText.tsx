import { Text, type TextProps } from 'react-native';
import { typography as typographyTokens } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = TextProps & {
  variant?: keyof typeof typographyTokens;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...rest }: Props) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={[typography[variant], { color: muted ? colors.textMuted : colors.text }, style]}
      {...rest}
    />
  );
}
