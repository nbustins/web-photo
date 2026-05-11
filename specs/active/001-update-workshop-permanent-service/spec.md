# 001 — Update Workshop to Permanent Service

- **Status:** draft
- **Owner:** narcisbustins
- **Created:** 2026-05-11
- **Updated:** 2026-05-11

## 1. Context

`src/pages/workshop/workshop.page.tsx` renders the "BRODA RECORDS" taller page with hardcoded data positioned as a **one-off event** ("Celebrem el primer any de l'estudi"), with four specific dates and a per-shift `full` flag in the `scheduleItems` const.

The taller is now a **permanent business offering**, not a single edition. Customers can book any time, on demand, for private groups (5–10 people). Specific dates no longer apply — only the generic shift slots (matí / tarda).

The page must reflect this shift in framing. Implementation stays simple: hardcoded copy in the page file, same Cloudinary images, single external Google Form for booking. No service layer, no backend, no model — those are explicitly out of scope for this spec.

## 2. Goal

Update `workshop.page.tsx` so the page presents the workshop as an always-available service: new copy, no dated calendar, new booking form URL, new pricing and inclusions block.

## 3. Non-goals

- Service layer / API / `workshopService` abstraction.
- Backend `Workshop` model or persistence.
- Backoffice / CMS for editing content.
- Replacing the Google Form with an in-app booking flow.
- i18n. Copy stays in Catalan.
- Replacing existing Cloudinary images.
- Per-shift availability (`full` flag) — no real-time capacity.

## 4. User stories

- As a **visitor**, I see the taller as an ongoing offering I can book any time, so I understand it's not a one-off event.
- As a **visitor**, I see what's included and the price before clicking "Reserva", so I can decide before opening the form.
- As a **visitor**, I click "Reserva" and reach the current Google Form, so I can submit my booking request.
- As a **studio owner**, the page no longer shows obsolete dates so I do not have to update them.

## 5. Functional requirements

- **FR-1:** Remove the `scheduleItems` const and the dated schedule grid.
- **FR-2:** Remove subtitle "Celebrem el primer any de l'estudi".
- **FR-3:** Render new intro copy (see §9 Text content).
- **FR-4:** Render "TALLER" block: private groups 5–10 people, two generic shifts:
  - `MATÍ DE 10:30 - 13:00`
  - `TARDA DE 16:30 - 19:00`
- **FR-5:** Render "PREU: 28€ / PERSONA" prominently.
- **FR-6:** Render "INCLOU" bullet list with 5 items (see §9).
- **FR-7:** "Reserva" button links to `https://docs.google.com/forms/d/1d5KnwhBY1n8aI6SL5pv1cbFb9lnZAKyM5nLcCdeEMHU/preview` (target `_blank`, `rel="noopener noreferrer"`).
- **FR-8:** Hero portrait image + 4-photo bottom gallery unchanged (same Cloudinary URLs).
- **FR-9:** Keep framer-motion `fadeUp` entrance animation on title, paragraphs, and gallery (parity with sibling pages).

## 6. Non-functional requirements

- **NFR-1:** Visual language consistent with rest of app — `CustomTitle`, antd `Row`/`Col`, Italiana + Raleway fonts, `rgb(246,244,240)` background, `0.3rem` border radius — same tokens currently used.
- **NFR-2:** Responsive: same `xs`/`md` breakpoints as current page (`md={10}` hero + `md={14}` content; gallery `xs={12} md={6}`).
- **NFR-3:** No new dependencies.
- **NFR-4:** No `any`. `bun run build` passes, eslint clean.
- **NFR-5:** No console errors in browser.

## 7. Data model

N/A. Page-level hardcoded constants only. No persistence, no types beyond local interfaces if needed for the INCLOU list.

## 8. API surface

N/A. Booking is an external `href` to Google Forms — no fetch, no client wrapper.

## 9. UI / UX

### Text content (Catalan, hardcoded verbatim)

Intro paragraphs:

> Vols celebrar un aniversari? Passar una bona estona amb amics/amigues o familiars? Una despedida?
> Veniu al taller a brodar la vostra pròpia foto!
> A l'estudi us ho preparo tot, l'únic que heu de fer és reservar un matí o una tarda contestant el formulari!

TALLER block:

> El taller es fa per grups privats d'entre 5 i 10 persones i per torns.
> Els torns són els següents:
> MATÍ DE 10:30 - 13:00
> TARDA DE 16:30 - 19:00

PREU block:

> PREU: 28€ / PERSONA

INCLOU bullets:

- una foto impresa per persona
- un marc de fotos per persona
- tot el material per brodar (fils, agulles, tisores, punxó, etc.)
- Berenar o Esmorzar
- Estudi ambientat en la temàtica (en cas d'aniversari o despedida)

### Layout

Reference: `specs/active/001-update-workshop-permanent-service/layout.png`. Treat as **directional sketch, not pixel-perfect spec**. Final layout must be refined to match the app's general look (typography scale, spacing, antd Row/Col rhythm) — do not copy the sketch's exact proportions.

Structure (top to bottom):

1. `CustomTitle` `label="TALLER"` `title="BRODA RECORDS"` — centered. **No subtitle.**
2. Two-column row (antd `Row` `gutter={[40, 32]}`, `align="stretch"`):
   - **Left** (`md={10}`): hero portrait — current Cloudinary URL `…/TALLER-22_rbyaxb.jpg`.
   - **Right** (`md={14}`): intro paragraphs → TALLER block (with shifts) → PREU → INCLOU list → Reserva button.
3. Bottom row: 4 gallery photos (`xs={12} md={6}`) — current Cloudinary URLs unchanged.

### States

Single static state. No loading / empty / error states needed (no fetching).

### Effects

framer-motion `fadeUp` variant on:

- Title block.
- Right-column content wrapper (delay ~0.15s as today).
- Bottom gallery row.

Each paragraph and gallery image animates in via the parent's `whileInView` trigger (no per-item stagger required beyond what currently exists).

### Booking redirect

`Reserva` button — `Button type="primary" size="large"` — `href="https://docs.google.com/forms/d/1d5KnwhBY1n8aI6SL5pv1cbFb9lnZAKyM5nLcCdeEMHU/preview"` `target="_blank"` `rel="noopener noreferrer"`. Full-width inside its column, same height/font-size as today.

## 10. Edge cases

- **Form URL down / 404:** out of scope; browser shows Google's error. No client handling.
- **Very narrow viewport (`xs`):** columns stack — intro/copy/INCLOU vertical, gallery 2 per row. Existing antd breakpoints handle it.
- **Long INCLOU bullets wrapping:** allow natural wrap, no truncation.
- **User clicks Reserva while offline:** browser handles, nothing to do.

## 11. Acceptance criteria

- [ ] `scheduleItems` const and dated schedule grid removed from `workshop.page.tsx`.
- [ ] Subtitle "Celebrem el primer any de l'estudi" removed.
- [ ] New intro copy renders verbatim as in §9.
- [ ] TALLER block lists the two generic shifts with the exact times.
- [ ] PREU `28€ / PERSONA` visible and visually emphasized.
- [ ] INCLOU bullet list renders all 5 items.
- [ ] Reserva button `href` points to the new Google Form URL.
- [ ] Hero image + 4 gallery images render with same Cloudinary URLs.
- [ ] `fadeUp` motion animations preserved on title, copy block, gallery.
- [ ] Responsive: page looks correct on mobile (`xs`) and desktop (`md`+).
- [ ] `bun run build` succeeds, eslint clean, no console errors.

## 12. Open questions

- Visual treatment for "PREU: 28€ / PERSONA" — inline heading, badge, large pull-quote? Defer to implementation pass; pick whatever matches app rhythm.
- INCLOU bullets — antd `List` vs. plain `<ul>` styled with Raleway? Defer to implementation; match other pages' list styling.

## 13. Out of scope / future work

- Workshop service layer + `Workshop` typed model (potential `002-workshop-service-layer` spec).
- Admin UI to edit copy / pricing / images without a deploy.
- Multi-workshop listing if studio adds new taller variants.
- In-app booking replacing Google Form.
- i18n (ca / es / en).
- Live availability per shift.
