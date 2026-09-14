# 003 — Admin booking management panel

- **Status:** in-progress
- **Owner:** Narcís
- **Created:** 2026-07-16
- **Updated:** 2026-07-16 (all §12 open points closed)
- **Depends on:** API 001 (Booking), 006 (Email notifications); frontend 002 (public booking page — shares `booking.api.ts` types)

## 1. Context

The API exposes a full admin surface for the Booking module (`/api/admin/*`,
all JWT-protected) but the frontend has **no admin UI** for it. Today an admin
has no way to:

- see incoming bookings or move them through the status flow
  (`Requested → Confirmed → Paid → Cancelled`),
- configure what is bookable (session groups + types, with duration / buffer /
  season windows),
- configure **when** it is bookable (weekly availability ranges + blocked
  periods — the same inputs that feed the public availability calc, FR-5/§1 of
  API 001),
- resend a booking email or send a template test.

The only existing authenticated area is the per-wedding `WeddingManagerPage`
(its own inline login card). JWT login (`POST /api/auth/login`) is already wired
through `auth.store` + `api.client`. This spec adds a dedicated admin panel that
consumes the whole Booking admin API.

## 2. Goal

An authenticated admin manages **bookings** (list, filter, change status, resend
mail), **sessions** (groups + types CRUD) and **schedule** (weekly availability +
blocked periods CRUD) from one panel — no direct API calls.

## 3. Non-goals

- New API endpoints — this spec consumes the existing surface only (§8). Any gap
  found → API spec first, then here.
- Role management / user admin (single admin identity via existing JWT).
- Client-facing manage-booking-by-token page (separate spec).
- Analytics / reporting / calendar (month-grid) view of bookings — list only in v1.
- Payments.

## 4. User stories

- As an admin, I log in once and reach a bookings dashboard.
- As an admin, I filter bookings by status and date range, so I find the ones to review.
- As an admin, I open a booking, see all its data (reserver, participants, image rights, DNI, address) and move it to the next valid status, so the client gets notified.
- As an admin, I resend the "requested"/"confirmed" email when a client didn't receive it.
- As an admin, I create/edit/deactivate session types and their groups, so the public site offers the right sessions.
- As an admin, I define weekly opening ranges and block holidays/days off, so availability is correct.
- As an admin, I send myself a template test email to preview client copy.

## 5. Functional requirements

**Shell & auth**

- FR-1: Panel at route `/admin`, gated by a `<RequireAuth>` wrapper (checks `isAuthenticated()`). No valid JWT → redirect to `/admin/login`, a **fresh** email/password page using `login()` from `auth.service`. No admin data without a valid JWT.
- FR-2: Expired/invalid token (any admin call → 401) clears session and redirects to `/admin/login`, preserving no stale data.
- FR-3: Panel has 3 sections reachable from top `Tabs`: **Reserves**, **Sessions**, **Horaris**. Logout action clears session.

**Bookings**

- FR-4: List bookings from `GET /api/admin/bookings`, filterable by `status`, `from`, `to` (date range). **Default view = `status=Requested`** (pending review, the admin's daily job); admin can clear/change status and set a `from`/`to` date range.
- FR-5: Each row shows date/time (studio-local), session type, reserver name, status; expand/detail shows full booking (email, phone, DNI, address, image rights, participants w/ ages, notes, confirmation token, timestamps).
- FR-6: Admin changes status via `PATCH /api/admin/bookings/{id}` with `{ status }`. UI offers **only valid transitions** for the current status (transition table §7); an invalid transition returns 409 → surfaced, list unchanged.
- FR-7: Admin resends email: `POST /api/admin/bookings/{id}/emails/requested` and `.../confirmed`. Result (`delivered:true` / 502) surfaced as a toast.

**Sessions (groups + types)**

- FR-8: List/create/edit/delete session **groups** (`/api/admin/session-groups`). Delete of a group that still has types → 409 → surfaced, no delete.
- FR-9: List/create/edit/delete session **types** (`/api/admin/session-types`): fields `sessionGroupId` (required, from existing groups), `name`, `durationMinutes`, `bufferMinutes`, `isActive`, `availableFrom?`, `availableTo?`. Delete of a type with bookings → 409 → surfaced.
- FR-10: Types are shown grouped by their group; the `isActive` flag is toggleable (drives public visibility).

**Schedule (availability + blocked periods)**

- FR-11: List/create/edit/delete weekly availability ranges (`/api/admin/availability`): `weekday` (Mon–Sun), `startTime`, `endTime` (studio-local wall-clock). Multiple ranges per weekday allowed.
- FR-12: List/create/delete blocked periods (`/api/admin/blocked-periods`): `from`, `to` (whole-day, inclusive), optional `reason`. No edit endpoint → edit = delete + recreate.
- FR-13: ~~Template test email~~ — **not in panel**; `POST /api/admin/emails/test` is Postman-only (dev template preview).

## 6. Non-functional requirements

- NFR-1: Desktop-first (admin works from a computer) but usable on tablet; no 375px requirement like the public page.
- NFR-2: Catalan UI copy, consistent with the rest of the site. Status/enum values shown as Catalan labels (§7), never raw enum.
- NFR-3: **No new dependencies** — antd (Table, Form, Tabs/Menu, DatePicker, TimePicker, Tag, Drawer/Modal) + existing `api.client`/`auth`.
- NFR-4: All calls JWT-authenticated via existing `api.client` (`Authorization` header auto-added). Requires extending `api.client` with `apiPatch`/`apiPut`/`apiDelete` (only GET/POST exist today).
- NFR-5: Times: API returns/accepts UTC instants for bookings and `TimeOnly`/`DateOnly` (studio-local) for availability/blocks; UI formats bookings to studio-local for display. Studio TZ = `Europe/Madrid`.

## 7. Data model

Client types extend `src/services/booking/booking.api.ts` (reuse `SessionType`,
`ImageRightsConsent`). New admin types + a matching `booking.admin.api.ts`:

```
BookingStatus = 'Requested' | 'Confirmed' | 'Paid' | 'Cancelled'   # API serializes enum as string

AdminBooking {                       # = BookingDto
  id, sessionTypeId,
  startAt, endAt,                    # UTC ISO
  status: BookingStatus,
  clientName, clientEmail?, clientPhone, dni, address,
  imageRights: ImageRightsConsent,
  notes?, confirmationToken,
  createdAt, updatedAt,
  participants: { id, name, age? }[]
}

SessionGroup       { id, name }
WeeklyAvailability { id, weekday: 0..6 (DayOfWeek, Sun=0), startTime: 'HH:mm:ss', endTime }
BlockedPeriod      { id, from: 'YYYY-MM-DD', to, reason? }
```

**Status labels (Catalan) + allowed transitions** (from API 001 §7 Q7 — UI must
mirror exactly):

| Enum | Label | Admin can move to |
|------|-------|-------------------|
| `Requested` | SOL·LICITAT | Confirmed, Cancelled |
| `Confirmed` | CONFIRMAT | Paid, Cancelled |
| `Paid` | PAGAT | Cancelled |
| `Cancelled` | CANCEL·LAT | — (terminal) |

Image-rights labels: `GrantAll`→"SI CEDEIXO ELS DRETS", `DenyAll`→"NO CEDEIXO ELS
DRETS", `GrantMineDenyMinors`→"NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS".

## 8. API surface

All under `/api/admin`, JWT. Existing — consumed, not built.

| Method | Path | Body / query | Notes |
|--------|------|--------------|-------|
| GET | `/bookings` | `?status=&from=&to=` | → `AdminBooking[]` |
| PATCH | `/bookings/{id}` | `{ status }` | → `AdminBooking`; 409 invalid transition, 404 |
| POST | `/bookings/{id}/emails/requested` | — | resend; `{delivered}` / 502 |
| POST | `/bookings/{id}/emails/confirmed` | — | resend |
| GET/POST/PUT/DELETE | `/session-groups` `/{id}` | `{ name }` | DELETE 409 if group has types |
| GET/GET{id}/POST/PUT/DELETE | `/session-types` `/{id}` | `{ sessionGroupId, name, durationMinutes, bufferMinutes, isActive, availableFrom?, availableTo? }` | DELETE 409 if type has bookings |
| GET/POST/PUT/DELETE | `/availability` `/{id}` | `{ weekday, startTime, endTime }` | 400 on bad range |
| GET/POST/DELETE | `/blocked-periods` `/{id}` | `{ from, to, reason? }` | no PUT (edit = del+create) |
| POST | `/emails/test` | `{ to, template: 'Requested'\|'Confirmed' }` | preview client copy; `{delivered,provider}` / 502 |

Error mapping: 400 validation, 401 → logout, 404 not found, 409 conflict
(invalid transition / delete-in-use), 502 email not delivered.

## 9. UI / UX

New folder `src/pages/admin/`. Routes `/admin` (panel) + `/admin/login` (login),
both HashRouter (`#/admin`), rendered outside `MainLayout` (own admin chrome,
like `WeddingManagerPage` is standalone). `/admin` wrapped in a new
`<RequireAuth>` guard → `<Navigate to="/admin/login"/>` when unauthenticated.

- **Login page** (`/admin/login`): shared `LoginCard` (extracted from the old `ManagerLoginCard` into top-level `src/common/`, used by both wedding manager and admin) + `login()`; on success → `/admin`. Admin passes no images → neutral background, same glass card.
- **Shell**: antd `Layout` with top `Tabs` — Reserves · Sessions · Horaris — + logout.
- **Reserves**: antd `Table` (filters: `Select` status defaulting to SOL·LICITAT + `RangePicker` for dates); row → `Drawer`/`Modal` detail with full data + a status `Select`/action buttons limited to valid transitions + "Reenviar email" buttons. `Tag` colored per status.
- **Sessions**: groups list (inline add/edit/delete) + types `Table` grouped by group, `Form` in modal for create/edit (group `Select`, number inputs for duration/buffer, `Switch` for active, `DatePicker` for season window), delete with confirm.
- **Horaris**: weekly ranges — flex row of 7 day buttons (badge = range count); click a day to open its edit panel (`TimePicker.RangePicker` add + per-range delete); blocked periods — `Table` + add (`RangePicker` + reason), delete.

States: loading (skeletons/spinners), empty (per section message), error (inline
message + retry), optimistic-off (refetch after each mutation for correctness).

## 10. Edge cases

- 401 mid-session (token expired) → clear session, back to login, in-flight edits dropped with a message.
- Invalid status transition raced (row changed elsewhere) → 409 → toast + refetch list.
- Delete group with types / type with bookings → 409 → explain why, offer to deactivate instead (types).
- `from > to` in filters or availability range end ≤ start → block client-side before call.
- Blocked period overlapping existing bookings → allowed by API (does not delete bookings); note in UI, no client-side block.
- Email resend when email disabled/providers down → 502 → non-alarming toast ("no s'ha pogut enviar").
- DayOfWeek encoding: API `DayOfWeek` is Sun=0..Sat=6 — map carefully to a Mon-first UI display.

## 11. Acceptance criteria

- [ ] `/admin` requires login; bad/expired token → login screen, no data leak.
- [ ] Bookings list loads, filters by status + date range.
- [ ] Booking detail shows every field incl. participants, image rights, token.
- [ ] Status control offers only valid transitions; PATCH updates the row; 409 surfaced.
- [ ] Resend requested/confirmed email works; delivery/failure surfaced.
- [ ] Session groups CRUD; delete-with-types blocked (409) and explained.
- [ ] Session types CRUD incl. group, duration, buffer, active toggle, season window; delete-with-bookings blocked.
- [ ] Weekly availability CRUD (multiple ranges/day); blocked periods create/list/delete.
- [ ] Template test email sends to a given address.
- [ ] `api.client` gains `apiPatch`/`apiPut`/`apiDelete`; all calls carry JWT.

## 12. Open questions

- ✅ OQ-1: One combined spec, build order Reserves → Sessions → Horaris.
- ✅ OQ-2: Top `Tabs`.
- ✅ OQ-3: Default `status=Requested` (pending review); date `from`/`to` range filter available.
- ✅ OQ-4: Fresh admin login page at `/admin/login` (own component; manager card uses wedding code, not JWT).
- ✅ OQ-5: `<RequireAuth>` route wrapper on `/admin` → redirect to `/admin/login`.
- ✅ OQ-6: No availability preview in Horaris — deferred (§13).

## 13. Out of scope / future work

- Calendar/month grid view of bookings.
- Bulk actions (multi-select confirm/cancel).
- Editing booking client data (only status changes in v1; API has no update-fields endpoint).
- Positive availability overrides, partial-day blocks (API 001 §14 futures).
- Audit log / who-changed-what.
