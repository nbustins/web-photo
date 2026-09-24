# Feature: availability-date-overrides

- **Objective:** Implement spec `specs/active/009-add-availability-date-overrides/spec.md`.
- **Problem / why:** Admin can only set weekly (Mon–Sun) hours; needs custom hours on specific dates per session type. Backend already exposes `/api/admin/availability-overrides`.
- **Scope:** frontend only — API client, MSW mock, ScheduleTab "Dates especials" section. Closed days stay in BlockedTab.
- **Constraints:** no new dependencies; Catalan UI copy; mobile parity (spec 008); match existing CRUD tab patterns.
- **Branch:** `feature/exception-days-book`
- **TDD:** strict mode configured globally, but the repo has no test runner (no vitest/jest; spec NFR forbids new deps). RED/GREEN not possible → functional checks only: `npm run build`, `npm run lint`, manual `npm run dev:mock`.
- **Delivery strategy:** ask-on-risk. Forecast ~400 authored lines.

## Tasks

- [x] T0 — Commit spec 009 + contract snapshot. Route: inline (mechanical).
- [x] T1 — API types/functions in `booking.admin.api.ts`; MSW entity + seed in `mock.db.ts`, CRUD handlers (overlap 409, invalid range 400, 404) in `booking-admin.handlers.ts`; replace rule in `availability.mock.ts`. Route: delegated writer (writer trigger: 3+ non-trivial files).
- [x] T2 — "Dates especials" section in `ScheduleTab.tsx` (FR-1..FR-6), errorCode → Catalan messages, mobile layout. Route: delegated writer (same writer, preparation trigger). Extracted to sibling `DateOverridesSection.tsx` (container/presentational, kept ScheduleTab readable).
- [x] T3 — Rework "Dates especials" to design A (day builder + bulk save + grouped list). Route: delegated writer (writer trigger: rewrite touches 6+ files).
- [x] T4 — Move day editing into modal; icon actions with tooltips; no link-style text. Route: delegated writer.

## Acceptance criteria

See spec §11.

## Checks

`npm run build`, `npm run lint` per task.

## Progress / evidence

- T0: commit `fc067c3` (docs(specs): add 009 availability date overrides spec) — pre-existing on branch before this work session.
- T1: commit `94868dc` — "feat(admin): add availability overrides api client and mocks". Files: `src/services/booking/booking.admin.api.ts`, `src/services/error-messages.ts`, `src/mocks/mock.db.ts`, `src/mocks/handlers/booking-admin.handlers.ts`, `src/mocks/availability.mock.ts`. Checks: `npm run build` OK; `npm run lint` 0 errors, 4 pre-existing warnings in unrelated files.
- T2: **uncommitted** (coordinator instructed no further commits this session — leave working tree dirty). Files: `src/pages/admin/tabs/DateOverridesSection.tsx` (new), `src/pages/admin/tabs/ScheduleTab.tsx`, `src/pages/admin/labels.ts` (`weekdayOfDate` helper). Checks: `npm run build` OK; `npm run lint` 0 errors, same 4 pre-existing warnings.
- Deviation: `validateSlot()` in `src/mocks/availability.mock.ts` was also updated to use the same `rangesForDate()` helper as `slotsForDate()`, so the POST booking re-check mock stays consistent with what the calendar shows for an overridden date. Not explicitly required by spec 009 but avoids a mock-only mismatch bug.
- FR-6 blocked-period hint fetches blocked periods once on mount (parity with `BlockedTab`'s load-once pattern), not re-fetched per session-type change (blocked periods are global, not scoped to session type).
- T3: **uncommitted** (no-commit instruction still in effect — leave working tree dirty pending user approval). Superseded T2's per-row CRUD UI with design A (day builder + bulk save + grouped list) against the now-final backend contract (`GET /api/admin/availability-overrides` → `AvailabilityOverrideDay[]`, `POST /api/admin/availability-overrides/{sessionTypeId}/{date}` (verb changed from PUT by backend, 2026-09-24) with atomic replace, `ranges: []` = remove override, not close the day).
  - Files: `src/pages/admin/tabs/DateOverridesSection.tsx` (full rewrite — day builder + grouped list, client-side validation, revert-to-weekly semantics), `src/services/booking/booking.admin.api.ts` (removed per-row `AvailabilityOverride`/`AvailabilityOverridePayload` + create/update/delete; added `TimeRange`, `AvailabilityOverrideDay`, `saveAvailabilityOverrideDay`), `src/mocks/mock.db.ts` (`availabilityOverrideDays` store replacing the flat id-keyed array; dropped its id sequence), `src/mocks/handlers/booking-admin.handlers.ts` (replaced the 4 per-row endpoints with GET + day PUT), `src/mocks/availability.mock.ts` (`rangesForDate()` reads the new store), `src/pages/admin/labels.ts` (added `formatDateHeading`), `src/pages/admin/admin.module.css` (new "Dates especials" classes: day builder, grouped-list grid, chips, mobile stacking), `src/services/error-messages.ts` (dropped unused `AVAILABILITY_OVERRIDE_NOT_FOUND` — no 404 on the final contract), `specs/active/009-add-availability-date-overrides/spec.md` (FR-1..FR-6, §7, §8, §9, §10, §11, §12 rewritten for design A + final contract).
  - Checks: `npm run build` OK (clean TS compile); `npm run lint` 0 errors, same 4 pre-existing warnings (familiar.page.tsx, WeddingGuestPage.tsx, WeddingManagerPage.tsx) — none in touched files.
  - Deviations from the mid-task brief: (1) the coordinator's first two API-shape notes (proposed `PUT /days/{date}?sessionTypeId=` with `rangeIndexes` on 409) were superseded mid-task by a final contract (`PUT /{sessionTypeId}/{date}`, no `rangeIndexes`, no 404); the code reflects only the final shape, no leftover TODO markers. (2) `ApiError`/`ProblemDetails` briefly gained a `rangeIndexes` field for the interim contract and was reverted once the final contract dropped it — net diff on `api.client.ts` is zero.
  - Not run this session: manual `npm run dev:mock` walkthrough of FR-1..FR-6 and the DateTimeStep override-reflection acceptance criterion.
- T4: **uncommitted** (no-commit instruction still in effect — leave working tree dirty). Moved the day builder from an
  always-visible on-page card into an antd `Modal`, opened via the section header's create icon action or a row's edit
  icon action; the page itself now renders only the read-only list. Replaced every `type="link"` Button (Editar dia,
  Copiar horari setmanal, Afegir franja) and the per-chip `×` delete with `IconButton`/tooltip actions or plain
  default/primary buttons — no link-styled blue text remains in this section. Added a `remove` icon action per row
  (behind `Popconfirm`, posts `ranges: []`) so a day can be reverted to weekly hours without opening the modal. Added
  `save: SaveOutlined` to `AdminIcons` (icons.tsx) for the modal's primary save action. On save, the returned day is
  merged into local state (`mergeDay`) instead of refetching the whole list.
  - Files: `src/pages/admin/tabs/DateOverridesSection.tsx` (rewrite — modal-based editing), `src/pages/admin/icons.tsx`
    (`save` icon), `src/pages/admin/admin.module.css` (dropped the unused `.dayBuilder` card-background class and the
    unused `.chipRemove` class; `.dayBuilderHead`/`.builderRow`/`.dayBuilderFooter` now describe modal content),
    `specs/active/009-add-availability-date-overrides/spec.md` (FR-2, FR-3, §9, §11 updated for the modal design).
  - Checks: `npm run build` OK (clean TS compile); `npm run lint` (via `rtk proxy npx eslint .`, direct output was
    garbled) 0 errors, same 4 pre-existing warnings (familiar.page.tsx, WeddingGuestPage.tsx, WeddingManagerPage.tsx) —
    none in touched files.
  - Not run this session: manual `npm run dev:mock` walkthrough of the modal flow.
- T4 follow-up (same task, user correction): **uncommitted**. Replaced the antd `Modal` from the first T4 pass with a
  right-side `Drawer` (`width={isMobile ? '100%' : 480}`), copying `SessionsTab.tsx`'s session-type editor drawer
  exactly: `title`/`onClose`/`footer={<Space style={{ width: '100%', justifyContent: 'flex-end' }}>…</Space>}`.
  Footer is "Cancel·lar" + `<Button type="primary" icon={<AdminIcons.save />}>Desar dia</Button>` (icon+text, not
  icon-only), or the danger "Tornar a l'horari setmanal" + `Popconfirm` when the edit would empty an existing day.
  Removed every `size="small"` from `IconButton` in this section (edit/remove row actions, remove-franja action) so
  they use the default size like the rest of the admin. Range rows: `TimePicker.RangePicker` now grows to fill the
  row (new `.builderRange { flex: 1 }` CSS) with the remove icon fixed at its side — touch-friendly on the full-width
  mobile drawer. List rows: edit/remove icon actions grouped in a new `.dateOverrideActions` span, `dateOverrideHead`
  now `justify-content: space-between` so the actions stay right-aligned on the date line instead of risking a wrap
  below the chips. Added light "Data" / "Franges" captions above the drawer's date and range-rows sections instead of
  converting to a full antd `Form` — the builder's cross-row overlap/revert-mode validation doesn't map cleanly onto
  `Form.Item`/`Form.List`, so a full Form rewrite was skipped as disproportionate; the labels alone satisfy the
  "cleaner body" intent.
  - Files: `src/pages/admin/tabs/DateOverridesSection.tsx` (Modal → Drawer, size="small" removals, builderRange
    className), `src/pages/admin/admin.module.css` (dropped the now-unused `.dayBuilderFooter`; added `.builderRange`
    and `.dateOverrideActions`; `.dateOverrideHead` gained `justify-content: space-between`),
    `specs/active/009-add-availability-date-overrides/spec.md` (`Updated:` line, §9, §11: "modal" → "right-side
    drawer, same pattern as the session-type editor").
  - Checks: `npm run build` OK (clean TS compile); `npm run lint` (via `rtk proxy npx eslint .`) 0 errors, same 4
    pre-existing warnings, none in touched files.
  - Not run this session: manual `npm run dev:mock` walkthrough of the drawer flow.

## Next step

Manual `npm run dev:mock` check of FR-1..FR-6 (design A, drawer editing) and the DateTimeStep override-reflection
acceptance criterion is still open. Commit T2+T3+T4 when the user lifts the no-commit instruction, once the backend
contract is actually implemented (it is confirmed but not yet live — see spec §12).
