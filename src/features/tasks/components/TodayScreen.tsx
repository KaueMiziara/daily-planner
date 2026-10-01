import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SectionList } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/useTheme';
import { toggleTaskDone } from '../completions';
import { useTodaySections, type TaskWithStatus } from '../hooks';
import { TaskItem } from './TaskItem';

type Section = { key: 'overdue' | 'today'; title: string; data: TaskWithStatus[] };

export function TodayScreen() {
  const { colors, spacing, radius } = useTheme();
  const { overdue, today, now } = useTodaySections();

  const sections: Section[] = [];
  if (overdue.length)
    sections.push({ key: 'overdue', title: `Overdue · ${overdue.length}`, data: overdue });
  if (today.length) sections.push({ key: 'today', title: 'Today', data: today });

  return (
    <Screen>
      <AppText variant="title">Today</AppText>
      <AppText muted style={{ marginBottom: spacing.sm }}>
        {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </AppText>

      <SectionList
        sections={sections}
        keyExtractor={(t) => t.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 88 }}
        ListEmptyComponent={<AppText muted>Nothing planned for today.</AppText>}
        renderSectionHeader={({ section }) =>
          sections.length > 1 ? (
            <AppText
              variant="heading"
              style={{
                marginTop: spacing.md,
                marginBottom: spacing.sm,
                color: section.key === 'overdue' ? colors.danger : colors.text,
              }}
            >
              {section.title}
            </AppText>
          ) : null
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={() => toggleTaskDone(item)}
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
