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

function useOccurrenceState(fromMs: number, toMs: number, now: Date) {
  const tasks = useLiveQuery(taskRepository.activeQuery());
  const completions = useLiveQuery(completionRepository.allQuery());

  const occurrences = useMemo(
    () =>
      buildOccurrences(
        tasks.data,
        completions.data,
        { from: new Date(fromMs), to: new Date(toMs) },
        now,
      ),
    [tasks.data, completions.data, fromMs, toMs, now],
  );

  const loaded = tasks.updatedAt !== undefined && completions.updatedAt !== undefined;
  return { occurrences, loaded };
}

export function useOccurrencesBetween(from: Date, to: Date): TaskOccurrence[] {
  const now = useNow();
  return useOccurrenceState(from.getTime(), to.getTime(), now).occurrences;
}

export function useLoadedOccurrences(from: Date, to: Date): TaskOccurrence[] | null {
  const now = useNow();
  const { occurrences, loaded } = useOccurrenceState(from.getTime(), to.getTime(), now);
  return loaded ? occurrences : null;
}

export function useTodaySections() {
  const now = useNow();
  const { occurrences } = useOccurrenceState(
    startOfDay(subDays(now, OVERDUE_LOOKBACK_DAYS)).getTime(),
    endOfDay(now).getTime(),
    now,
  );
  const sections = useMemo(() => selectToday(occurrences, now), [occurrences, now]);
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
