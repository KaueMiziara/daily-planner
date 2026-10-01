import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { taskRepository } from './repository';

export function useTasks() {
  const { data } = useLiveQuery(taskRepository.activeQuery());
  return data;
}
