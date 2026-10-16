# Feature: wedding-guest-content

## Objective
Show configurable wedding information to guests after invitation-code validation, and allow couples to customize the rich-HTML prompts for song requests and transport-to-hotel RSVP fields. Implement against mock data until the final API contract is available.

## Problem / why
The guest RSVP experience currently has hard-coded prompts and does not show the wedding introduction, ceremony place, schedule, donations, or contact information. Couples need to configure this copy per wedding without waiting for the final backend contract.

## Decisions
- All content values are rich HTML strings, following the HotelInformation pattern.
- Wedding information is returned with the invitation and shown only after a valid invitation code.
- On the desktop invitation card, render the introduction directly below `Hola, ${invitation.label}!` inside `SurfaceCardHeader`; keep it visible once in the mobile RSVP flow as well.
- Keep wedding-wide content separate from invitation RSVP answers, while following the existing feature model and mock/service flow.
- Use mock fixtures only; the shape is provisional and must not be presented as the final API contract.
- Preserve all existing working-tree changes; do not commit.

## Scope
- Add optional wedding content fields for introduction, ceremony location, schedule, donations, and contact.
- Add optional rich-HTML custom prompts for SongRequests and TransportToHotel.
- Populate MSW mock data and surface content in the shared guest experience only after invitation validation.
- Sanitize rich HTML using the same allow-list approach as HotelInformation.
- Do not change the final backend contract, admin editing UI, existing RSVP semantics, or custom wedding branding beyond shared guest components.

## Constraints
- UI copy and fixtures follow the existing Catalan wedding experience; technical artifacts remain English.
- Do not overwrite the pre-existing edits in `src/mocks/fixtures/wedding.fixtures.ts` (date and Marta & Joan changes).
- No commits; leave changes in the working tree.
- Strict TDD is enabled by the session/project instructions, but the repository has no test runner. On 2026-10-16 the user explicitly approved proceeding with the available checks without test-first coverage for this mock-only task; do not invent a test command.
- Verification available from the existing feature documentation: `npx tsc -b`, `npm run lint`, `npm run build`, `bash tools/check-tokens.sh`, and a manual mock-mode check with `npm run dev:mock`.
- Delivery strategy: `ask-on-risk` (no PR or commit requested in this task).

## Tasks
- [x] T1 Define provisional wedding guest-content types and mock invitation data; preserve unrelated fixture edits. Route: delegated (multiple non-trivial files).
- [x] T2 (reopened: introduction placement) Render sanitized wedding information after valid-code entry and use configurable sanitized SongRequests/TransportToHotel prompts in the shared guest flow; place the desktop introduction beneath the guest name in `SurfaceCardHeader` without duplicating or removing it from mobile. Route: delegated (multiple non-trivial files).
- [x] T3 (reopened: rerun after layout change) Verify the implementation with the user-approved available checks and mock mode; inspect the working tree to confirm no commit and no unrelated changes. Route: delegated verification.
- [x] T4 Apply WeddingGuest-scoped Raleway typography to desktop and mobile RSVP content and italicize the introduction. Route: delegated (multiple non-trivial style/rendering files).
- [x] T5 Merge the guest "Lloc de la celebració" and "Horari" sections into one component and render it first, right after the introduction. One section, both headings, no separator between them. Route: delegated writer (new component + shared body + CSS) + inline mechanical correction (sanitizer extraction).

## Acceptance criteria
- Invalid/no invitation code does not expose the wedding-content HTML.
- A valid mock invitation displays non-empty configured introduction, location, schedule, donations, and contact content.
- On desktop, the introduction appears immediately under the invitation guest name inside `SurfaceCardHeader`; on mobile, it remains visible exactly once.
- Song and transport sections render the configured prompt instead of hard-coded text, with a safe fallback for missing values.
- All rich HTML is sanitized before rendering; unsafe tags, attributes, and URI schemes are removed.
- Missing optional content does not create empty sections or break existing RSVP behavior.
- WeddingGuest RSVP content uses the same body font family as the “Cançons per a la festa” card; the introduction is italicized, without changing global typography.
- Place and schedule render as a single section positioned first after the introduction (one section, both headings, no separator between them), in both the desktop card and the mobile sheet.
- Existing user changes and all implementation changes remain in the working tree; nothing is committed.

## Progress / evidence
- 2026-10-16: User clarified visibility is after valid invitation-code entry and requested the existing custom-wedding feature structure.
- 2026-10-16: Architecture mapped: `WeddingGuestPage` loads invitation by code; shared `GuestFormFields` composes feature sections; `HotelInfoSection` sanitizes HTML with DOMPurify and an explicit allow-list.
- 2026-10-16: User confirmed to proceed without a test runner and asked for mock data so the feature can be checked with mock mode.
- 2026-10-16: Added provisional `guestContent` to valid invitation DTOs and mock handlers; guest content and custom prompts render through a shared DOMPurify-sanitized rich-HTML component.
- 2026-10-16: Mock fixture uses the user's supplied Catalan copy and a clearly fictional bank-account placeholder; all-features invitation code is `SOLER003`.
- 2026-10-16: Verification passed: `npx tsc -b`; `npm run lint` (0 errors, 4 warnings); `npm run build` (with existing large-chunk warning; parent spot-check after final copy update also passed); `bash tools/check-tokens.sh` (82 tokens matched); `npm run dev:mock` started at `http://localhost:5174/` then stopped. No browser interaction was performed.
- 2026-10-16: No commit created. Pre-existing edits in `src/mocks/fixtures/wedding.fixtures.ts` (closing dates and Marta & Joan rename) are preserved. `git diff --check` passed.
- 2026-10-16: RDD is globally on. Native preflight could not advance: it requested the exact `external.select_intended_untracked` capture operation, but that operation is unavailable in this runtime. No review START or approval was created; review remains unmanaged/pending.
- 2026-10-16: User requested a layout refinement: move the introduction into the desktop `SurfaceCardHeader`, directly beneath the guest-name line. T2 and T3 reopened; preserve one introduction display in mobile.
- 2026-10-16: `SurfaceCardHeader` now accepts optional introduction content and renders it after the guest-name line and before its divider. Desktop suppresses the duplicate form-body intro; mobile retains one labeled “Benvinguda” section.
- 2026-10-16: Layout refinement checks passed: `npx tsc -b`, `npm run lint` (0 errors, 4 existing warnings), `npm run build` (large-chunk warning), `bash tools/check-tokens.sh` (82 tokens), plus parent build/diff-check spot check after the final mobile label adjustment. No browser walkthrough.
- 2026-10-16: User clarified typography: use the existing Raleway body family like the “Cançons per a la festa” card, italicize the introduction, and scope the change to WeddingGuest; T4 opened.
- 2026-10-16: T4 done: `GuestRichHtml`/`GuestRichHtmlSection` gained an `italic` prop and now render rich HTML with new `GuestSections.module.css` `.richContent`/`.richContentItalic` (Raleway `--lt-font-body`), shared by desktop and mobile. The introduction is passed `italic` in `GuestConfirmationForm` (desktop header) and `GuestFormFields` (mobile “Benvinguda”). No global typography touched. Checks passed: `npx tsc -b`, `npm run lint` (0 errors, 4 existing warnings), `npm run build` (large-chunk warning), `bash tools/check-tokens.sh` (82 tokens). No commit created.
- 2026-10-16: Follow-up fix (user: “introduction is not italicized”): root cause was that only Raleway normal faces (300–600) were loaded and `base.css` sets `html { font-synthesis: none }`, so `font-style: italic` on Raleway rendered as normal. Added `@import '@fontsource/raleway/400-italic.css';` to `src/styles/base.css`; the build now emits the Raleway 400 italic face (`raleway-latin-400-italic-*.woff2`). Re-ran checks: `npx tsc -b`, `npm run lint` (0 errors, 4 warnings), `npm run build`, `bash tools/check-tokens.sh` (82 tokens). No commit.
- 2026-10-16: T5 opened (user: merge Lloc + Horari into a single component, first after the introduction). Confirmed layout via question: one section, both headings, no separator. Findings: both desktop and mobile already render the shared `GuestFormFields` body, so `weddingPlace`/`schedule` were already the first two body sections — only the merge was needed, no reordering.
- 2026-10-16: T5 done. New page-private `components/PlaceScheduleSection.tsx` renders one `<section>` with both headings and no separator between them; `GuestFormFields.tsx` now renders `<PlaceScheduleSection place={guestContent?.weddingPlace} schedule={guestContent?.schedule} />` in the same position (immediately after the `showIntroduction` line, before `donations`). CSS added `.placeScheduleSection` (`composes: section` + `border-top: none; padding-top: 0`) and `.placeScheduleBlock` in `GuestSections.module.css`. Empty/blank place and schedule render nothing (single sanitizer check), so no orphan heading.
- 2026-10-16: T5 first pass introduced a 5th lint warning (`react-refresh/only-export-components`) by exporting `sanitizeGuestHtml` from `GuestRichHtml.tsx`. Corrected by extracting the shared allow-list, DOMPurify hook and `sanitizeGuestHtml` into a new `components/guestHtml.utils.ts`; `GuestRichHtml.tsx` and `PlaceScheduleSection.tsx` both import from it. Lint back to 0 errors / 4 pre-existing warnings.
- 2026-10-16: T5 checks passed: `npx tsc -b` (exit 0), `npm run lint` (0 errors, 4 warnings — the pre-existing set), `npm run build` (success, only the pre-existing large-chunk warning), `bash tools/check-tokens.sh` (82 tokens). Emitted CSS verified: `._placeScheduleSection_17p4x_185{border-top:none;padding-top:0}` is emitted after `._section_17p4x_2`, so the no-separator override wins. No browser walkthrough. No commit created.

## Next step
Confirm the merged Place + Schedule block visually: run `npm run dev:mock`, open the wedding guest page, and use invitation code `SOLER003`. Open question for the user: if “no separator” was also meant to remove the section’s grouping from the surrounding copy, that is a one-line CSS change. Commit still requires explicit user approval (repo convention). Native RDD review remains pending because this runtime cannot perform its requested intended-untracked selection; do not infer review approval. All work remains uncommitted.

## Relevant files
- `src/model/wedding.types.ts` — wedding/invitation types.
- `src/pages/weddings/WeddingGuest/components/HotelInfoSection.tsx` — existing HTML sanitization/rendering pattern.
- `src/pages/weddings/WeddingGuest/components/GuestFormFields.tsx` — shared guest RSVP feature composition.
- `src/pages/weddings/WeddingGuest/components/guestHtml.utils.ts` — shared DOMPurify allow-list + `sanitizeGuestHtml`.
- `src/pages/weddings/WeddingGuest/components/PlaceScheduleSection.tsx` — merged place + schedule section.
- `src/pages/weddings/WeddingGuest/components/GuestSections.module.css` — shared section/rich-content classes; `.placeScheduleSection`, `.placeScheduleBlock`.
- `src/mocks/fixtures/wedding.fixtures.ts` — mock wedding/invitation data; contains pre-existing user edits.
