import { Ionicons } from '@expo/vector-icons';
import { isSameDay, isSameMonth } from 'date-fns';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { toDayKey, type DaySummary } from '@/features/tasks';
import { useTheme } from '@/theme/useTheme';

type Props = {
  weeks: Date[][];
  month: Date;
  selected: Date;
  today: Date;
  summaries: Map<string, DaySummary>;
  onSelect: (day: Date) => void;
  onMonthChange: (delta: number) => void;
  onToday: () => void;
};

export function MonthGrid({
  weeks,
  month,
  selected,
  today,
  summaries,
  onSelect,
  onMonthChange,
  onToday,
}: Props) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Pressable
          onPress={() => onMonthChange(-1)}
          hitSlop={10}
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="heading" style={{ flex: 1, textAlign: 'center' }}>
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </AppText>
        <Pressable onPress={() => onMonthChange(1)} hitSlop={10} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
        <Button title="Today" variant="ghost" onPress={onToday} />
      </View>

      <View style={{ flexDirection: 'row' }}>
        {weeks[0].map((day) => (
          <AppText
            key={day.getDay()}
            variant="caption"
            muted
            style={{ flex: 1, textAlign: 'center' }}
          >
            {day.toLocaleDateString(undefined, { weekday: 'narrow' })}
          </AppText>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={toDayKey(week[0])} style={{ flexDirection: 'row' }}>
          {week.map((day) => {
            const summary = summaries.get(toDayKey(day));
            const isSelected = isSameDay(day, selected);
            const isToday = isSameDay(day, today);
            const inMonth = isSameMonth(day, month);
            const dot = !summary
              ? 'transparent'
              : summary.overdue > 0
                ? colors.danger
                : summary.pending > 0
                  ? colors.primary
                  : colors.success;

            return (
              <Pressable
                key={toDayKey(day)}
                onPress={() => onSelect(day)}
                accessibilityLabel={day.toDateString()}
                style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderWidth: isToday && !isSelected ? 1 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <AppText
                    style={{
                      color: isSelected
                        ? colors.onPrimary
                        : inMonth
                          ? colors.text
                          : colors.textMuted,
                      fontWeight: isToday ? '700' : '400',
                    }}
                  >
                    {day.getDate()}
                  </AppText>
                </View>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    marginTop: 2,
                    backgroundColor: dot,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
