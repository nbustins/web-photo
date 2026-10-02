# Feature: wedding-manager-admin-shell

## Objective
Give the per-wedding manager (`/weddings/:slug/manager`) the same visual shell as `/admin`
(olive sidebar, brand block, section PageHeader, mobile drawer + AppBar), so it can grow
beyond RSVP confirmations into several views.

## Problem / why
The manager today is a single page with its own AppBar/Layout chrome and only shows
confirmations. The admin shell (`AdminPanel`, `PageHeader`, `icons`, `adminShell`) is
page-local to `src/pages/admin/`, and pages cannot import each other.

## Scope
- Promote the shell to layer 1 (`src/ui/`), parametrized (brand, nav items, active key,
  select/logout handlers, optional badge, outlet context). No domain knowledge in `ui/`.
- `/admin` consumes the promoted shell with zero visual/behaviour change.
- Manager becomes a layout route with nested sections; first (only) section: Confirmacions.
  Login / loading / not-found screens stay outside the shell.

Out of scope: new manager views; fixing the existing `WeddingsTab` → `pages/weddings`
cross-import (noted as follow-up).

## Constraints
- Styling layering + tokens rules (`.claude/rules/styling.md`); UI copy in Catalan.
- No new dependencies. No commits without asking the user.
- TDD: Strict TDD enabled globally, but this repo has no test runner (CLAUDE.md) →
  checks are `npx tsc -b`, `npm run lint`, `npm run build`, `bash tools/check-tokens.sh`
  and a manual run in `npm run dev:mock`.

## Tasks
- [x] T1 Promote admin shell to `src/ui/` (AdminShell, shell context hook, PageHeader,
      icons/IconButton + their CSS); `/admin` uses it unchanged. Route: delegated (10+ files).
- [x] T2 Manager as shell layout: nested route `/weddings/:slug/manager/confirmacions`
      (index redirect), sidebar with wedding title brand + Confirmacions + Sortir,
      confirmations section = PageHeader + embedded dashboards + overlays. Route: delegated.

## Acceptance criteria
- `/admin` looks and behaves as before (desktop + mobile).
- Manager after login shows sidebar (desktop) / drawer + AppBar (mobile) identical in style
  to admin; Sortir returns to the login screen.
- All checks pass with 0 lint errors.

## Progress / evidence
- T1+T2 implemented by one delegated writer (uncommitted). Shell API: `@ui/AdminShell`
  (brandTitle, brandCaption, items {key,label,icon: IconName,badge?}, activeKey, onSelect,
  onLogout, outletContext), `@ui/PageHeader`, `@ui/icons` (`AdminIcons` renamed `Icons`),
  `useShell<T>()` in `@ui/shellContext`. Manager: `ConfirmacionsSection` + `useManagerShell`.
- `npx tsc -b`: clean (writer + parent re-run). `npm run lint`: 0 errors, 4 pre-existing
  warnings (parent re-run). `npm run build`: OK. `tools/check-tokens.sh`: OK (writer).
- Manual check in `npm run dev:mock`: confirmed by user. Commits: T1 `47530f2`, T2 `d22f087`.
- Follow-ups: dead non-embedded chrome in Manager*Dashboard + CSS; badge aria-label
  "pendents" hardcoded in AdminShell.

## Next step
Feature done; follow-ups above remain optional.
