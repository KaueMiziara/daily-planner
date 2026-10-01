import { isSameDay } from 'date-fns';
import { formatDateTime } from '@/utils/format';
import type { Task } from './db/schema';

const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export function formatSchedule(
  task: Pick<Task, 'startAt' | 'endAt' | 'allDay' | 'estimateMinutes'>,
): string {
  let text: string;
  if (task.allDay) text = 'All day';
  else if (task.startAt && task.endAt) {
    text = isSameDay(task.startAt, task.endAt)
      ? `${time(task.startAt)} – ${time(task.endAt)}`
      : `${formatDateTime(task.startAt)} → ${formatDateTime(task.endAt)}`;
  } else if (task.startAt) text = time(task.startAt);
  else if (task.endAt) text = `Due ${time(task.endAt)}`;
  else text = 'Anytime';

  return task.estimateMinutes ? `${text} · ${task.estimateMinutes} min` : text;
}
