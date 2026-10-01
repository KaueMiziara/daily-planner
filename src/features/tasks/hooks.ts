import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { completionRepository, SINGLE_OCCURRENCE } from './completions';
import type { Task } from './db/schema';
import { taskRepository } from './repository';
import { selectToday } from './schedule';

export type TaskWithStatus = Task & { done: boolean };

export function useTasksWithStatus(): TaskWithStatus[] {
  const { data: tasks } = useLiveQuery(taskRepository.activeQuery());
  const { data: completions } = useLiveQuery(completionRepository.allQuery());

  return useMemo(() => {
    const doneIds = new Set(
      completions.filter((c) => c.occurrenceDate === SINGLE_OCCURRENCE).map((c) => c.taskId),
    );
    return tasks.map((t) => ({ ...t, done: doneIds.has(t.id) }));
  }, [tasks, completions]);
}

export function useTodayTasks(): TaskWithStatus[] {
  const all = useTasksWithStatus();
  return useMemo(() => selectToday(all, new Date()), [all]);
}

export function useTask(id: string) {
  const [state, setState] = useState<{ task: Task | null; loading: boolean }>({
    task: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    taskRepository.getById(id).then((task) => {
      if (!cancelled) setState({ task, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
