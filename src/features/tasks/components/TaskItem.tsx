import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/useTheme';
import { formatDateTime } from '@/utils/format';
import { formatSchedule } from '../format';
import type { TaskOccurrence } from '../occurrences';

type Props = { task: TaskOccurrence; onToggle: () => void; onPress: () => void };

export function TaskItem({ task, onToggle, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: task.overdue ? colors.danger : colors.border,
        backgroundColor: colors.surface,
        opacity: task.done ? 0.6 : 1,
      }}
    >
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
      >
        <Ionicons
          name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={task.done ? colors.success : colors.textMuted}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <AppText
            style={[{ flexShrink: 1 }, task.done ? { textDecorationLine: 'line-through' } : null]}
          >
            {task.title}
          </AppText>
          {task.recurring ? <Ionicons name="repeat" size={14} color={colors.textMuted} /> : null}
        </View>
        <AppText
          variant="caption"
          style={{ color: task.overdue ? colors.danger : colors.textMuted }}
        >
          {task.overdue && task.endAt
            ? `Overdue · due ${formatDateTime(task.endAt, task.allDay)}`
            : formatSchedule(task)}
        </AppText>
      </View>
    </Pressable>
  );
}
