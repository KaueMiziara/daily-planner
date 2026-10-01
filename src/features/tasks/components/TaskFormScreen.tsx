import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/useTheme';
import { useTask } from '../hooks';
import { taskRepository } from '../repository';
import { TaskForm } from './TaskForm';
import { isValid, parse } from 'date-fns';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

function CreateTask({ date }: { date?: string }) {
  const day = date ? parse(date, 'yyyy-MM-dd', new Date(0)) : null;
  const defaults = day && isValid(day) ? { allDay: true, startAt: day } : undefined;

  return (
    <TaskForm
      heading="New task"
      defaults={defaults}
      onClose={close}
      onSubmit={async (input) => {
        await taskRepository.create(input);
        close();
      }}
    />
  );
}

function EditTask({ taskId }: { taskId: string }) {
  const { colors } = useTheme();
  const { task, loading } = useTask(taskId);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <AppText>Task not found.</AppText>
        <Button title="Close" onPress={close} />
      </Screen>
    );
  }

  return (
    <TaskForm
      heading="Edit task"
      initial={task}
      onClose={close}
      onSubmit={async (input) => {
        await taskRepository.update(taskId, input);
        close();
      }}
      onDelete={async () => {
        await taskRepository.softDelete(taskId);
        close();
      }}
    />
  );
}

export function TaskFormScreen({ taskId, date }: { taskId?: string; date?: string }) {
  return taskId ? <EditTask taskId={taskId} /> : <CreateTask date={date} />;
}
