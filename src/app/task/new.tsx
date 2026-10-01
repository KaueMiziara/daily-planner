import { useLocalSearchParams } from 'expo-router';
import { TaskFormScreen } from '@/features/tasks';

export default function NewTaskRoute() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <TaskFormScreen date={date} />;
}
