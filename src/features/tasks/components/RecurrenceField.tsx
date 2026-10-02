import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/useTheme';
import { WEEK_STARTS_ON } from '@/utils/week';
import { parseRecurrence, serializeRecurrence, type Recurrence } from '../recurrence';

type Props = {
  value: string | null;
  onChange: (rule: string | null) => void;
  anchor: Date | null;
  error?: string;
};

const FREQUENCIES: { label: string; freq: Recurrence['freq'] | null }[] = [
  { label: 'Never', freq: null },
  { label: 'Daily', freq: 'daily' },
  { label: 'Weekly', freq: 'weekly' },
  { label: 'Monthly', freq: 'monthly' },
];
const UNITS = { daily: 'day', weekly: 'week', monthly: 'month' } as const;
const WEEK_ORDER = Array.from({ length: 7 }, (_, i) => (WEEK_STARTS_ON + i) % 7);

const weekdayName = (day: number, weekday: 'narrow' | 'long') =>
  new Date(2026, 0, 4 + day).toLocaleDateString(undefined, { weekday });

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  round?: boolean;
};

function Chip({ label, selected, onPress, accessibilityLabel, round }: ChipProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={{
        ...(round
          ? { width: 38, height: 38, borderRadius: radius.full, justifyContent: 'center' }
          : {
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: radius.full,
            }),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: selected ? colors.primary : colors.surface,
      }}
    >
      <AppText style={{ color: selected ? colors.onPrimary : colors.text }}>{label}</AppText>
    </Pressable>
  );
}

export function RecurrenceField({ value, onChange, anchor, error }: Props) {
  const { colors, spacing } = useTheme();
  const recurrence = parseRecurrence(value);
  const emit = (next: Recurrence | null) => onChange(serializeRecurrence(next));

  const selectFrequency = (freq: Recurrence['freq'] | null) => {
    if (!freq) return emit(null);
    const keptDays = recurrence?.weekdays ?? [];
    const defaultDay = (anchor ?? new Date()).getDay();
    emit({
      freq,
      interval: recurrence?.interval ?? 1,
      weekdays: freq === 'weekly' ? (keptDays.length > 0 ? keptDays : [defaultDay]) : [],
    });
  };

  const changeInterval = (delta: number) => {
    if (!recurrence) return;
    emit({ ...recurrence, interval: Math.min(30, Math.max(1, recurrence.interval + delta)) });
  };

  const toggleDay = (day: number) => {
    if (!recurrence) return;
    const selected = recurrence.weekdays.includes(day);
    if (selected && recurrence.weekdays.length === 1) return;
    emit({
      ...recurrence,
      weekdays: selected
        ? recurrence.weekdays.filter((d) => d !== day)
        : [...recurrence.weekdays, day],
    });
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <AppText variant="caption" muted style={{ marginBottom: spacing.xs }}>
        Repeat
      </AppText>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {FREQUENCIES.map(({ label, freq }) => (
          <Chip
            key={label}
            label={label}
            selected={(recurrence?.freq ?? null) === freq}
            onPress={() => selectFrequency(freq)}
          />
        ))}
      </View>

      {recurrence ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            <AppText>Every</AppText>
            <Pressable
              onPress={() => changeInterval(-1)}
              hitSlop={8}
              accessibilityLabel="Decrease interval"
            >
              <Ionicons name="remove-circle-outline" size={28} color={colors.primary} />
            </Pressable>
            <AppText variant="heading">{recurrence.interval}</AppText>
            <Pressable
              onPress={() => changeInterval(1)}
              hitSlop={8}
              accessibilityLabel="Increase interval"
            >
              <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
            </Pressable>
            <AppText>
              {UNITS[recurrence.freq]}
              {recurrence.interval === 1 ? '' : 's'}
            </AppText>
          </View>

          {recurrence.freq === 'weekly' ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              {WEEK_ORDER.map((day) => (
                <Chip
                  key={day}
                  round
                  label={weekdayName(day, 'narrow')}
                  accessibilityLabel={weekdayName(day, 'long')}
                  selected={recurrence.weekdays.includes(day)}
                  onPress={() => toggleDay(day)}
                />
              ))}
            </View>
          ) : null}

          <AppText variant="caption" muted style={{ marginTop: spacing.sm }}>
            Edits and deletion apply to the whole series.
          </AppText>
        </>
      ) : null}

      {error ? (
        <AppText variant="caption" style={{ color: colors.danger, marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
