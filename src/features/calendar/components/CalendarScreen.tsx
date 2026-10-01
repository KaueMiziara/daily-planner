import { isSameMonth, startOfMonth } from 'date-fns';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  selectForDay,
  summarizeDays,
  toDayKey,
  toggleTaskDone,
  useTasksWithStatus,
} from '@/features/tasks';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/theme/useTheme';
import { getMonthGrid, WEEK_STARTS_ON } from '../monthGrid';
import { DayAgenda } from './DayAgenda';
import { MonthGrid } from './MonthGrid';

export function CalendarScreen() {
  const { spacing } = useTheme();
  const compact = useBreakpoint() === 'compact';
  const now = useNow();
  const tasks = useTasksWithStatus();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());

  const weeks = useMemo(() => getMonthGrid(month, WEEK_STARTS_ON), [month]);
  const summaries = useMemo(() => summarizeDays(tasks, weeks.flat()), [tasks, weeks]);
  const dayTasks = useMemo(() => selectForDay(tasks, selected), [tasks, selected]);

  // Showing a month also selects a sensible day in it: today, or the 1st.
  const showMonth = (target: Date) => {
    setMonth(startOfMonth(target));
    setSelected(isSameMonth(target, now) ? now : startOfMonth(target));
  };

  const selectDay = (day: Date) => {
    setSelected(day);
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
  };

  const grid = (
    <MonthGrid
      weeks={weeks}
      month={month}
      selected={selected}
      today={now}
      summaries={summaries}
      onSelect={selectDay}
      onMonthChange={(delta) =>
        showMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
      }
      onToday={() => showMonth(now)}
    />
  );

  const agenda = (
    <DayAgenda
      day={selected}
      tasks={dayTasks}
      onToggle={toggleTaskDone}
      onOpen={(task) => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
      onAdd={() => router.push({ pathname: '/task/new', params: { date: toDayKey(selected) } })}
    />
  );

  return (
    <Screen>
      <AppText variant="title" style={{ marginBottom: spacing.sm }}>
        Calendar
      </AppText>
      {compact ? (
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {grid}
          {agenda}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', gap: spacing.lg }}>
          <View style={{ flex: 1 }}>{grid}</View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {agenda}
          </ScrollView>
        </View>
      )}
    </Screen>
  );
}
