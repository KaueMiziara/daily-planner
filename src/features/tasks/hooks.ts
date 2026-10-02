import { endOfDay, startOfDay, subDays } from 'date-fns';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { useNow } from '@/hooks/useNow';
import { completionRepository } from './completions';
import type { Task } from './db/schema';
import { buildOccurrences, type TaskOccurrence } from './occurrences';
import { taskRepository } from './repository';
import { selectToday } from './schedule';

const OVERDUE_LOOKBACK_DAYS = 7;

function useOccurrences(fromMs: number, toMs: number, now: Date): TaskOccurrence[] {
  const { data: tasks } = useLiveQuery(taskRepository.activeQuery());
  const { data: completions } = useLiveQuery(completionRepository.allQuery());

  return useMemo(
    () => buildOccurrences(tasks, completions, { from: new Date(fromMs), to: new Date(toMs) }, now),
    [tasks, completions, fromMs, toMs, now],
  );
}

export function useOccurrencesBetween(from: Date, to: Date): TaskOccurrence[] {
  const now = useNow();
  return useOccurrences(from.getTime(), to.getTime(), now);
}

export function useTodaySections() {
  const now = useNow();
  const all = useOccurrences(
    startOfDay(subDays(now, OVERDUE_LOOKBACK_DAYS)).getTime(),
    endOfDay(now).getTime(),
    now,
  );
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
