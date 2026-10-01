export function formatDateTime(date: Date, allDay = false): string {
  return date.toLocaleString(
    undefined,
    allDay
      ? { weekday: 'short', day: 'numeric', month: 'short' }
      : { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
  );
}
