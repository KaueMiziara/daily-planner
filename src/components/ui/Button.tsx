import { Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled }: Props) {
  const { colors, spacing, radius } = useTheme();
  const foreground =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'danger'
        ? colors.danger
        : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        backgroundColor: variant === 'primary' ? colors.primary : 'transparent',
        borderWidth: variant === 'danger' ? 1 : 0,
        borderColor: colors.danger,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
      })}
    >
      <AppText style={{ color: foreground, fontWeight: '600' }}>{title}</AppText>
    </Pressable>
  );
}
