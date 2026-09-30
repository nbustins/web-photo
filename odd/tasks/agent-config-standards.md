# Feature: agent-config-standards

- **Objective:** Replace the legacy flat `.claude/skills/*.md` files with the current Claude Code layout so gentle-ai + ODD drive the workflow.
- **Problem / why:** Flat `.claude/skills/*.md` files are never loaded (Claude Code only loads `.claude/skills/<name>/SKILL.md`). The repo has no `CLAUDE.md`, so project facts are missing from every session. The backend (`wedding-manager-api`, commit `e4759b0`) already moved to this layout.
- **Scope:** `CLAUDE.md` (new), `.claude/rules/*.md` (new), `.claude/skills/<name>/SKILL.md` (new), delete legacy `.claude/skills/*.md`, refresh `.atl/skill-registry.md`. No source code changes.
- **Out of scope:** user-level gentle-ai agents/skills in `~/.claude/` (gentle-ai managed); `.claude/settings.local.json`.
- **Constraints:** `CLAUDE.md` under 200 lines, always-on facts only; rules use `paths:` frontmatter; skills use `name` + `description` (description says WHEN); English artifacts; keep all knowledge from the legacy files (move, don't lose).
- **Standards sources:** https://code.claude.com/docs/en/memory , https://code.claude.com/docs/en/skills
- **TDD:** strict mode configured globally, but no test runner and this is docs-only → structural readback.
- **Commits:** user rule — ask before any commit.

## Tasks

- [x] T1 — Write `CLAUDE.md`: stack, folder map, aliases, commands, critical alerts, Workflow section (ODD docs at `odd/tasks/<feature>.md`, one work-unit commit per task, Conventional Commits, no project subagents; `specs/` kept as requirement docs; feature names match backend `docs/contracts/<feature>.json`). Route: delegated writer (writer trigger: 2+ non-trivial files).
- [x] T2 — Path-scoped rules: `styling.md` (from design-system + styling-guide), `components.md` (from shared-components), `mocks.md` (wire format / conventions from mock-data). Route: same delegated writer.
- [x] T3 — Skills: `new-session-page`, `add-route`, `new-wedding-page`, `reserva-button`, `add-mock-endpoint`. Route: same delegated writer.
- [x] T4 — Delete legacy flat files + `README.md`, run `gentle-ai skill-registry refresh`, structural readback. Route: same delegated writer; parent spot check.

## Acceptance criteria

- Every legacy file's knowledge lives in exactly one of CLAUDE.md / a rule / a skill.
- `CLAUDE.md` < 200 lines; each rule has valid `paths:` frontmatter; each skill is `<name>/SKILL.md` with `name` + `description`.
- No flat `.md` left directly under `.claude/skills/`.

## Checks

Structural readback (`wc -l`, frontmatter grep, `ls`).

## Progress / evidence

### T1 — CLAUDE.md + specs/README.md

- Created `CLAUDE.md` (99 lines, < 200 target). Verified against code: no
  Supabase anywhere in `src/` (`grep -ril supabase src/` empty) — confirms
  README's claim; aliases cross-checked against `vite.config.ts` and
  `tsconfig.app.json` (match); commands cross-checked against `package.json`
  scripts (no test runner — confirmed).
- Updated `specs/README.md`: added a short note at top pointing to ODD/
  `CLAUDE.md`, kept the rest of the phase-based flow intact as a fallback for
  durable requirement docs.
- Route: direct inline for `specs/README.md` (1 small edit); `CLAUDE.md`
  authored directly by this writer session (already the delegated writer for
  the whole feature).

### T2 — `.claude/rules/*.md`

- Created `.claude/rules/styling.md` (211 lines) merging `design-system.md`
  (short rules) + essentials from `styling-guide.md` (narrative); the long
  narrative/why stays only in `docs/ESTILS.md`, linked rather than copied.
  `paths: src/**/*.{tsx,css}`.
- Created `.claude/rules/components.md` (full API reference from
  `shared-components.md`, translated). `paths: src/pages/**,
  src/components/**, src/ui/**, src/layouts/**`.
- Created `.claude/rules/mocks.md` (wiring, wire-format, seeded-data sections
  from `mock-data.md`; the "Adding an endpoint" procedure moved to T3's
  `add-mock-endpoint` skill instead, since it's a procedure not a
  convention). `paths: src/mocks/**, src/services/**`.
- Catalan prose translated to English; Catalan UI copy strings (e.g. "sessió
  de", "Embaràs", "Quan és el millor moment?") and identifiers (`photoPaths`,
  `sectionRow`, etc.) kept verbatim as instructed.

### T3 — `.claude/skills/<name>/SKILL.md`

- Created 5 skills: `add-route`, `new-session-page`, `new-wedding-page`,
  `reserva-button`, `add-mock-endpoint` (the "Adding an endpoint" procedure
  moved out of `mock-data.md`). All have `name` + `description` ("Use
  when…") frontmatter and reference the T2 rules files instead of
  duplicating them.
- **Stale facts found and corrected against the actual code** (not just
  translated):
  - `getPublicPath()` does not exist anywhere in `src/` — it was renamed to
    `imageUrl(path, width?)` in `src/utils/pathUtils.ts`, which now also
    handles Cloudinary URLs (`f_auto,q_auto` + optional width transform).
    This was stale in `design-system.md`, `shared-components.md`,
    `new-session-page.md`, and `styling-guide.md`/`docs/ESTILS.md`. Fixed in
    `CLAUDE.md`, `.claude/rules/styling.md`, `.claude/rules/components.md`,
    and the new skills. Also dropped the "workshop.page.tsx uses direct
    Cloudinary URLs as an exception" note — `workshop.page.tsx` now calls
    `imageUrl()` too (verified: `grep -n imageUrl src/pages/workshop/
    workshop.page.tsx`).
  - `pageBodyPadding` token/import does not exist (`grep -rn
    pageBodyPadding src/` → no results). Real pages wrap content in
    `<div className={blocks.pageBody}>` from `@components/blocks.module.css`
    (`padding: var(--lt-space-page)`). Fixed in `new-session-page` skill.
  - Session-page pricing is **not** a hardcoded `PRICING` array mapped to
    `PricingCard` — real pages (`pregnant.page.tsx`) use
    `<SessionPricingCards sessionGroupId={N}/>`
    (`src/components/sessionPricingCards.tsx`), which fetches session types
    from the backend catalog via `fetchSessionTypesByGroup` (comment in
    source: "no hardcoded fallback on purpose (007 QC6)"). Fixed in
    `new-session-page` skill; noted that a new session **group** must exist
    in the backend catalog first.
  - Header nav for session pages is data-driven via `SESSIONS` in
    `src/model/sessions.ts` (feeds both the header's "SESSIONS" submenu and
    the homepage strip), not a direct edit to `main.header.tsx`'s items
    array as the legacy `new-session-page.md`/`add-route.md` implied. Fixed
    in `new-session-page` skill; `add-route` skill keeps the direct
    `main.header.tsx` edit since that's correct for non-session top-level
    routes (verified against the real `items` array).
  - `AppRouter.tsx` registers routes via a `privateRoutes: Partial<Record<
    AppRoutes, FC>>` map, not inline `<Route>` JSX as both legacy
    `add-route.md` and `new-session-page.md` showed. Fixed in both new
    skills.
  - `new-wedding-page.md` was the most stale file: it described Supabase
    (`grep -ril supabase src/` confirms zero references — Supabase was fully
    removed), per-wedding route enum entries, a per-wedding
    `new-couple.tsx` thin-wrapper file, and wrong component names
    (`WeddingCard`, `EnterCodeState`, etc.). Actual code: routing is generic
    (`/weddings/:slug`, `/weddings/:slug/manager`, no per-wedding files),
    data comes from `wedding-manager-api` via `src/services/wedding/`, a
    wedding is created through the admin panel (`WeddingsTab` →
    `createAdminWedding`), and images are uploaded via admin (not placed in
    `public/weddings/<slug>/` — verified `fetchPublicWeddingPhotos` /
    `WeddingGuestPage.tsx`'s `photoUrls[0]` fallback). Real component names
    are `GuestLoadingState`, `GuestCodeEntry`, `GuestNotFoundState`,
    `GuestClosedState`, `GuestConfirmationForm`, `GuestSuccessState`,
    `GuestMobileLayout` in `WeddingGuest/components/`. Rewrote the skill
    entirely around the generic/admin-driven flow, with the one existing
    custom-layout exception (`carla-joel`) documented as the exception path.
  - `reserva-button.md` verified accurate against `workshop.page.tsx`'s
    actual "Reserva" button usage — carried over with translation only, no
    factual correction needed.

### T4 — Delete legacy files, registry refresh, readback

- `git rm` staged deletion of all 9 flat files: `.claude/skills/{README,
  add-route,design-system,mock-data,new-session-page,new-wedding-page,
  reserva-button,shared-components,styling-guide}.md`. Not committed (user
  rule: ask before any commit).
- `gentle-ai skill-registry refresh --help` → not a valid subcommand
  (`unknown skill-registry refresh argument "--help"`); ran
  `gentle-ai skill-registry refresh` directly instead, per the task's
  explicit fallback instruction. Output: "Skill registry refreshed
  (12 skills)". `.atl/skill-registry.md` now lists exactly the 5 new
  project skills (`add-mock-endpoint`, `add-route`, `new-session-page`,
  `new-wedding-page`, `reserva-button`) plus the 7 user-level skills; no
  legacy flat-file entries remain. `.atl/` is gitignored, so this file is
  not part of the diff.
- Structural readback (see acceptance criteria — all met):
  - `wc -l`: `CLAUDE.md` 100, `styling.md` 213, `components.md` 224,
    `mocks.md` 78, skills 41–158 lines each. `CLAUDE.md` < 200. ✓
  - `head -6` of every rule confirms `paths:` frontmatter; every skill
    confirms `name:` + `description:`. ✓
  - `ls .claude/skills` → 5 directories, no `.md` file directly under
    `.claude/skills/`. ✓
  - `git status --short` confirms only docs changed (`.claude/`, `CLAUDE.md`,
    `odd/tasks/agent-config-standards.md` created; `specs/README.md`
    modified; 9 legacy files deleted) — no `src/` changes.

## Summary

All 4 tasks complete. Legacy knowledge mapping: `README.md` → `CLAUDE.md`
(tech stack) + `.atl` registry (index); `design-system.md` +
`styling-guide.md` → `.claude/rules/styling.md` (rules) + `docs/ESTILS.md`
(unchanged, linked, holds the narrative); `shared-components.md` →
`.claude/rules/components.md`; `mock-data.md` → `.claude/rules/mocks.md`
(wiring/format/fixtures) + `.claude/skills/add-mock-endpoint/SKILL.md`
(procedure); `add-route.md`, `new-session-page.md`, `new-wedding-page.md`,
`reserva-button.md` → matching `.claude/skills/<name>/SKILL.md`, each
corrected against current code (see T3 evidence above for the specific
stale facts dropped, chiefly: no Supabase, `imageUrl` not `getPublicPath`,
`privateRoutes` map not inline `<Route>`, backend-driven session pricing,
admin-panel-driven wedding creation).

