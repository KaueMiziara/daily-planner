# Project Description

> Working title: TBD

## Pitch

A personal planner/to-do app for building a daily and weekly routine. It fills the gaps of the default phone notes/tasks apps: recurring tasks, tasks scheduled for future dates, deadlines that notify, and an explicit "overdue" state. It is also themeable, with per-character theme packs that have separate light and dark looks.

The initial user (and main stakeholder) is a real person who finds her phone's default notes app insufficient for planning. The project may later be published to the stores.

## Problem

The default notes/tasks app:

- Has no recurring tasks (a daily task must be re-entered every day).
- Has no expiry/overdue handling (no notification at the deadline, no "overdue" mark).
- Cannot schedule a task for a future date (tasks are created "on the spot").

## Users

- **Primary:** one real user (iPhone daily driver, Samsung tablet at home).
- **Future:** possibly the public, if published.

## Platforms

- **First target:** Android tablet (Samsung), developed on Linux with the Android emulator.
- **Later:** iOS (cloud builds via EAS; Apple Developer account only if/when distributing).
- Layouts must be responsive (phone and tablet).

## Principles

- **Offline-first.** The app is fully usable without network. No backend, no account in the MVP.
- **Local data is the source of truth.**
- **Sync-ready data model** (UUIDs, `updatedAt`, soft deletes) so sync can be added later without a painful migration.
- **Themes are data**, not code: swappable theme packs.
- **Keep dependencies few and justified.**

## Scope

### MVP

- Task CRUD: title, description, start/end date-time, time estimate.
- "Today" view and calendar (day / week / month).
- Recurring tasks (daily, weekly, custom).
- Derived **overdue** state.
- Local notifications at start and deadline (normal notifications, not alarms).
- Light/dark modes with theme packs (colors + background image).
- Tablet-friendly layout.

### Post-MVP

- Time tracker (pausable clock + manual entry).
- Per-theme animations (different animations for light and dark).
- Sync with phone calendar / notes.
- Accounts and backend (only if published).
- iOS distribution.

## Key design decisions

| Topic             | Decision                                                                                 | Reason                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Recurrence        | Store an iCalendar RRULE (RFC 5545) string and compute occurrences for the visible range | No duplicated rows; compatible with calendar sync later                      |
| Completion        | Stored per occurrence (`taskId` + `occurrenceDate`)                                      | Completing today's instance must not complete the series                     |
| Overdue           | Derived at read time: `now > endAt && not completed`                                     | Cannot get out of sync                                                       |
| Time tracking     | Store start/end intervals, not counters                                                  | Survives app kill and reboot                                                 |
| Notifications     | Local, scheduled as a rolling window (about 7 days), re-planned on app open              | iOS caps pending local notifications at 64; data stays the source of truth   |
| Notification type | Normal notifications, behind a scheduler interface                                       | Alarm-style behavior can be added later without touching features            |
| Themes            | `{ id, name, light: {...}, dark: {...} }` packs with colors, background, animation       | Character artwork can be user-provided and kept out of published builds (IP) |
| State             | SQLite for domain data, Zustand for settings/theme, Context only for rare global values  | Avoids needless re-renders and dependencies                                  |

## Data model (draft)

- `tasks`: `id` (UUID), `title`, `description`, `startAt`, `endAt` (UTC), `allDay`, `estimateMinutes`, `recurrenceRule` (nullable RRULE), `createdAt`, `updatedAt`, `deletedAt`
- `task_completions`: `taskId`, `occurrenceDate`, `completedAt`
- `time_entries` (post-MVP): `taskId`, `startedAt`, `endedAt` (null while running), `source` (`timer` | `manual`)

## Architecture

Feature-based, offline-first, with thin routes.

- Expo Router; route files in `src/app` only compose.
- Feature modules in `src/features/<name>/` (`db`, `hooks`, `schemas`, `components`, `index.ts`).
- Features expose a public API through `index.ts`; no cross-feature deep imports.
- Repository pattern over SQLite (expo-sqlite + Drizzle).
- Zod schemas are the single source of truth for types.
- Shared UI primitives in `src/components/ui`, styled via theme tokens.

## Stack

Expo, React Native, TypeScript (strict), Expo Router, expo-sqlite, Drizzle ORM, Zustand, React Hook Form, Zod, expo-notifications, Reanimated, date-fns, rrule.

## Roadmap

1. Setup: project, aliases, lint, docs, Android tablet emulator
2. Shell: providers, navigation, theme tokens, responsive layout
3. Data layer: SQLite, Drizzle schema, migrations, task repository
4. Task CRUD: Today list, create/edit form
5. Dates and calendar: overdue state, day/week/month views
6. Recurrence: RRULE, occurrence expansion, per-occurrence completion
7. Notifications: permissions, scheduling, rolling window
8. Theme packs: colors, backgrounds, light/dark switching
9. Hardening: tests, README/architecture docs, handoff to Claude Code

## Portfolio goals

- Documented architecture and dependency decisions.
- Notifications done properly.
- UI/UX concept and design rationale.
- A real problem solved for a real user.
- Possible store publication.
