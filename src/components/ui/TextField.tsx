import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, style, ...rest }: Props) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <AppText variant="caption" muted style={{ marginBottom: spacing.xs }}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" style={{ color: colors.danger, marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
