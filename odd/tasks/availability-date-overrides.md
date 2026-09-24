# Feature: availability-date-overrides

- **Objective:** Implement spec `specs/active/009-add-availability-date-overrides/spec.md`.
- **Problem / why:** Admin can only set weekly (Mon–Sun) hours; needs custom hours on specific dates per session type. Backend already exposes `/api/admin/availability-overrides`.
- **Scope:** frontend only — API client, MSW mock, ScheduleTab "Dates especials" section. Closed days stay in BlockedTab.
- **Constraints:** no new dependencies; Catalan UI copy; mobile parity (spec 008); match existing CRUD tab patterns.
- **Branch:** `feature/exception-days-book`
- **TDD:** strict mode configured globally, but the repo has no test runner (no vitest/jest; spec NFR forbids new deps). RED/GREEN not possible → functional checks only: `npm run build`, `npm run lint`, manual `npm run dev:mock`.
- **Delivery strategy:** ask-on-risk. Forecast ~400 authored lines.

## Tasks

- [ ] T0 — Commit spec 009 + contract snapshot. Route: inline (mechanical).
- [ ] T1 — API types/functions in `booking.admin.api.ts`; MSW entity + seed in `mock.db.ts`, CRUD handlers (overlap 409, invalid range 400, 404) in `booking-admin.handlers.ts`; replace rule in `availability.mock.ts`. Route: delegated writer (writer trigger: 3+ non-trivial files).
- [ ] T2 — "Dates especials" section in `ScheduleTab.tsx` (FR-1..FR-6), errorCode → Catalan messages, mobile layout. Route: delegated writer (same writer, preparation trigger).

## Acceptance criteria

See spec §11.

## Checks

`npm run build`, `npm run lint` per task.

## Progress / evidence

(none yet)

## Next step

T0.
