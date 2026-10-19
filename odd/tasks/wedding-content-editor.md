# Feature: wedding-content-editor

## Objective
Add rich-HTML editing for wedding content so the couple/manager can author the
strings rendered by `GuestRichHtmlSection`: a TipTap editor (full StarterKit
toolbar), wired into the admin wedding creation and update surfaces, saving
single-line sanitized HTML in `{ features, content }`. Branch:
`feature/custom-weddings`. Delivery: `ask-on-risk`. Test runner: none (checks:
`npx tsc -b`, `npm run lint`, `npm run build`, `bash tools/check-tokens.sh`,
manual `npm run dev:mock` walkthrough).

## Problem / why
The guest invitation already renders wedding content from `invitation.content`
(rich HTML sanitized by `GuestRichHtmlSection`), but admin creation/update has
no way to author it. We need a reusable rich-text component that produces HTML
the guest renderer accepts, and admin forms that persist it.

## Decisions (user-confirmed 2026-10-19)
- Editing lives in BOTH the existing "Nou casament" drawer and a new per-wedding
  "Configuració" drawer opened from each wedding card (`PUT /api/weddings/{id}/settings`).
- Editor tech: **TipTap** (`@tiptap/react@3.32.0`, `@tiptap/pm@3.32.0`,
  `@tiptap/starter-kit@3.32.0`; StarterKit v3 already includes Link and Underline).
- Toolbar: every StarterKit option that fits invitation copy (H1–H6, paragraph, bold, italic,
  underline, strike, blockquote, bullet/ordered lists, horizontal rule, link, undo/redo, clear).
  **Code and inline code are excluded** (2026-10-19, L3): no toolbar button, disabled in the
  StarterKit schema (`code: false`, `codeBlock: false`), and not in the sanitizer allow-list.
- This task also **widens the guest DOMPurify allow-list** and the rich-content CSS so
  every produced tag renders instead of being stripped.
- Feature toggles (`transportToHotel`, `songRequests`, `allergens`) live in the same view.
- All 8 content fields get an editor with their server max length.
- Wire format: serialize the editor HTML and **strip CR/LF** so each field is one line.
- Client-side guard: **sanitize with the guest allow-list + enforce max length** before send.
- Must be exercisable in `npm run dev:mock` (MSW already accepts `content` in create and
  `PUT settings`, and `GET /api/weddings/{id}` returns `{ features, content }`).

## Specs
- S1 — A reusable `RichHtmlEditor` (antd custom form control: `value`/`onChange`), built on
  TipTap with StarterKit, offering the full toolbar (S-Decisions). It must be usable inside
  `<Form.Item>` in both drawers and render a live preview from the shared sanitizer
  (`sanitizeGuestHtml`) in the admin's own preview box (the guest page itself is the final preview;
  no cross-page import of `GuestRichHtml`).
- S2 — Content fields and labels (Catalan UI copy; identifiers English), with server limits:
  - `introductionText` "Benvinguda" (2000)
  - `weddingPlace` "Lloc de la celebració" (500)
  - `schedule` "Horari" (10000)
  - `hotelInfo` "Allotjament" (10000)
  - `transportToHotelPhrase` "Transport a l'hotel" (1000)
  - `songRequestsPhrase` "Cançons per a la festa" (1000)
  - `donations` "Regals" (2000)
  - `contact` "Contacte" (2000)
- S3 — Feature toggles `transportToHotel`, `songRequests`, `allergens` are edited in the same
  form and saved together with `content`.
- S4 — Save payloads: create uses the existing multipart (`wedding` JSON carries `content`,
  `features` field) — already supported by `createAdminWedding`; update uses
  `PUT /api/weddings/{id}/settings` with `{ features, content }`.
- S5 — Each content value is sanitized with the shared guest allow-list and newline-free before
  it reaches the API; over-limit values block submission with a visible error.
- S6 — The guest sanitizer allow-list and `.richContent` CSS are widened to support every
  StarterKit output tag the editor can produce (`h1`–`h6`, `s`, `blockquote`, `hr`, plus existing
  `p/br/strong/em/u/ul/ol/li/a`), so nothing authored disappears on the guest page. Code and
  inline code are NOT supported (L3): they are disabled in the editor schema and not allow-listed,
  so any legacy `<code>`/`<pre>` renders as its plain text.
- S7 — `npm run dev:mock` can create a wedding and update its content, and the guest page
  (mock invitation `SOLER003`) renders the edited rich HTML.

## Constraints
- Styling layering + tokens (`.claude/rules/styling.md`); no `#hex`/`rgb()` outside tokens.
- UI copy Catalan; code/comments English.
- Sanitizer shared across pages must live in `@utils` (two pages cannot import each other).
- No commits without explicit user approval.
- Strict TDD is on globally but the repo has no test runner → document the exception; verify
  with typecheck/lint/build/tokens + mock-dev walkthrough.
- RDD: `gentle-ai` CLI is not installed in this runtime; no native review machinery available.

## Tasks
- [x] T1 Promote the rich-HTML sanitizer to `src/utils/richHtml.utils.ts`, widen its allow-list,
  and extend `.richContent` CSS for the new tags. Route: inline. Evidence: old
  `guestHtml.utils.ts` deleted, both guest importers updated (`npx tsc -b` clean).
  Reopened and re-closed by L3: `code`/`pre` dropped from the allow-list and CSS.
- [x] T2 Add TipTap deps and build `src/pages/admin/components/RichHtmlEditor.tsx` (toolbar,
  controlled value/onChange, max length, single-line sanitized output helper). Route: inline.
  Evidence: `@tiptap/react|pm|starter-kit@3.32.0`. Reopened and re-closed by L3: inline-code and
  code-block buttons removed and `code`/`codeBlock` disabled in the StarterKit schema.
- [x] T3 Admin data layer: `fetchWeddingSettings(id)` (`GET /api/weddings/{id}`) and reuse
  `updateWeddingSettings`; add content to create options. Route: inline.
- [x] T4 Admin views: per-wedding "Configuració" drawer (toggles + 8 editors, GET → PUT) and
  content/toggles in the "Nou casament" drawer. Route: inline.
- [ ] T5 Checks + independent verification + mock-dev walkthrough. Route: delegated verification.
  Checks done: `npx tsc -b` 0 errors, `npm run lint` 0 errors (4 pre-existing warnings),
  `npm run build` OK, `bash tools/check-tokens.sh` OK, `npm run dev:mock` serves and Vite
  transforms `RichHtmlEditor.tsx` + the TipTap dep chunk (HTTP 200). Independent verifier ran;
  B1 raised and closed in two bounded corrections (see Log). Pending: manual admin walkthrough
  (create/edit + guest render of `SOLER003`) on http://localhost:5173.

## Acceptance criteria
- The editor exposes the full StarterKit toolbar and produces sanitized, single-line HTML.
- Create and update drawers expose all 8 content fields plus the 3 toggles.
- After saving, re-opening the drawer hydrates the editors with the stored HTML.
- The guest page (mock `SOLER003`) renders headings, lists, links, quote/code/hr and inline
  marks authored in the editor; nothing is stripped by the sanitizer.
- Over-limit content blocks save with a clear Catalan error.
- `npx tsc -b`, `npm run lint` (0 errors), `npm run build`, `bash tools/check-tokens.sh` pass.

## Log
- L1 (verbatim, 2026-10-19): "Next Task; The task is to update the wedding creation/update view.
  I want to design a component able to edit with rich html sending the string as one line to the
  server side so can be visualized in GuestRichHtmlSection. So the aim is to create a text editor
  with html functionallity (just the needed to enrich text we will add now the basics in future
  more features if needed) ask me all needed questions to create the ODD task clear."
- L2 (verbatim follow-up, 2026-10-19): "Important that I can run it in mock dev so we can validate tip tap".
- L3 (verbatim, 2026-10-19): "remove code and one line code, this makes no sense for the aim of this
  text editions". Applied: toolbar buttons for inline code and code block removed, StarterKit
  configured with `code: false` / `codeBlock: false`, `code`/`pre` removed from the shared
  allow-list and from the guest/editor CSS. Reopened T1 (allow-list + CSS) and T2 (toolbar) and
  closed them again with this scope.
- 2026-10-19: Scoping answers: create + per-wedding edit drawer; TipTap; all StarterKit toolbar
  options; toggles + content together; all 8 fields; single-line HTML; sanitize + length client-side.
  One follow-up: full toolbar requires widening the guest allow-list (accepted).
- 2026-10-19: Confirmed TipTap 3.32.0 supports React 19 and StarterKit v3 includes Link + Underline,
  so only `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` are added. Verified against the
  installed `@tiptap/starter-kit` types: included extensions are blockquote, bold, bulletList,
  code, codeBlock, document, dropcursor, gapcursor, hardBreak, heading, undoRedo, horizontalRule,
  italic, listItem, listKeymap, link, orderedList, paragraph, strike, text, underline, trailingNode.
- 2026-10-19: Wire format decision — the editor emits the field value already sanitized and
  newline-free (`toWireHtml`), and an empty document (`<p></p>`) is emitted as `''` so the API
  stores it as unset. The editor tracks its last emitted value so the rehydration effect only
  reacts to external changes (async drawer load, reset), never to its own keystrokes.
- 2026-10-19: Length validation is done on the wire value the editor holds (`maxLength` rule in
  `WeddingContentFields`), matching what the API validates, so sanitization expansion
  (`target`/`rel` added to links) cannot push a saved value over the limit.
- 2026-10-19: Independent verification (gentle-ai-verify) found one blocker B1 — the update path
  submitted untouched rehydrated content raw (not sanitized, not newline-free), leaving S5 unmet.
  Correction 1: `toContentFieldValue` (blank → `''`, else `toWireHtml`) shared by the editor and a
  new `toWireContent` used by both submit handlers. Recheck: sanitization defect fixed, but the
  `max` rule still validated the raw form value while the persisted value can be longer
  (sanitizer adds `target`/`rel` to links) → same blocker still open.
  Correction 2: the length rule is now a custom validator over `toContentFieldValue(value)`, and
  the editor counter/preview use that same normalized value, so rule, counter and payload agree.
  Correction 2 was not independently re-verified (verification bound), only re-checked with
  `npx tsc -b` / `npm run lint` / `npm run build` / `tools/check-tokens.sh`, all green.
- 2026-10-19: Checks evidence in mock dev: `npm run dev:mock` boots and
  `GET /src/pages/admin/components/RichHtmlEditor.tsx` + the `@tiptap_react` dep chunk both return
  HTTP 200, i.e. the editor and its dependency graph transform cleanly. Pending: manual walkthrough.
