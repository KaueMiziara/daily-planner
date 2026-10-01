import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { useNow } from '@/hooks/useNow';
import { completionRepository, SINGLE_OCCURRENCE } from './completions';
import type { Task } from './db/schema';
import { taskRepository } from './repository';
import { isOverdue, selectToday } from './schedule';

export type TaskWithStatus = Task & { done: boolean; completedAt: Date | null; overdue: boolean };

function useStatusTasks(now: Date): TaskWithStatus[] {
  const { data: tasks } = useLiveQuery(taskRepository.activeQuery());
  const { data: completions } = useLiveQuery(completionRepository.allQuery());

  return useMemo(() => {
    const completedAt = new Map(
      completions
        .filter((c) => c.occurrenceDate === SINGLE_OCCURRENCE)
        .map((c) => [c.taskId, c.completedAt] as const),
    );
    return tasks.map((t) => {
      const done = completedAt.has(t.id);
      return {
        ...t,
        done,
        completedAt: completedAt.get(t.id) ?? null,
        overdue: isOverdue({ ...t, done }, now),
      };
    });
  }, [tasks, completions, now]);
}

export function useTasksWithStatus(): TaskWithStatus[] {
  return useStatusTasks(useNow());
}

export function useTodaySections() {
  const now = useNow();
  const all = useStatusTasks(now);
  const sections = useMemo(() => selectToday(all, now), [all, now]);
  return { ...sections, now };
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
