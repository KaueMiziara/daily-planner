# CLAUDE.md

## General Information

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

### Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch <https://docs.expo.dev/llms.txt> — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: <https://docs.expo.dev/router/introduction.md>

### Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: <https://docs.expo.dev/eas/index.md>

### Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: <https://docs.expo.dev/versions/latest/index.md>

## About the App

Offline-first daily/weekly planner (Expo + React Native + TypeScript). Built for one real user first
(Android tablet, phone later); may be published later. Product spec: `docs/PROJECT.md`.
Deferred work, known limitations and open decisions: `docs/ROADMAP.md`. Manual QA: `docs/QA_CHECKLIST.md`.

### Stack

Expo SDK 57, React Native (New Architecture, React Compiler enabled), TypeScript (strict), Expo Router
(`src/app`), expo-sqlite + Drizzle ORM, Zustand, React Hook Form + Zod, date-fns, rrule,
expo-notifications (local notifications only), expo-image. Tests: Jest (jest-expo). No backend, no accounts.

### Commands

- `npm run typecheck && npx expo lint && npm test && npm run format`: must pass before finishing any task
- `npx expo start` (dev client on the Android emulator, press `a`); native rebuild: `npx expo run:android`
- `npx drizzle-kit generate` after any change to a Drizzle schema (commit `drizzle/`)
- Install packages with `npx expo install <pkg>` so versions match the SDK

### Architecture

Feature-based, offline-first, thin routes.

```
src/app/            routes only: compose, no business logic. Root layout runs migrations, then mounts NotificationEffects
src/features/
  tasks/            db/schema.ts, schemas.ts (Zod), repository.ts, completions.ts,
                    schedule.ts, recurrence.ts, occurrences.ts (pure logic), hooks.ts, components/
  calendar/         monthGrid.ts (pure), components/
  notifications/    planner.ts (pure), scheduler.ts (interface), sync.ts, expoScheduler.ts, hooks.ts, components/
  settings/         components/
src/components/ui/  shared primitives (Screen, AppText, Button, TextField, DateTimeField, ThemeBackground)
src/lib/db/         Drizzle client; schema.ts re-exports every feature's tables
src/theme/          tokens, types, persisted store, useTheme, packs/, contrast helper
src/hooks/          useNow (minute tick + foreground), useBreakpoint
src/utils/          format.ts, week.ts
drizzle/            generated migrations (never edit shipped ones)
```

Rules:

- Each feature exposes a public API through `index.ts`. Import other features only through it, never their internals.
  Dependency direction: `settings` and `notifications` may use `tasks`; `tasks` must not import `notifications`.
- Routes stay thin. Logic lives in features; pure logic (no React, no DB imports) lives in plain `.ts` files and is unit tested.
- The repository is the only code that writes tasks. Validate with Zod at that boundary. Delete = soft delete (`deletedAt`).
- Drizzle schema files imported by `drizzle-kit` must use relative imports (it does not resolve `@/`).

### Data and time model (do not change casually)

- Dates are stored as epoch milliseconds (UTC). "Day" keys are local `yyyy-MM-dd` strings.
- `overdue` is **derived** (`!done && endAt < now`), never stored.
- Recurrence is an **RRULE string** in `tasks.recurrenceRule`; occurrences are expanded on demand for a date range
  (`recurrence.ts`), not stored. Expansion converts local wall-clock time to "floating" UTC so 09:00 stays 09:00 across DST.
- Completion is **per occurrence**: `task_completions(taskId, occurrenceDate)`; one-off tasks use `occurrenceDate = 'single'`.
- All-day tasks are normalized on save to 00:00 to 23:59:59.999 (`normalizeAllDay`).
- Reminders are a **projection** of the data: `planReminders` (pure) builds a rolling 7-day plan (max 60),
  `createReminderSync` pushes it to the OS through the `ReminderScheduler` interface. Never schedule notifications from features directly.
- Anything that depends on "now" must take it from `useNow()` (or an argument), not `new Date()` during render.

### Conventions

- Styling: only theme tokens via `useTheme()`. No hard-coded colors, spacing or radii in screens or components.
  Every change must look right in light and dark, on phone and tablet widths (`useBreakpoint`).
- Theme packs are data (`src/theme/packs`). Every pack must pass the contrast tests in `packs.test.ts`.
- State: SQLite for domain data (live queries via `useLiveQuery`), Zustand for settings, TanStack-style server state is not used.
  Avoid React Context for frequently changing state.
- Forms: React Hook Form + Zod. Use `useWatch`, not `watch()` (React Compiler cannot memoize `watch`).
- Imports use the `@/` alias (maps to `src/`).
- Tests: write them only for logic worth guarding (scheduling, recurrence, planning, validation). No snapshot or trivial tests.
- Keep dependencies minimal. Ask before adding one or changing the architecture.

### Local-only files (never commit, never edit)

- `src/theme/packs/private/index.ts` is committed empty; locally it holds a character theme pack (`git update-index --skip-worktree`).
- `assets/themes-private/` holds copyrighted artwork and is gitignored. Committed code and assets must contain no third-party character IP.
- `android/` is generated (Continuous Native Generation) and gitignored. Change native config through `app.json` / config plugins.

### Gotchas already hit

- `@react-native-community/datetimepicker` uses `onValueChange` / `onDismiss` (`onChange` is deprecated).
- In `_layout.tsx` declare `(tabs)` first in the Stack, otherwise a modal becomes the initial route. Close modals with
  `router.canGoBack() ? back() : replace('/')`.
- `useLiveQuery` returns empty data before the first result; use `updatedAt` (see `useLoadedOccurrences`) before treating
  empty as "no tasks". Reminder sync must never run on unloaded data (it would cancel every scheduled notification).
- Dev environment is Linux with fish shell. `ANDROID_SDK_ROOT` must be unset (a system package sets a conflicting one).
- iOS is not tested yet (needs EAS cloud builds). Android is the primary target.

## Working agreement

Make small, focused commits. Do not change app behavior while documenting. If code and docs disagree, report it instead of
silently picking one. Prefer fixing root causes over adding workarounds.
