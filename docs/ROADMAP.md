# Roadmap

Status: **MVP feature-complete** (task CRUD, Today and Calendar views, recurrence, derived overdue state,
local reminders, theme packs with per-mode backgrounds, tablet-aware layout). Next: hardening, real-world use, polish.

## Next up (suggested order)

1. **Backup / export-import.** All data lives only on the device. Export to a JSON file and import it back
   before she depends on the app. Highest priority after the MVP.
2. **Tablet polish.** Navigation rail on expanded widths, two-pane layouts (list + detail), form width on large screens.
3. **Validation: recurring task longer than its interval** (e.g. a 4-day task repeating daily creates overlapping occurrences).
4. **Exact-timing prompt.** `SCHEDULE_EXACT_ALARM` is declared but not granted by default on Android 14+. Add an in-app card
   in Settings that opens the system "Alarms & reminders" screen, and explain why.
5. **Notification icon** (white 96x96 PNG via the `expo-notifications` config plugin) so Android does not show a plain square.
6. **Time tracker.** Data model is planned: `time_entries(taskId, startedAt, endedAt null while running, source: timer | manual)`.
   Store intervals, not counters, so it survives the app being killed or a reboot. Pausable clock plus manual entry.
7. **Per-theme animations** (different animations for light and dark). The theme pack type has room for it.
8. **Per-task "remind me N minutes before".** `planReminders` already models reminder kinds; add one.

## Later

- Recurrence: end date or count, skip one occurrence, edit "only this" / "this and following", monthly by weekday
  ("second Tuesday"), yearly.
- Calendar: week view, week-start setting (currently the constant `WEEK_STARTS_ON`), search and filters.
- Categories, tags or priority if she asks for them.
- Gallery-picked backgrounds (store a copy of the image in the app directory) so users can bring their own artwork.
  This is the publish-safe replacement for the local-only character pack.
- Sync with the phone calendar and notes (RRULE storage was chosen to make this feasible).
- Accounts and a backend, only if the app is published and needs multi-device sync.
- iOS: EAS cloud build, verify the iOS branch of `DateTimeField` (written from the docs, never run), check the
  64-pending-notification limit behaviour, Apple Developer account for TestFlight.
- Publication: final package name, icon, privacy policy, original or licensed artwork only, release signing,
  Google Play policy on exact alarms.

## Known limitations (by design for now)

- Editing or deleting a recurring task applies to the whole series, including past occurrences.
- A monthly task on the 29th to 31st skips months that do not have that day (standard RRULE behaviour).
- Today shows only the **latest missed occurrence** of a recurring task, and looks back 7 days (`OVERDUE_LOOKBACK_DAYS`).
  Older misses are treated as skipped, though the calendar still marks them.
- Reminders cover a rolling 7-day window (max 60). They are re-planned when the app is opened. Force-stopping the app
  cancels pending alarms until it is opened again. Aggressive battery settings (e.g. Samsung "sleeping apps") may delay them.
- All-day tasks remind once at 09:00 (`ALL_DAY_REMINDER_HOUR`). Already-overdue tasks do not trigger retroactive reminders.
- Finished undated tasks disappear from Today the day after they were completed.
- Deletion is soft; there is no trash or purge UI.
- The first day of the week is Sunday and not configurable yet.

## Not yet verified (treat as open questions)

- **Reminder timing** with and without the exact-alarm permission (how late do notifications arrive in Doze?).
- Opening the app after a restart with many scheduled tasks (the not-loaded guard is reasoned and tested in the
  pure logic, but not exercised on a device with many tasks).
- Tablet layouts (so far only a phone emulator and rotation were checked).
- Release build behaviour (performance, notification launch, splash).
- Daylight-saving transitions and travelling across time zones. The floating-time conversion is designed for it
  but is not unit tested because Jest cannot easily change the process time zone.
- iOS in general.

## Decisions to confirm with her (the real user)

- Is "only the latest missed occurrence" the right behaviour for recurring tasks, and is 7 days a sensible lookback?
- Is 09:00 a good time for all-day reminders?
- Should finished undated tasks stay visible longer?
- Wording of the notifications ("Starting now", "Due now", "Planned for today").
- Week start day.

## Done

- Step 1 to 8 of the build: project setup, app shell, data layer, task CRUD, overdue and calendar, recurrence,
  reminders, theme packs.
