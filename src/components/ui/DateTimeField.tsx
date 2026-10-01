import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { formatDateTime } from '@/utils/format';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  allDay?: boolean;
  error?: string;
};

export function DateTimeField({ label, value, onChange, allDay = false, error }: Props) {
  const { colors, spacing, radius } = useTheme();

  const pickOnAndroid = () => {
    DateTimePickerAndroid.open({
      value: value ?? new Date(),
      mode: 'date',
      onValueChange: (_event, pickedDate) => {
        if (!pickedDate) return;
        if (allDay) {
          onChange(pickedDate);
          return;
        }
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          is24Hour: true,
          onValueChange: (_timeEvent, pickedTime) => {
            if (pickedTime) onChange(pickedTime);
          },
        });
      },
    });
  };

  const handlePress = () =>
    Platform.OS === 'android' ? pickOnAndroid() : onChange(value ?? new Date());

  return (
    <View style={{ marginBottom: spacing.md }}>
      <AppText variant="caption" muted style={{ marginBottom: spacing.xs }}>
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {Platform.OS === 'ios' && value ? (
          <DateTimePicker
            value={value}
            mode={allDay ? 'date' : 'datetime'}
            display="compact"
            onValueChange={(_, picked) => picked && onChange(picked)}
          />
        ) : (
          <Pressable
            onPress={handlePress}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: radius.md,
              padding: spacing.sm,
              backgroundColor: colors.surface,
            }}
          >
            <AppText muted={!value}>{value ? formatDateTime(value, allDay) : 'Not set'}</AppText>
          </Pressable>
        )}
        {value ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={8}
            accessibilityLabel={`Clear ${label}`}
          >
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" style={{ color: colors.danger, marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
