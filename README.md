# Hodie Daily Planner

A to-do and planning app for Android, built with React Native and Expo. It works offline, stores everything on the device, and needs no account.

It was built for one real user whose phone's default notes app could not handle a routine. That app had no recurring tasks, did not mark tasks as overdue or notify at the deadline, and could not create a task for a later date. This app covers those three gaps and adds a calendar, reminders and themes.

Status: the first version is complete and in use. Android is the main target, with the tablet layout in mind. iOS has not been tested.

<!-- TODO: screenshots here: docs/screenshots/ -->

## Features

- Create, edit and delete tasks with a title, description, start and end date and time, and a time estimate.
- All-day tasks and tasks without a date.
- Recurring tasks: daily, weekly on chosen days, monthly, or every N days, weeks or months. Each occurrence is completed on its own.
- Overdue state: a task past its deadline and not done is marked overdue automatically.
- Today screen with an Overdue section and the tasks for the current day.
- Month calendar with an agenda for the selected day. Dots show pending, done and overdue tasks.
- Local notifications at the start time and the deadline. Tapping one opens the task.
- Light and dark mode, plus theme packs. Each pack has its own light and dark colors and an optional background image.
- Layout adapts to phones and tablets.

Not included yet: time tracking, backup and export, calendar sync, accounts. See [docs/ROADMAP.md](docs/ROADMAP.md).

## How it works

- **Local first.** SQLite is the source of truth. Screens read it through live queries, so lists update when the data changes.
- **Recurrence.** A recurring task stores an RRULE string (RFC 5545), the format calendar apps use. Occurrences are calculated for the visible date range and are not stored.
- **Completion.** Completion is stored per occurrence, using the task id and the day the occurrence starts.
- **Overdue.** Calculated when read, from the end time and the completion state. It is never stored.
- **Reminders.** A pure function plans the notifications for the next 7 days, up to 60 (iOS allows 64 pending). A scheduler interface passes the plan to the operating system, so changing how reminders are delivered affects one module.
- **Themes.** A pack is data: colors and an optional background for light and dark. Screens read theme tokens only. Tests check text contrast for every pack.
- **Structure.** Code is grouped by feature. Route files only compose screens. Each feature exposes a public API through its `index.ts`.

## Tech stack

| Area          | Library                                        |
| ------------- | ---------------------------------------------- |
| Framework     | Expo SDK 57, React Native, TypeScript (strict) |
| Navigation    | Expo Router                                    |
| Database      | expo-sqlite, Drizzle ORM                       |
| State         | Zustand (settings), live queries (data)        |
| Forms         | React Hook Form, Zod                           |
| Dates         | date-fns, rrule                                |
| Notifications | expo-notifications (local only)                |
| Images        | expo-image                                     |
| Tests         | Jest (jest-expo)                               |

## Project structure

```
src/
  app/              Routes. Thin files that compose screens.
  features/
    tasks/          Schema, repository, scheduling, recurrence, occurrences, task screens
    calendar/       Month grid and day agenda
    notifications/  Reminder planner, scheduler interface, sync, settings section
    settings/       Appearance and reminder settings
  components/ui/    Shared primitives (Screen, Button, TextField, DateTimeField)
  lib/db/           Database client and combined schema
  theme/            Tokens, theme packs, store, contrast helper
  hooks/            useNow, useBreakpoint
  utils/            Formatting and week settings
drizzle/            Generated database migrations
docs/               Project description, roadmap, QA checklist
```

## Getting started

Requirements:

- Node.js (current LTS)
- JDK 17
- Android Studio with the Android SDK (platform 36 and build tools 36.0.0)
- An Android emulator, or a device with USB debugging enabled

Set `ANDROID_HOME` to the SDK location. If Gradle reports conflicting SDK paths, unset `ANDROID_SDK_ROOT`.

```
npm install
npx expo run:android
```

The first build takes several minutes and generates the `android/` folder. After that, start the development server and press `a`:

```
npx expo start
```

The app needs a development build. Expo Go is not enough because the app declares native configuration (the notifications plugin and an alarm permission).

To build a release APK:

```
cd android
./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/`. Release signing for store publication is not configured.

## Scripts

```
npm run typecheck    Type check
npx expo lint        Lint
npm test             Unit tests
npm run format       Format with Prettier
npx drizzle-kit generate    Create a migration after a schema change
```

## Tests

Unit tests cover logic that is easy to get wrong:

- Scheduling: all-day normalization, day matching, overdue rules, the Today and agenda selection
- Recurrence: RRULE serialization and expansion for daily, weekly, interval and monthly rules
- Occurrences: per-occurrence completion and overdue state
- Reminders: planning rules, the 7 day window and limit, and the sync step (permission handling, repeated calls)
- Validation: task input rules
- Calendar: month grid generation
- Themes: color format and WCAG contrast for every pack

Screens are checked by hand with [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md).

## Theme packs

To add a pack, create a file in `src/theme/packs`, export a `ThemePack` with a light and a dark variant, and add it to `src/theme/packs/index.ts`. Run `npm test` to check the contrast.

A variant can include a background image. The image is drawn behind every screen and covered by a semi-transparent layer in the theme's background color, so text stays readable.

Bundled packs use original colors only. Character artwork is not part of the repository. Packs that use it are loaded from a local folder that git ignores.

## Documentation

- [docs/PROJECT.md](docs/PROJECT.md): problem, scope, design decisions
- [docs/ROADMAP.md](docs/ROADMAP.md): planned work, known limitations, open questions
- [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md): manual test checklist
- [CLAUDE.md](CLAUDE.md): rules for AI coding assistants working in this repository
