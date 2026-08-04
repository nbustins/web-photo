# 004 — Add session-type picker to the booking page

- **Status:** in-progress
- **Owner:** Narcís
- **Created:** 2026-08-04
- **Updated:** 2026-08-04

## 1. Context

The header menu item "Reservar Sessió" (`main.header.tsx:62`) points at
`AppRoutes.bookSession` = `/book-session`, with no session type id. That route
exists (`AppRouter.tsx:47-53`, generic map over `privateRoutes`) and renders
`<BookSession />`, but the page reads the type from the route param
(`booksession.tsx:22`) and `useSessionType(undefined)` short-circuits to
`error = true` (`hooks.ts:20-24`). Result: the tab always shows the dead-end
card "Sessió no disponible". Same dead end from `pricingCardComponent.tsx:87`
when a card has no `sessionTypeId`.

Spec 002 §13 already parked this: *"Session-type picker step (landing without
route param) — for now entry is always from a service page."* The entry is no
longer always from a service page — the menu is a first-class entry point, and
the old Google Form let the client choose the session type in the form itself.

## 2. Goal

Opening `/book-session` with no id shows a session-type selector at the top of
the existing booking flow, so the client picks the session and continues in the
same page — no dead end, no second page.

## 3. Non-goals

- Redesigning the booking wizard (steps, calendar, form, confirmation stay as-is).
- New API endpoints — `GET /api/booking/session-groups` already returns what the picker needs.
- Changing entry from service pages (`bookSessionPath(id)` keeps working unchanged).
- Showing prices/features in the picker (that is the pricing cards' job; the bookable catalog does not carry them, see §7).

## 4. User stories

- As a client arriving from the menu, I want to choose the session type on the booking page, so that I can book without hunting for the right service page.
- As a client arriving from a pricing card, I want to go straight to the calendar with no selector in the way, so that the choice I already made is not asked again.

## 5. Functional requirements

- FR-1: `/book-session` (no route param) renders the booking flow with no session type selected and no error state.
- FR-2: A selector at the top of step 0 lists every **bookable** session type from `GET /api/booking/session-groups`, grouped by session group, labelled `sessionDisplayName(group, type)`.
- FR-3: `/book-session/:sessionTypeId` hides the selector entirely and behaves exactly as today — the type came with the link, it is not asked again. Presence of the route param is the switch; no prop, no route config.
- FR-4: With no type selected, step 0 shows an informative empty state ("Selecciona una sessió") instead of the calendar; steps 1–3 are unreachable.
- FR-5: Choosing a type loads its availability for the visible month and clears any previously selected date and slot.
- FR-6: The selector is visible only on step 0 of the param-less route. From step 1 on it is hidden, so the type cannot change under a half-filled form.
- FR-7: A route param that is not a bookable type keeps today's error card ("Sessió no disponible"). Absent param ≠ invalid param.
- FR-8: If the bookable catalog is empty or fails to load, step 0 shows the existing error card, not an empty selector.

## 6. Non-functional requirements

- NFR-1: No new dependency. antd `Select`, already used for the same purpose in `ScheduleTab.tsx:130-138` and `SessionsTab.tsx:267`.
- NFR-2: No new route, no new API call — the groups are already fetched by `useSessionType` on every page load.
- NFR-3: Catalan copy, `styles.ts` tokens (`labelStyle`, `inputStyle`, `bodyTextStyle`), same look as the rest of the flow.
- NFR-4: Mobile-first — selector full width, `maxWidth` matched to the `Steps` block (600) so it lines up on desktop.
- NFR-5: The picker does not change the URL — local state only, the selection just switches the view. `bookSessionPath(id)` links stay the shareable form.
- NFR-6: The picker's card is not `WeddingCard`. Same visual style, no dependency from the booking flow on the weddings folder for this new surface.

## 7. Data model

No new types. Already in `booking.api.ts`:

- `BookableSessionGroup { id, name, sessionTypes: BookableSessionType[] }`
- `BookableSessionType { id, sessionGroupId, name, durationMinutes }` — no price, no features.
- `sessionDisplayName(groupName, typeName)` (`booking.api.ts:173`) is the label everywhere outside the catalog cards.

antd `Select` option shape, built from the groups:

```ts
[{ label: group.name, options: [{ value: type.id, label: sessionDisplayName(group.name, type.name) }] }]
```

## 8. API surface

Unchanged. `GET /api/booking/session-groups` is already called once per page
load by `useSessionType` (`hooks.ts:25`); the picker consumes that same
response instead of adding a call.

## 9. UI / UX

### Options considered

| # | Option | Verdict |
|---|--------|---------|
| A | **Selector at the top of step 0, same page, local state** | **Chosen.** Smallest change, one flow, works for both entries (menu and pricing card), matches "com era a Google Forms" — the type is a field of the form. |
| B | Separate landing page/route with a picker that navigates to `/book-session/:id` | Rejected: a second page + route for one `<Select>`, an extra click, and the type is then unchangeable without going back. |
| C | Extra wizard step "Tria la sessió" before "Data i hora" | Rejected: 5 steps for a one-field choice, and step 0 becomes a no-op for everyone arriving from a pricing card (the majority today). |
| D | Redirect `/book-session` → services/pricing pages | Rejected: fixes the crash but drops the menu entry as a real booking entry point; the client still has to find the right service page. |
| E | Keep the picker visible on every step | Rejected: changing the type mid-form invalidates the chosen slot; FR-6 hides it after step 0 instead. |

### Chosen layout

```
┌ GlassCard ───────────────────────────────────┐
│ Selecciona una sessió                        │   ← new card, step 0 only
│ ( Nadó · Bàsica editada                 ▾ )  │
└──────────────────────────────────────────────┘
[ Data i hora — Les teves dades — Resum — Confirmació ]   ← existing Steps
[ card: calendar + slots ]                               ← existing DateTimeStep
```

With nothing selected, the picker card is the only thing on step 0 and carries
the empty-state line under the select ("Selecciona una sessió per veure les
hores lliures", `bodyTextStyle`) — no separate `Alert`, no empty calendar card.

### Components

- **New:** `src/components/glassCard.tsx` — `GlassCard` + `GlassCardHeader`, the exact style block currently in `pages/weddings/common/components/WeddingCard.tsx` (translucent white, `radii.lg`, blur, soft shadow, framer-motion fade-up), moved verbatim, weddings-neutral name and location.
- **Shim:** `pages/weddings/common/components/WeddingCard.tsx` becomes `export { GlassCard as WeddingCard, GlassCardHeader as WeddingCardHeader } from '../../../../components/glassCard';` — the 10 existing call sites (`DateTimeStep`, `DetailsFormStep`, `SummaryStep`, `StatusCard`, `LoginCard`, the 5 Guest* states) keep their imports, zero churn, one source of truth for the style. New code imports `GlassCard` directly.
- **New:** `src/pages/booksession/components/SessionTypePicker.tsx` — `GlassCard` + `GlassCardHeader title="Selecciona una sessió"` + antd `Select`: props `{ groups, value, onChange }`, grouped options built with `sessionDisplayName`, `showSearch` + `optionFilterProp="label"`, placeholder "Tria un tipus de sessió", `inputStyle`, full width capped at 420.
- **Reused as-is:** `DateTimeStep`, `DetailsFormStep`, `SummaryStep`, `ConfirmationStep`, `StatusCard`, `styles.ts` tokens, `radii`, `sessionDisplayName`, `useMonthAvailability`.

### Specific changes

**`src/pages/booksession/hooks.ts` — `useSessionType`**

1. Drop the early `setError(true)` when `sessionTypeId` is undefined (`hooks.ts:20-24`); the effect always fetches the bookable groups.
2. Keep the fetched groups in state and return them (`groups`) for the picker.
3. Derive `sessionType` / `groupName` from `groups` + the requested id with `useMemo` instead of setting them inside the fetch, so the same hook serves both the route param and the picker's value.
4. `error` is now true only for: fetch failure, empty catalog (FR-8), or an id that is not in the catalog. Undefined id → `sessionType = null`, `error = false`.
5. Signature becomes `useSessionType(sessionTypeId: string | number | undefined)`.

**`src/pages/booksession/booksession.tsx`**

6. `const [typeId, setTypeId] = useState<number | undefined>(sessionTypeId ? Number(sessionTypeId) : undefined)` — route param seeds the state (FR-3), the picker owns it afterwards.
7. `useSessionType(typeId)`; `groups` comes back from the hook.
8. Render `<SessionTypePicker />` above `<Steps>` when `!sessionTypeId && step === 0` — the route param, not a prop, decides whether the picker exists (FR-3, FR-6), `onChange` → `setTypeId(id)` + `setSelectedDate(null)` + `setSelectedSlot(null)` (FR-5). No `navigate`, the URL never changes.
9. Step 0 body: `sessionType && <DateTimeStep …/>` — nothing selected means only the picker card is on screen (FR-4).
10. The loading spinner and the error card (`booksession.tsx:80-103`) stay, now gated on the FR-7/FR-8 conditions only.

**Card move (NFR-6):** `WeddingCard.tsx` body moves to `src/components/glassCard.tsx`
and the old file re-exports it under the old names. No other file changes.

**Not touched:** `AppRouter.tsx`, `routes.model.ts`, `main.header.tsx`,
`pricingCardComponent.tsx`, `booking.api.ts`, all step components, all wedding pages.

## 10. Edge cases

- Bookable catalog empty (nothing on the agenda) → error card, no empty selector (FR-8).
- `GET /api/booking/session-groups` fails → error card, as today.
- Route id valid in the catalog but the type is later removed → unchanged: the 404 path on submit (`booksession.tsx:68-69`) still sets the error state.
- Client picks a type with no free slots this month → existing "Cap hora lliure aquest mes" message (`DateTimeStep.tsx:57-61`).
- Client picks a type, then reselects the same one → no reload needed; date/slot reset is harmless.
- Only one bookable type exists → selector still shown, not auto-selected (keeps the choice explicit and the code branchless).
- Browser back from step 1 → step state is local, unaffected by the picker.

## 11. Acceptance criteria

- [ ] Menu "Reservar Sessió" opens a usable booking page (no "Sessió no disponible").
- [ ] Selector lists every bookable type, grouped by session group, with the group in the label.
- [ ] Picking a type loads that type's availability; a previously picked date/slot is cleared.
- [ ] `/book-session/:id` from a pricing card lands straight on the calendar, with no selector on screen.
- [ ] Selector hidden on steps 1, 2 and 3.
- [ ] URL stays `/book-session` while picking; browser back leaves the page, it does not step through selections.
- [ ] `/book-session/999999` (unknown id) still shows the error card.
- [ ] No type selected → picker card only, no calendar, cannot advance.
- [ ] Wedding pages, login card and the other booking steps render unchanged after the card move.
- [ ] Usable at 375px width.
- [ ] No new dependency, no new route, no extra network call vs today.

## 12. Open questions

- ~~OQ-1: resolved → local state, no URL change; the selector switches the view in place (see NFR-5, §9 change 8).~~
- ~~OQ-2: resolved → "Selecciona una sessió" as the picker card title, see §9.~~
- ~~OQ-3: resolved → own card, but not `WeddingCard`: new weddings-neutral `GlassCard` holding the same style, old name kept as a re-export (NFR-6, §9 Components).~~

None open — ready for approval.

## 13. Out of scope / future work

- Showing price/duration/features in the picker options (needs the catalog endpoint, not the bookable one).
- Deep-link to a preselected date/slot.
- Remembering the last picked type across visits.
