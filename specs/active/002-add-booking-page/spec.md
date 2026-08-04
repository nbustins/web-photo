# 002 — Add public booking page

- **Status:** in-progress
- **Owner:** Narcís
- **Created:** 2026-07-02
- **Updated:** 2026-07-02

## 1. Context

`/booksession` today embeds a Google Form (iframe). The API now has a Booking
module with public endpoints (`SessionGroupsController`, `BookingsController`).
Replace the iframe with a native page that ends in `POST /api/bookings`.

## 2. Goal

A client can pick a session type, see real availability, fill their data and
create a booking — no Google Forms.

## 3. Non-goals

- Admin management UI (session types, blocked periods) — separate spec.
- Booking confirmation/cancel page via token (`GET/DELETE /api/bookings/{token}`) — separate spec (see §13).
- Payments.

## 4. User stories

- As a client, I arrive from a service page (newborn, embaràs…) with the session type already chosen, so I go straight to picking a date.
- As a client, I want to see free slots for my session type, so I pick a date/time that works.
- As a client, I want to submit my details and get confirmation, so my session is booked.

## 5. Functional requirements

- FR-1: Page receives the session type id as a route parameter; resolves its name/group via `GET /api/session-groups` (unknown or inactive id → error state, no flow).
- FR-2: Page loads slots from `GET /api/bookings/availability?sessionTypeId=&from=&to=`.
- FR-3: Client picks day, then slot (start time) from the availability response.
- FR-4: Form collects reserver (name, email, phone, DNI/NIE, address — all required), participants (name, age only for minors 0–17, min 1), image-rights consent (3 options), optional notes.
- FR-5: Submit calls `POST /api/bookings`; on 201 show confirmation with the returned data.
- FR-6: Client-side validation mirrors API rules (DNI/NIE regex `^(\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z])$`, email format, required fields) before submit.
- FR-7: API errors surface in-page: 404 (type gone), 422 (slot taken → refresh slots), 409 (conflict), 429 (rate-limited → "try later").

## 6. Non-functional requirements

- NFR-1: Mobile-first — most clients book from phone.
- NFR-2: Catalan copy, same as rest of site.
- NFR-3: No new dependencies — antd (Form, DatePicker/Calendar, Steps…) + existing `api.client.ts`.
- NFR-4: No auth — public endpoints, anonymous.

## 7. Data model

Client-side types mirror API DTOs:

- `SessionGroupWithTypes { id, name, sessionTypes: SessionType[] }`
- `SessionType { id, sessionGroupId, name, durationMinutes, bufferMinutes, isActive, availableFrom?, availableTo? }`
- `AvailabilityResponse { sessionTypeId, durationMinutes, timezone, days: [{ date, slots: [{ startAt, endAt }] }] }`
- `CreateBookingRequest { sessionTypeId, startAt, reserver { name, email, phone, dni, address }, participants [{ name, age? }], imageRights, notes? }`
- `ImageRightsConsent`: `GrantAll` | `DenyAll` | `GrantMineDenyMinors`
- `CreateBookingResult { id, confirmationToken }`

## 8. API surface

| Call | When |
|------|------|
| `GET /api/session-groups` | page load (resolve type name from route param) |
| `GET /api/bookings/availability?sessionTypeId&from&to` | page load / visible month changes |
| `POST /api/bookings` | submit (rate-limited server-side) |

## 9. UI / UX

Replaces content of `src/pages/booksession/booksession.tsx`. Route takes the
session type id as parameter (e.g. `/booksession/:sessionTypeId`); entry links
come from the existing service pages (pricing cards). Generic page, one flow
for all types.

Layout: **steps wizard** (antd `Steps`), one step visible at a time, per-step
validation, mobile-first.

Flow: **1. Date & slot → 2. Your details → 3. Confirmation**

States:
- Loading: skeletons while fetching groups/slots.
- Empty: type with no free slots in range → message + suggest another range.
- Error: fetch fail → retry message; submit fail → per-FR-7 handling, form data preserved.
- Success: confirmation screen — booking summary (session, date/time, reserver
  name) + `confirmationToken` visible and copyable, with note to keep it to
  manage the booking (the token is the recovery path if the email is lost).

Email field: **required** (API booking spec QA9) — plain "Email" label, no nudge
text; the confirmation and the contract are sent there.

Image-rights consent: radio group with 3 options, labels fixed (map 1:1 to
`ImageRightsConsent` enum):

| Label | Enum value |
|-------|-----------|
| SI CEDEIXO ELS DRETS | `GrantAll` |
| NO CEDEIXO ELS DRETS | `DenyAll` |
| NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS | `GrantMineDenyMinors` |

## 10. Edge cases

- Slot taken between selection and submit → 422 → refetch slots, keep form data, ask to re-pick slot.
- Route param unknown/inactive → error state with link back to services.
- Type deactivated mid-flow → 404 → error state, same handling.
- Rate limit 429 → non-destructive message, retry allowed.
- Participant that is adult → no age field sent (age only 0–17).
- `availableFrom`/`availableTo` on type bounds the selectable date range.

## 11. Acceptance criteria

- [ ] Google Forms iframe gone; native page live, session type taken from route param.
- [ ] Unknown/inactive type id → error state, no booking flow.
- [ ] Real slots shown per selected type and date range.
- [ ] Valid submit → 201 → confirmation screen.
- [ ] Invalid DNI/NIE, missing phone/name/address, 0 participants → blocked client-side.
- [ ] 422 slot-taken path works (slots refresh, data kept).
- [ ] Usable on mobile viewport (375px).

## 12. Open questions

- ~~OQ-1: resolved → steps wizard (antd Steps), see §9.~~
- ~~OQ-2: resolved → month calendar (antd Calendar), fetch per visible month, days with slots marked, click day → slot list, month nav refetches.~~
- ~~OQ-3: resolved → summary + copyable token, see §9.~~
- ~~OQ-4: resolved → optional with nudge, see §9.~~
- ~~OQ-5: resolved → radio labels are the enum texts verbatim (SI CEDEIXO ELS DRETS / NO CEDEIXO ELS DRETS / NO CEDEIXO ELS DRETS DELS MENORS PERO SI ELS MEUS), see §9.~~
- ~~OQ-6: resolved → generic page, session type id via route param, no picker step; single flow for all types.~~

None open — ready for approval.

## 13. Out of scope / future work

- `003` candidate: manage-booking page (view + cancel via `confirmationToken`).
- Session-type picker step (landing without route param) — for now entry is always from a service page.
- Admin UI for session types / blocked periods / bookings list.
