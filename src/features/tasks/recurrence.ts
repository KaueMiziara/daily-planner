import { addDays, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';
import { RRule } from 'rrule';
import { overlapsRange, toDayKey, type Schedulable } from './schedule';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const FREQUENCIES: Record<string, Recurrence['freq'] | undefined> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

export type Recurrence = {
  freq: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays: number[];
};

export function serializeRecurrence(recurrence: Recurrence | null): string | null {
  if (!recurrence) return null;
  const parts = [`FREQ=${recurrence.freq.toUpperCase()}`];
  if (recurrence.interval > 1) parts.push(`INTERVAL=${recurrence.interval}`);
  if (recurrence.freq === 'weekly' && recurrence.weekdays.length > 0) {
    const days = [...recurrence.weekdays].sort((a, b) => a - b).map((d) => DAY_CODES[d]);
    parts.push(`BYDAY=${days.join(',')}`);
  }
  return parts.join(';');
}

export function parseRecurrence(rule: string | null): Recurrence | null {
  if (!rule) return null;
  const fields = new Map(
    rule
      .replace(/^RRULE:/, '')
      .split(';')
      .map((part) => part.split('=') as [string, string]),
  );
  const freq = FREQUENCIES[fields.get('FREQ') ?? ''];
  const interval = Number(fields.get('INTERVAL') ?? 1);
  if (!freq || !Number.isInteger(interval) || interval < 1) return null;

  const weekdays = (fields.get('BYDAY') ?? '')
    .split(',')
    .filter(Boolean)
    .map((code) => DAY_CODES.indexOf(code));
  if (weekdays.includes(-1)) return null;

  return { freq, interval, weekdays: freq === 'weekly' ? weekdays : [] };
}

export type Expanded = { occurrenceKey: string; startAt: Date | null; endAt: Date | null };
type Recurring = Schedulable & { recurrenceRule: string | null };

const toFloating = (d: Date) =>
  new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ),
  );
const fromFloating = (d: Date) =>
  new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );

export function expandOccurrences(task: Recurring, from: Date, to: Date): Expanded[] {
  const anchor = task.startAt ?? task.endAt;
  if (!task.recurrenceRule || !anchor) return [];

  const rule = new RRule({
    ...RRule.parseString(task.recurrenceRule),
    dtstart: toFloating(anchor),
  });

  const hasBoth = task.startAt !== null && task.endAt !== null;
  const spanDays =
    task.allDay && hasBoth ? differenceInCalendarDays(task.endAt!, task.startAt!) : 0;
  const durationMs = !task.allDay && hasBoth ? task.endAt!.getTime() - task.startAt!.getTime() : 0;

  const widenMs = durationMs + (spanDays + 1) * DAY_MS;
  const starts = rule.between(toFloating(new Date(from.getTime() - widenMs)), toFloating(to), true);

  return starts
    .map(fromFloating)
    .map((start): Expanded => {
      const occurrenceKey = toDayKey(start);
      if (!task.startAt) return { occurrenceKey, startAt: null, endAt: start };
      if (!task.endAt) return { occurrenceKey, startAt: start, endAt: null };
      const endAt = task.allDay
        ? endOfDay(addDays(startOfDay(start), spanDays))
        : new Date(start.getTime() + durationMs);
      return { occurrenceKey, startAt: start, endAt };
    })
    .filter((o) => overlapsRange(o, from, to));
}
