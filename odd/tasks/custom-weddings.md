# Feature: custom-weddings

## Objective
Let each wedding switch optional features on/off — hotel info, transport to hotel, song
requests, per-guest allergens — and surface them in the guest RSVP card (phase 1) and the
admin views (phase 2). UI is built first against MSW mocks; `wedding-manager-api` then
implements controllers/models to match the contract below (cross-repo, same feature name).

## Problem / why
Today the guest card only collects attendance + free-text notes. Couples want structured
answers (transport, allergens, songs) and to share hotel details, but only some weddings
need them, so every feature is flag-driven and all-off must look exactly like today.

## Design (approved 2026-10-01)
Canvas: https://claude.ai/artifact/1pzgPcitaFRnvvf56KfYKH — board A1 (all on), A2 (all off).
Option A: single invitation card, one component per feature, in this order:
1. `GuestAttendanceSection` (always) — existing Vinc/No vinc switches.
2. `HotelInfoSection` (`features.hotelInfo`) — read-only HTML, sanitized with DOMPurify.
3. `TransportSection` (`features.transportToHotel`) — Sí/No switch per attending guest.
4. `AllergensSection` (`features.allergens`) — per attending guest: chips + text input + "+"
   button + quick suggestions (Gluten, Lactosa, Fruits secs, Marisc); max 15, 100 chars each.
5. `SongRequestsSection` (`features.songRequests`) — list with remove + add form
   (títol required, artista optional, "+"), counter "n / 10"; max 10, 200 chars each.
6. Observacions (existing notes) — label becomes "Observacions" (allergies no longer there).
Transport/allergens list only guests marked "Vinc"; section hidden when nobody attends.
Option B (next-steps screen) discarded.

## Contract (mock = proposal for backend)
Public base `api/public/weddings`:
- `GET {slug}` → `{ slug, title, eventDate, features }` (hotelInfo NOT here — needs code).
- `GET {slug}/invites/{inviteCode}` → existing fields + `features`, `hotelInfo` (only if on),
  `songRequests: [{ title, artist }]` (only if on); per guest `usesTransportToHotel: boolean|null`
  and `allergens: string[]` (only if on).
- `POST {slug}/invites/{inviteCode}/confirm` body: existing `{ notes, guests:[{id?, name, attending}] }`
  + per guest `usesTransportToHotel`, `allergens` + top-level `songRequests`. Full replace
  (all guests always sent). Response = full updated invitation (same as GET invite).
- `features = { hotelInfo, transportToHotel, songRequests, allergens }` (bool, default false).
- Errors (ApiProblemDetails + `errorCode`): `FEATURE_IS_DISABLED` only for meaningful values
  (null / [] / absent accepted); validation error for >10 songs, >15 allergens, over-length.
- Non-attending guests: server stores `usesTransportToHotel=null`, `allergens=[]`.
Admin (phase 2): `PUT api/weddings/{id}/settings` `{ features, hotelInfo }`; `GET {id}` /
`by-slug/{slug}` add `features`, `hotelInfo`, guest fields; `GET {id}/confirmations/list`
rows add `usesTransportToHotel`, `allergens`.

## Scope
Phase 1 (this doc's active tasks): guest view + types + service + mocks.
Phase 2 (pending, separate tasks later): admin settings (feature toggles + rich-text hotel
editor), confirmations columns. Out of scope: DJ song report, Deezer autocomplete,
server-side closingDate enforcement, per-field error paths.

## Constraints
- Styling layering + tokens (`.claude/rules/styling.md`); UI copy Catalan; mocks per
  `.claude/rules/mocks.md`.
- New dependency allowed: `dompurify` (hotel HTML). No commits without asking the user.
- TDD: Strict TDD enabled globally, but repo has no test runner (CLAUDE.md) → checks are
  `npx tsc -b`, `npm run lint`, `npm run build`, `bash tools/check-tokens.sh`, manual run
  in `npm run dev:mock`.
- RDD: on (global). Assess each work-unit commit.
- Delivery: `ask-on-risk`; forecast ~600–800 authored lines for phase 1.

## Tasks
- [x] T1 Data layer: types (`WeddingFeatures`, `SongRequest`, guest fields), wedding
      service confirm payload/response, MSW fixtures (one wedding all features on, one all
      off) + handlers enforcing contract rules (FEATURE_IS_DISABLED, limits, non-attending
      clearing). Includes the admin data layer too (settings PUT, create fields, admin GETs,
      confirmations list) so the full contract can go to the backend after T1. Route:
      delegated (4+ files).
- [x] T2 Guest card sections: extract `GuestAttendanceSection`; add `TransportSection`,
      `AllergensSection`, `SongRequestsSection`, `HotelInfoSection` (+ dompurify);
      wire form values ↔ payload in `WeddingGuestPage`; notes label change. Route: delegated
      (2+ non-trivial files).
- [ ] T3 Phase 2 admin (to be detailed after phase 1).

## Acceptance criteria
- All features off → guest card identical to today.
- All on (mock) → A1 layout; transport/allergens only for attending guests; limits enforced
  in UI; payload matches the contract; confirm response re-hydrates the form.
- Checks pass with 0 lint errors.

## Progress / evidence
- 2026-10-01: design approved (option A), contract feedback exchanged with backend session.
- T1 implemented by delegated writer (uncommitted, ~349+/38- across 8 src files):
  types, guest/public/admin/confirmations APIs, `updateWeddingSettings`, create-wedding
  `features`/`hotelInfo` multipart fields, `FEATURE_IS_DISABLED` message, fixtures (new
  all-on wedding `marta-pau` / `SOLER003`; `anna-joan` all off), handlers incl. new mock
  `GET api/weddings/{id}`. Deviations: PUT settings returns 200 + wedding body; by-slug
  adds `closingDate`; validation uses existing `VALIDATION_ERROR` + `errors` map.
- Checks: `npx tsc -b` clean (writer + parent re-run); `npm run lint` 0 errors / 4
  pre-existing warnings; `npm run build` OK; `check-tokens.sh` OK (writer). Mock handlers
  not exercised in a browser yet (covered by T2 manual run).
- Final contract sent to backend session 2026-10-01; backend accepted all 8 endpoints as
  written. PUT settings is AdminOnly. VALIDATION_ERROR `errors` keys become camelCase JSON
  paths globally (FE does not read `errors` outside mocks today → no impact). Backend will
  publish `docs/contracts/custom-weddings.json` when done.

- T1 committed `9000299` (user authorized committing by parts). RDD assess: medium
  (476 lines, already over the ~400 slice budget → slice closed at T1). Consent relayed;
  user declined review for this candidate. The decline invocation itself was refused
  (`invalid_request`: untracked files appeared from the concurrent T2 writer); a decline
  persists nothing, so delivery follows ordinary policy.

- T2 implemented by delegated writer (uncommitted): new GuestAttendanceSection,
  HotelInfoSection (+css, dompurify ^3.4.16), TransportSection, AllergensSection,
  SongRequestsSection, GuestSections.module.css, GuestFormFields (shared card body — mobile
  layout had a duplicated form, now both desktop and mobile render GuestFormFields);
  `close` icon added to `@ui/icons`; page hydration/payload per contract.
- T2 checks: `npx tsc -b` clean, `npm run build` OK, `check-tokens.sh` OK (writer);
  `npx eslint .` 0 errors / 4 pre-existing warnings (parent re-run). Browser check pending
  (user).

- Backend implemented the contract; OpenAPI `wedding-manager-api/docs/contracts/custom-weddings.json`
  checked against FE services/mocks (read-only delegated compare): compatible, no breaking
  mismatch. Asked backend to document per-allergen 100 chars, non-nullable fields, required
  guestFile. Backend extras: create 201 returns imported invitations; confirm absent/null
  songRequests keeps list; disabled-feature data wiped on confirm (pending user: FE
  recommends keep). Follow-up: `GET api/weddings/{id}` has no FE caller yet (T3).

## Next step
User tries T2 in `npm run dev:mock` (marta-pau/SOLER003, anna-joan/GARCIA01), then commit T2.
