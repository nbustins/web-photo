# web-photo

Photography portfolio and booking site: public marketing pages, a session-booking
flow (`/book-session`, signed contracts at `/bookings/:token`), an admin panel
(`/admin`), and wedding RSVP pages (`/weddings/:slug`).

## Stack

React 19 + TypeScript + Vite. React Router 7 with `HashRouter` (all links are
`#/path`, no server rewrite config needed). Ant Design 5 for components/grid.
Framer Motion for animation. No Supabase — that was removed; all data comes
from the `wedding-manager-api` backend over REST.

## Folder map (`src/`)

| Path | Contents |
|---|---|
| `pages/` | Route-level pages, one folder per feature (`weddings/`, `admin/`, `booksession/`, …) |
| `components/` | Layer 2 — reusable marketing/editorial blocks (`CustomTitle`, `PricingCard`, `FAQs`, …), barrel at `components/index.ts` |
| `ui/` | Layer 1 — domain-free primitives (`SurfaceCard`, `AppBar`, `useIsMobile`, …) |
| `layouts/` | `MainLayout`, header, footer |
| `router/` | `AppRouter.tsx` — all routes |
| `model/` | `routes.model.ts` (route enum), `wedding.types.ts`, `sessions.ts` |
| `services/` | REST clients per domain (`auth/`, `booking/`, `wedding/`), `api.client.ts`, `error-messages.ts` |
| `styles/` | `tokens.ts` (single source of design values), `tokens.css`, `antd-theme.ts`, `base.css` |
| `mocks/` | MSW handlers/fixtures for `npm run dev:mock` |
| `utils/`, `hooks/` | shared utilities and hooks |

## Path aliases

`@components`, `@pages`, `@layouts`, `@hooks`, `@utils`, `@services`, `@ui`,
`@styles`, `@mocks` → `src/<dir>`. Defined in both `vite.config.ts` and
`tsconfig.app.json` — keep them in sync if you add one.

## Commands

```bash
npm run dev        # against the real API (VITE_API_BASE_URL)
npm run dev:mock   # against MSW mock data, no backend needed
npm run build       # tsc -b && vite build
npm run lint         # eslint . — must be 0 errors before commit
```

There is no test runner configured in this repo.

## Backend relationship

The backend is a separate service, **wedding-manager-api** (ASP.NET Core).
This app talks to it over REST exclusively through `src/services/`; there is
no mock/real switch inside application code — `npm run dev:mock` intercepts
`fetch` at the network layer via MSW instead. See
`.claude/rules/mocks.md` for wiring details and wire-format gotchas.

## Critical alerts

- Router is `HashRouter` — every internal link is `#/path`; use the
  `AppRoutes` enum from `src/model/routes.model.ts`, never a hardcoded string.
- UI copy is Catalan — keep new copy, class names tied to Catalan words, and
  existing identifiers as-is; do not translate UI strings.
- Styling layering is one-way: `src/pages/<mod>/components` → `src/components`
  → `src/ui` → `src/styles` tokens, enforced by ESLint. Full rule in
  `.claude/rules/styling.md`.
- No `#hex` / `rgb()` / inline `fontFamily` outside `tokens.ts` or a
  single-use `.module.css` literal — forced by ESLint.
- Wedding pages are mostly **data-driven**, not per-wedding files: adding a
  new wedding is an admin-panel operation (`WeddingsTab`), not a new page
  component. See `.claude/skills/new-wedding-page/SKILL.md`.

## Global conventions

- Import shared components from the `@components` barrel, never by file path
  (ESLint-enforced).
- Two pages never import from each other; a component used by two modules
  gets promoted to `@components` or `@ui`.
- `imageUrl()` from `@utils/pathUtils` for every image path (local or
  Cloudinary), never a raw string.

## Workflow

This repo runs Organic Driven Development (ODD) via gentle-ai. Read-only
requests (investigate/explain/review) stay read-only; substantial
implementation gets a feature doc at `odd/tasks/<feature-name>.md` before the
first write, and closes with one work-unit commit per task using Conventional
Commits. Always ask the user before running `git commit`.

There are no project-specific subagents in this repo — use the installed
gentle-ai agents (`sdd-*`, review agents, etc.) for delegation.

`specs/` holds feature **requirement documents** (`specs/active/`,
`specs/done/`) that ODD feature docs reference for context; the old
spec-driven-only workflow described in `specs/README.md` is superseded by ODD
for day-to-day work (specs remain useful as durable requirement records).

**Cross-repo:** the frontend consumes `docs/contracts/<feature>.json`
published by the `wedding-manager-api` repo. When a feature spans both repos,
keep the ODD feature name identical in both.

See also: `.claude/rules/` for path-scoped conventions (loaded automatically
when you touch matching files) and `.claude/skills/` for step-by-step
procedures.
