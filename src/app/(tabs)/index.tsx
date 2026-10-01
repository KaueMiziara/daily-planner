import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { completionRepository, SINGLE_OCCURRENCE, TaskItem, useTodayTasks } from '@/features/tasks';
import { useTheme } from '@/theme/useTheme';

export default function TodayScreen() {
  const { colors, spacing, radius } = useTheme();
  const tasks = useTodayTasks();

  return (
    <Screen>
      <AppText variant="title">Today</AppText>
      <AppText muted style={{ marginBottom: spacing.md }}>
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </AppText>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 88 }}
        ListEmptyComponent={<AppText muted>Nothing planned for today.</AppText>}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={() => completionRepository.setDone(item.id, SINGLE_OCCURRENCE, !item.done)}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
          />
        )}
      />

      <Pressable
        onPress={() => router.push('/task/new')}
        accessibilityLabel="Add task"
        style={{
          position: 'absolute',
          right: spacing.md,
          bottom: spacing.md,
          width: 56,
          height: 56,
          borderRadius: radius.full,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </Screen>
  );
}
