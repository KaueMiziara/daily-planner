import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { taskRepository, useTasks } from '@/features/tasks';
import { useTheme } from '@/theme/useTheme';

export default function TodayScreen() {
  const { colors, spacing, radius } = useTheme();
  const tasks = useTasks();

  const addTestTask = () =>
    taskRepository.create({
      title: `Test task ${tasks.length + 1}`,
      description: null,
      startAt: new Date(),
      endAt: new Date(Date.now() + 60 * 60 * 1000),
      allDay: false,
      estimateMinutes: 30,
      recurrenceRule: null,
    });

  return (
    <Screen>
      <AppText variant="title">Today</AppText>
      <Pressable
        onPress={addTestTask}
        style={{
          marginVertical: spacing.md,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.primary,
        }}
      >
        <AppText style={{ color: colors.onPrimary }}>Add test task</AppText>
      </Pressable>
      {tasks.map((t) => (
        <Pressable key={t.id} onLongPress={() => taskRepository.softDelete(t.id)}>
          <View style={{ paddingVertical: spacing.sm }}>
            <AppText>{t.title}</AppText>
            <AppText variant="caption" muted>
              {t.startAt?.toLocaleTimeString()} (long-press to delete)
            </AppText>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
