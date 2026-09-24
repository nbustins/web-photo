# 009 — Availability date overrides (admin)

- **Status:** draft
- **Owner:** Narcís
- **Created:** 2026-09-24
- **Updated:** 2026-09-24

## 1. Context

Availability is currently defined by two inputs (spec 003 FR-11/FR-12):

- **Weekly availability** — per session type, time ranges per weekday (Mon–Sun), edited in `ScheduleTab`.
- **Blocked periods** — global `from..to` date ranges that close whole days for all session types, edited in `BlockedTab`.

There is no way to set different hours for one specific date (e.g. extra afternoon on a Saturday, shorter
hours on a holiday eve). The backend (`wedding-manager-api`, branch `feature/exception-days-book`) already
exposes **availability overrides**: per session type, per date, one time range per row. Contract snapshot:
`assets/availability-overrides.json`.

## 2. Goal

Admin can define custom hour ranges for a specific date and session type from the Schedule tab, and the
public booking calendar reflects them.

## 3. Non-goals

- Closing a date — already covered by blocked periods (`BlockedTab`). Not duplicated here.
- A unified "special dates" UI mixing closed days and custom hours.
- Recurring or multi-date overrides (one override = one date + one range).
- Backend changes or new params on the public `GET /api/bookings/availability`.

## 4. User stories

- As an admin, I want to set custom hours for a specific date and session type, so that clients can book
  on days that differ from the weekly schedule.
- As an admin, I want to split a date into several ranges (e.g. 10:00–13:00 and 16:00–19:00), so that I
  can leave a gap for other commitments.
- As an admin, I want to see and remove upcoming overrides, so that I can undo exceptions that no longer apply.

## 5. Functional requirements

- FR-1: The Schedule tab shows a **"Dates especials"** section below the weekly grid, scoped to the currently
  selected session type. It lists overrides from
  `GET /api/admin/availability-overrides?sessionTypeId={id}&from={today}`, grouped by date, sorted ascending.
  Changing the session type reloads the list.
- FR-2: Admin creates an override with a date and a time range (`POST`, body
  `{ sessionTypeId, date: 'YYYY-MM-DD', startTime: 'HH:mm:ss', endTime: 'HH:mm:ss' }`, 201).
  Several non-overlapping ranges on the same date are allowed (one row each).
- FR-3: Admin edits a range (`PUT /api/admin/availability-overrides/{id}`, same body, 200) and deletes it
  after a `Popconfirm` (`DELETE /api/admin/availability-overrides/{id}`, 204).
- FR-4: The section shows a persistent notice: overrides **replace** the weekly hours for that date, they never
  add to them — copy: *"Substitueix l'horari setmanal d'aquest dia"*. Each date group also shows that weekday's
  weekly ranges for comparison (read from the already-loaded weekly availability).
- FR-5: Errors are mapped by the problem+json `errorCode` to Catalan messages:
  - `TIME_RANGE_INVALID` (400) — end must be after start.
  - `SESSION_TYPE_NOT_BOOKABLE` (400) — session type cannot be booked.
  - `AVAILABILITY_RANGE_OVERLAP` (409) — range overlaps another override on the same date.
  - `AVAILABILITY_OVERRIDE_NOT_FOUND` (404) — show message and reload the list.
  - 401 — handled by existing `useApiError` (session cleared, redirect to login).
- FR-6: When the chosen date falls inside a blocked period, the form shows an informational hint that the
  override has no effect while the block exists. Saving is still allowed.

## 6. Non-functional requirements

- NFR-1: Catalan UI copy, consistent with spec 003.
- NFR-2: No new dependencies — antd `DatePicker`, `TimePicker.RangePicker`, `Popconfirm`, existing `api.client`.
- NFR-3: Mobile parity with spec 008 (card layout on narrow screens).
- NFR-4: Times sent/received as `TimeOnly` strings `HH:mm:ss`, studio-local, same as weekly availability.

## 7. Data model

```ts
interface AvailabilityOverride {
  id: number;
  sessionTypeId: number;
  date: string;      // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm:ss'
  endTime: string;   // 'HH:mm:ss'
}
```

Resolution rule (backend `AvailabilityCalculator`, mirrored in the MSW mock). For each date, no slots if
the date is blocked, outside the session's bookable window, or beyond the booking horizon. Otherwise, if any
overrides exist for `(sessionTypeId, date)` they **replace** the weekday ranges entirely; else weekday ranges apply.

## 8. API surface

All AdminOnly (JWT), base `/api/admin/availability-overrides`. Errors are RFC 9457 problem+json with `errorCode`.

| Method | Path | Query / body | Success | Errors |
|---|---|---|---|---|
| GET | `/` | `sessionTypeId?`, `from?`, `to?` | 200 `AvailabilityOverride[]` | 401 |
| POST | `/` | `CreateAvailabilityOverrideRequest` | 201 `AvailabilityOverride` | 400, 401, 409 |
| PUT | `/{id}` | `UpdateAvailabilityOverrideRequest` | 200 `AvailabilityOverride` | 400, 401, 404, 409 |
| DELETE | `/{id}` | — | 204 | 401, 404 |

Request body (create/update, all required): `{ sessionTypeId (≥1), date, startTime, endTime }`.
Public `GET /api/bookings/availability` is unchanged; it already reflects overrides.

## 9. UI / UX

- `ScheduleTab.tsx`: new "Dates especials" section under the weekly grid.
- Form: `DatePicker` (past dates disabled) + `TimePicker.RangePicker` + add button.
- List grouped by date: header = formatted date + weekday + weekly ranges for comparison; rows = ranges with
  edit/delete actions.
- States: loading, empty (*"Cap data especial programada"*), error (toast via `useApiError`).
- API functions + type added to `src/services/booking/booking.admin.api.ts`.
- MSW: `mock.db.ts` entity + seed, handlers for the 4 endpoints (overlap → 409), and
  `availability.mock.ts` `slotsForDate()` applies the replace rule.

## 10. Edge cases

- Override shorter than the weekly rule **reduces** that day's availability (by design; the FR-4 notice explains it).
- Overlapping range on same date → 409, form keeps its values.
- Date inside a blocked period → saved but ineffective (FR-6 hint).
- Override deleted elsewhere → 404 on edit/delete → reload list.
- Past overrides are not listed (`from = today`).
- DST gaps are handled server-side; no UI handling.

## 11. Acceptance criteria

- [ ] FR-1: Section lists upcoming overrides for the selected session type, grouped and sorted by date; switching type reloads.
- [ ] FR-2: Creating one or more ranges on a date persists them and they appear in the list.
- [ ] FR-3: Editing updates the range; deleting after confirm removes it.
- [ ] FR-4: Replace notice visible; weekly ranges shown per date group.
- [ ] FR-5: Each `errorCode` shows its Catalan message; 404 reloads; 401 redirects to login.
- [ ] FR-6: Blocked-date hint appears when applicable.
- [ ] `npm run dev:mock`: an override changes the slots shown in the public booking calendar (DateTimeStep) for that date only.
- [ ] Mobile layout usable (NFR-3).

## 12. Open questions

- Backend contract is untracked on `feature/exception-days-book` until merged — frontend implementation waits for it (or uses MSW).
- Should past overrides be viewable (history)? Default: no.

## 13. Out of scope / future work

- Bulk creation (same hours across a date range).
- Copying weekly hours into an override as a starting point.
- Calendar view of overrides + blocked periods together.
