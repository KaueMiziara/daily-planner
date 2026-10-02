import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TaskItem } from '@/features/tasks';
import type { TaskOccurrence } from '@/features/tasks';
import { useTheme } from '@/theme/useTheme';

type Props = {
  day: Date;
  tasks: TaskOccurrence[];
  onToggle: (task: TaskOccurrence) => void;
  onOpen: (task: TaskOccurrence) => void;
  onAdd: () => void;
};

export function DayAgenda({ day, tasks, onToggle, onOpen, onAdd }: Props) {
  const { spacing } = useTheme();

  return (
    <View style={{ marginTop: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}
      >
        <AppText variant="heading" style={{ flexShrink: 1 }}>
          {day.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </AppText>
        <Button title="Add" variant="ghost" onPress={onAdd} />
      </View>

      {tasks.length === 0 ? (
        <AppText muted>Nothing planned.</AppText>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.key}
            task={task}
            onToggle={() => onToggle(task)}
            onPress={() => onOpen(task)}
          />
        ))
      )}
    </View>
  );
}
