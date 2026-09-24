# 009 — Availability date overrides (admin)

- **Status:** draft
- **Owner:** Narcís
- **Created:** 2026-09-24
- **Updated:** 2026-09-24 (design A: bulk-per-day builder, final backend contract; day builder moved into a
  right-side Drawer with icon actions, same pattern as the session-type editor)

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
  `GET /api/admin/availability-overrides?sessionTypeId={id}&from={today}`, which already returns one entry
  per day; the list is rendered one row per day, ascending by date (re-sorted client-side defensively).
  Changing the session type reloads the list.
- FR-2: Admin builds a day's overrides inside a modal (the "day builder", opened via the section header's
  create icon action): pick a date, add one or more non-overlapping ranges (`Franja 1..N`, optionally
  pre-filled from that weekday's weekly hours via "Copiar horari setmanal"), and save the whole day in a
  single request: `POST /api/admin/availability-overrides/{sessionTypeId}/{date}`, body
  `{ ranges: [{ startTime: 'HH:mm:ss', endTime: 'HH:mm:ss' }, ...] }`, 200. This call **atomically replaces**
  every range for that (sessionTypeId, date) — it is not a per-range create. The page itself shows only the
  read-only list; no editing happens outside the modal.
- FR-3: Admin edits a day via its row's edit icon action (opens the modal pre-filled with that date and its
  ranges, date field locked since the date is part of the key, re-saves with the same POST) or reverts a whole
  day to the weekly schedule via the row's revert icon action, which re-saves the day with `ranges: []` through
  the same POST. Both destructive paths (reverting a day, or saving the modal down to zero rows) are behind a
  `Popconfirm` that explains the fallback (see FR-4a). List chips are read-only — there is no per-range delete
  on the page.
- FR-4: The section shows a persistent notice: overrides **replace** the weekly hours for that date, they never
  add to them — copy: *"Substitueix l'horari setmanal d'aquest dia. Si una data té franges especials, només
  s'ofereixen aquestes; l'horari setmanal d'aquell dia s'ignora. Per tancar un dia sencer, fes servir Dies
  bloquejats."*, with "Dies bloquejats" linking to `/admin/blocked`. Each date row also shows that weekday's
  weekly ranges (struck through) for comparison, read from the already-loaded weekly availability.
- FR-4a: **`ranges: []` does not close the day — it removes the override**, so that date falls back to its
  weekday's weekly hours. Every UI path that can reach an empty `ranges` array (removing a day's last chip,
  or saving the day builder with zero rows on a date that currently has an override) must say so explicitly
  before sending it: confirm copy *"Eliminar la data especial? El dia tornarà a l'horari setmanal (<weekly
  ranges for that weekday, or 'tancat'>)."*, and the triggering button is labelled **"Tornar a l'horari
  setmanal"**, never "Desar dia". Saving zero ranges on a date that has no existing override is a no-op and
  stays disabled (nothing to revert).
- FR-5: Errors are mapped by the problem+json `errorCode` to Catalan messages:
  - `TIME_RANGE_INVALID` (400) — end must be after start.
  - `SESSION_TYPE_NOT_BOOKABLE` (400) — session type cannot be booked.
  - `AVAILABILITY_RANGE_OVERLAP` (409) — two ranges in the same save overlap each other. The backend 409 is
    only a backstop; client-side validation (complete rows, end after start, no overlap between rows) is the
    primary guard and blocks the save before any request is sent. The server does not report which rows
    conflict, so a 409 shows a generic message, not per-row highlighting.
  - 401 — handled by existing `useApiError` (session cleared, redirect to login).
  - There is no 404 on this endpoint: a POST for a date with no existing override simply creates one.
- FR-6: When the chosen date falls inside a blocked period, the builder shows an informational hint that the
  override has no effect while the block exists (saving is still allowed), and the matching list row shows a
  warning line ("Dins d'un període bloquejat · no té efecte") with its chips rendered muted/dashed.

## 6. Non-functional requirements

- NFR-1: Catalan UI copy, consistent with spec 003.
- NFR-2: No new dependencies — antd `DatePicker`, `TimePicker.RangePicker`, `Popconfirm`, existing `api.client`.
- NFR-3: Mobile parity with spec 008 (card layout on narrow screens).
- NFR-4: Times sent/received as `TimeOnly` strings `HH:mm:ss`, studio-local, same as weekly availability.

## 7. Data model

Ranges have no identity of their own — they only exist as rows inside a day:

```ts
interface TimeRange {
  startTime: string; // 'HH:mm:ss'
  endTime: string;
}

interface AvailabilityOverrideDay {
  sessionTypeId: number;
  date: string; // 'YYYY-MM-DD'
  ranges: TimeRange[];
}
```

There is no wire representation for "an empty override day" — a date with no override simply does not appear
(GET) or is removed from storage (POST with `ranges: []`, see FR-4a).

Resolution rule (backend `AvailabilityCalculator`, mirrored in the MSW mock). For each date, no slots if
the date is blocked, outside the session's bookable window, or beyond the booking horizon. Otherwise, if an
override day exists for `(sessionTypeId, date)` its ranges **replace** the weekday ranges entirely; else
weekday ranges apply.

## 8. API surface

All AdminOnly (JWT), base `/api/admin/availability-overrides`. Errors are RFC 9457 problem+json with `errorCode`.
This is the final contract, confirmed by the backend (branch `feature/exception-days-book`); it supersedes any
earlier per-range CRUD or `/days/{date}` draft this spec went through during design.

| Method | Path | Query / body | Success | Errors |
|---|---|---|---|---|
| GET | `/` | `sessionTypeId?`, `from?`, `to?` | 200 `AvailabilityOverrideDay[]`, grouped by day | 401 |
| POST | `/{sessionTypeId}/{date}` | body `{ ranges: TimeRange[] }` | 200 `AvailabilityOverrideDay` (same shape as a GET item) | 400, 401, 409 |

POST atomically **replaces** every range for that `(sessionTypeId, date)`; `ranges: []` removes the override
(FR-4a — the date falls back to weekly hours, it does not close). No 404: a POST for a date with nothing stored
yet just creates it. 409 (`AVAILABILITY_RANGE_OVERLAP`) only covers two ranges overlapping *within the same
payload* — the response carries no per-row detail (FR-5). The per-row `POST /`, `PUT /{id}`, `DELETE /{id}`
endpoints from earlier drafts of this spec no longer exist.

Public `GET /api/bookings/availability` is unchanged; it already reflects overrides.

## 9. UI / UX — design A (drawer day builder + read-only list)

Canvas mockup: https://claude.ai/artifact/5DNQ34iFGoDcid4VjAL3eo (superseded on the editing surface by the
right-side Drawer described below, same pattern as the session-type editor in `SessionsTab.tsx`; the
list/grouping design still applies).

- `ScheduleTab.tsx` renders `DateOverridesSection.tsx`, a new "Dates especials" section under the weekly
  grid, scoped to the selected session type. Header: section title + "N dates programades" count + an
  icon action (`create`, tooltip "Nova data especial") that opens the day builder drawer for a new day.
- Persistent notice (FR-4) above the list, with a `Dies bloquejats` link to `/admin/blocked`.
- **The page shows only the read-only list** — there is no inline editing surface. All editing happens in
  the drawer described below.
- **List**, grouped by day (one row per date, ascending): date heading; an `edit` icon action (tooltip
  "Editar dia") that opens the drawer pre-filled with that day; an optional `remove` icon action (tooltip
  "Tornar a l'horari setmanal") behind a `Popconfirm` (FR-4a) that reverts the day in place. Both actions sit
  grouped and right-aligned on the date line so they never drop onto their own line below the chips.
  "Setmanal: <weekly ranges, struck through>" or "Setmanal: tancat"; the day's ranges as read-only pill
  chips (no delete affordance on the page). Blocked-period days show a warning line and render their chips
  muted/dashed (FR-6).
- **Day builder Drawer** (antd `Drawer`, right-side, `width={isMobile ? '100%' : 480}`, same pattern as the
  session-type editor in `SessionsTab.tsx`, opened by the header's create action or a row's edit action;
  title "Nova data especial" or "Editar data especial"):
  - "Data" label; `DatePicker` "Nova data especial" (past dates disabled), locked/disabled once it resolves
    to an existing override day (the date is part of the key) — whether reached by editing a row or by
    picking an already-programmed date fresh.
  - Next to it, a caption with that date's weekday and weekly hours (e.g. *"Dissabte · horari setmanal:
    10:00–14:00"*), plus a "Copiar horari setmanal" button (plain, not link-styled) that pre-fills the rows
    from it.
  - "Franges" label; N range rows ("Franja 1..N"): `TimePicker.RangePicker` (15-min step, grows to the row's
    full width — touch-friendly on the full-width mobile drawer) + a `remove` icon action (tooltip "Treure
    franja") fixed at its side. "Afegir franja" (plain button with the create icon) adds a row.
  - Client-side validation runs on every row change (FR-5) and disables the save action with an inline
    message until it passes.
  - Drawer footer (`Space`, right-aligned, matching `SessionsTab`'s footer): "Cancel·lar" (closes the
    drawer) + a save action that is either `<Button type="primary" icon={<AdminIcons.save />}>Desar dia</Button>`
    for a normal save, or, when saving would empty an existing day, "Tornar a l'horari setmanal" behind a
    `Popconfirm` (FR-4a).
  - Blocked-date hint (FR-6) shown inline when the picked date falls in a blocked period.
  - On a successful save, the drawer closes and the returned day is merged into the list in place — no
    refetch of the whole list.
- Every `IconButton` in this section uses the default size (no `size="small"`), consistent with the rest of
  the admin (e.g. `SessionsTab`'s card footer actions).
- No link-styled (blue) text buttons anywhere in this section: every action is either an icon button with a
  tooltip (`AdminIcons`/`IconButton`, edit/remove/create) or a plain default/primary text button (including
  the drawer's icon+text save button).
- States: loading, empty (*"Cap data especial programada"*), error (toast via `useApiError`).
- Types + `saveAvailabilityOverrideDay` / `fetchAvailabilityOverrides` in `src/services/booking/booking.admin.api.ts`.
- MSW: `mock.db.ts` stores `availabilityOverrideDays: AvailabilityOverrideDay[]` (one entry per day that has
  an override — no entry means no override), handlers for GET and the day POST (overlap → 409), and
  `availability.mock.ts` `rangesForDate()` reads that store for the replace rule.

## 10. Edge cases

- Override shorter than the weekly rule **reduces** that day's availability (by design; the FR-4 notice explains it).
- Two ranges in the same day-builder save overlap each other → 409, builder keeps its values (client-side
  validation should normally catch this before the request is even sent).
- Date inside a blocked period → saved but ineffective (FR-6 hint).
- Removing a day's last range, or saving the builder with zero rows on an existing override day, reverts that
  date to its weekly hours — it is explicitly **not** the same as closing the day (FR-4a).
- Past overrides are not listed (`from = today`).
- DST gaps are handled server-side; no UI handling.

## 11. Acceptance criteria

- [ ] FR-1: Section lists upcoming override days for the selected session type, sorted by date; switching type reloads.
- [ ] FR-2: The day builder drawer saves one or more non-overlapping ranges for a date in a single request; the page itself
      shows only the list, never an inline editing surface; they appear in the list after the drawer closes.
- [ ] FR-3: The row's edit icon action reloads a day into the drawer with the date locked; the row's revert icon action
      reverts the whole day behind a confirm. List chips are read-only (no per-range delete on the page).
- [ ] FR-4 / FR-4a: Replace notice and "Dies bloquejats" link visible; weekly ranges shown (struck through) per date row;
      every path that can empty a day's ranges shows the revert-to-weekly confirm and button label, never "Desar dia".
- [ ] No link-styled (blue) text buttons in this section; edit/remove/create/save actions are icon buttons with tooltips.
- [ ] FR-5: Each `errorCode` shows its Catalan message; client-side validation blocks incomplete/invalid/overlapping
      rows before any request; 401 redirects to login.
- [ ] FR-6: Blocked-date hint appears in the builder and the matching list row (muted/dashed chips) when applicable.
- [ ] `npm run dev:mock`: an override changes the slots shown in the public booking calendar (DateTimeStep) for that date only.
- [ ] Mobile layout usable (NFR-3): list rows and the builder header stack vertically on narrow screens.

## 12. Open questions

- Backend contract implemented (uncommitted on the backend's `feature/exception-days-book`); `assets/`
  snapshot refreshed from `docs/contracts/availability-overrides.json` on 2026-09-24. Note: `ranges` is
  `nullable` in the generated schema but never null in practice (empty day = `[]`); typed as always present.
- Should past overrides be viewable (history)? Default: no.

## 13. Out of scope / future work

- Bulk creation (same hours across a date range).
- Copying weekly hours into an override as a starting point.
- Calendar view of overrides + blocked periods together.
