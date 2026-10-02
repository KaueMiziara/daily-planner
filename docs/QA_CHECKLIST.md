# Manual QA checklist

Run on the Android emulator (phone and tablet profiles) and, before declaring a milestone done, on the real device with a
**release build**. Repeat the visual checks in light and dark mode and in at least two theme packs.

Automated first: `npm run typecheck && npx expo lint && npm test && npm run format`

## Tasks

- [ ] Create a timed task, an all-day task, an undated task and a task with only a deadline
- [ ] Empty title shows "Title is required"; deadline before start shows the validation error under "Due"
- [ ] Edit prefills every field; saving updates the list immediately
- [ ] Delete asks for confirmation and removes the task
- [ ] Cancelling a date or time dialog leaves the field unchanged
- [ ] Marking done and undone works and survives an app restart

## Today

- [ ] Shows today's tasks and undated tasks; tomorrow's tasks are absent
- [ ] Finished tasks sink to the bottom
- [ ] A task whose deadline passes moves to the red Overdue section on its own (leave the screen open)
- [ ] Completing an overdue task removes it from Overdue

## Calendar

- [ ] Today is outlined; selecting a day shows its agenda; month arrows and "Today" work
- [ ] Dots: red = overdue, primary = pending, green = all done, none = empty day
- [ ] Multi-day tasks appear on every day they cover
- [ ] Tapping a day from the previous or next month switches month
- [ ] "Add" in the agenda opens the form prefilled with that day

## Recurrence

- [ ] Daily, weekly (several weekdays), every 2 weeks and monthly place occurrences on the right days
- [ ] Completing one occurrence leaves the others untouched
- [ ] A short daily task started days ago shows exactly one entry under Overdue, and red dots on the missed days
- [ ] Repeat without any date shows the validation error
- [ ] Editing or deleting a recurring task applies to the whole series (known limitation)

## Reminders (dev or release build, not Expo Go)

- [ ] Permission is requested when the first reminder is created, not at launch
- [ ] Start and due notifications arrive with the app closed; note the delay in minutes
- [ ] Tapping a notification opens that task, from the background and from a cold start
- [ ] Completing, editing or deleting a task cancels or moves its reminder
- [ ] Turning notifications off in system settings shows "off" in Settings with a working button
- [ ] After a restart with many tasks scheduled, reminders still fire

## Themes

- [ ] Each pack looks right in light and dark on every screen (text readable, colors consistent)
- [ ] Selection and mode persist across restarts with no flash of the default theme
- [ ] Packs with a background show it behind every screen including modals, with readable text
- [ ] System dark mode flips the pack variant when mode is "system"

## Layout

- [ ] Phone portrait and landscape; tablet portrait and landscape
- [ ] Content stays centered at the maximum width on wide screens; backgrounds stay full-bleed
- [ ] Keyboard never hides the focused field in the form
- [ ] Android 15 edge-to-edge: nothing hides under the status bar or gesture bar

## Data

- [ ] Fresh install starts clean; data survives app updates installed over the previous build
- [ ] Migrations run on first launch after a schema change
