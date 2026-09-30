---
paths:
  - "src/**/*.{tsx,css}"
---

# Styling conventions

Quick-reference rules for styling and visual consistency. For the full
narrative (why the system is shaped this way, worked examples) read
`docs/ESTILS.md` once; come back here for day-to-day lookups.

**Master rule:** this file holds rules and pointers, never values. Every
value lives in exactly one place — `src/styles/tokens.ts` (authoring) and
`src/styles/tokens.css` (`--lt-*`, consumed by CSS and the antd theme). If
this file and the code ever diverge, the code wins.

## Colors

No literal color (`#hex`, `rgb()`, `rgba()`) outside `tokens.ts`. Always use
the matching semantic token (`var(--lt-color-*)` in CSS, or the same string
in `style` only while a component hasn't been migrated to CSS Modules).
Forced by ESLint (`no-restricted-syntax`, see `eslint.config.js`).

Three levels — never skip one:

```
PRIMITIVE           SEMANTIC                     USE
--lt-olive-500   →  --lt-color-brand         →   color: var(--lt-color-brand)
--lt-grey-500    →  --lt-color-text-secondary →  color: var(--lt-color-text-secondary)
```

Most-used semantic tokens: `--lt-color-brand` / `-brand-strong`,
`--lt-color-surface-page` / `-card` / `-inverse`, `--lt-color-text-primary` /
`-secondary` / `-muted`, `--lt-color-text-brand` (small text ≤13px in brand
color — a darker olive calibrated to pass AA contrast at that size),
`--lt-color-status-success` / `-danger`, `--lt-color-border-subtle`,
`--lt-color-focus-ring`.

Full primitive/semantic tables: `src/styles/tokens.ts`.

**When there's no token:** acceptable for gradients and genuinely single-use
colors that won't repeat. Leave them literal **inside the `.module.css`**
(never the `.tsx`), with a one-line comment saying why. Don't invent a
semantic token for a one-off value.

## Typography

No inline `fontFamily` — ESLint-enforced. Use the 5 family tokens
(`--lt-font-display/body/editorial/handwritten/signature`), each with its
full fallback stack.

No new fluid scale step outside the 7 already defined in `tokens.css`
(`--lt-text-hero` … `--lt-text-caption`). If none of the 7 fits, that's a
design decision, not a missing 8th step — raise it with the stakeholder
before adding one. A one-off literal size inside a `.module.css` is tolerated
for a genuinely unique piece (e.g. `AppBar`'s `26px`); don't tokenize those.

## Spacing, radius, shadow, containers, motion

All come from `tokens.css` (`--lt-space-*`, `--lt-radius-*`, `--lt-shadow-*`,
`--lt-container-*`, `--lt-duration-*`, `--lt-ease-out`). From TypeScript,
import them from `@styles/tokens`.

Spacing aliases (prefer the name over the raw number): `--lt-space-page`
(24px, page body padding), `--lt-space-gutter` (24px, column gaps),
`--lt-space-section` (48px, between sections), `--lt-space-stack` (16px,
between stacked elements).

antd `Row` gutters are passed as numbers (`gutter={[24, 24]}`) — antd doesn't
read CSS variables there. Keep them consistent with the neighboring page.

## Grid & responsive layout

Always use antd `Row` / `Col`. Every layout stacks on mobile (`xs={24}`).
Don't mix CSS floats or absolutely-positioned columns with the antd grid —
pick one.

**Breakpoints:** single source is `useIsMobile()` from `@ui/hooks`, which
reads `breakpoint.md` (768px) from `tokens.ts`. Never `window.matchMedia` or
`window.innerWidth` directly outside that hook — ESLint-enforced.

## Buttons

Configured globally in `src/styles/antd-theme.ts` (`components.Button`).
Don't override these values component by component — a button that needs to
look different is a new design decision, not a local exception.

## Animation

Scroll-triggered animations use Framer Motion with `viewport={{ once: true }}`
and must respect `prefers-reduced-motion` (CSS animations already do,
globally, in `src/styles/base.css`; individual components animating
position/opacity should also check with `useReducedMotion` when the motion is
noticeable).

Standard fade-up (default variant for most elements):

```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};
```

Stagger container (for lists/grids):

```typescript
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
```

Hover scale (interactive cards/photos): `whileHover={{ scale: 1.03 }}`.

## Images

- Always via `imageUrl(path, width?)` from `@utils/pathUtils` — never a raw
  path. It resolves a `public/` path, a Cloudinary URL (applying
  `f_auto,q_auto` and an optional width transform), or any other external
  URL.
- Portrait aspect ratio: `aspect-ratio: 2 / 3`.
- Image radius: a radius token, never a hand value.
- Reserve the box (`height` + `aspect-ratio`) when an image affects layout —
  an image with no known size shifts surrounding content on load.

## Ant Design

- `Row` / `Col` for all grid layout.
- `Typography.Title` / `Typography.Text` sparingly — text is managed via
  `.module.css`, not inline `style`.
- To style a `Typography.Title` from a `.module.css`, put the element in
  front of the class (`h2.title`, `h3.title`): antd sets size with
  `h2.ant-typography` (specificity 0,1,1) and a class alone loses. Not needed
  with `Text`.
- Your own classes beat antd's at equal specificity: antd injects its styles
  at the top of `<head>` (`prepend`), and the app's CSS comes after — so no
  `!important` is ever needed.
- Never import from antd internal paths (`antd/es/**`) — ESLint-enforced.
  Always `import from "antd"`.
- Never mix the antd grid with raw flexbox/CSS grid for the same layout —
  pick one.
- Theme config (`antd-theme.ts`) intentionally only sets `colorPrimary`,
  `colorText`, `fontFamily`, breakpoints, and `Button` overrides — adding
  `colorBgLayout`/`colorBorder`/global `borderRadius` tints dozens of
  components at once; that's a design decision with its own visual review,
  not an implementation detail.

## Where do I write a style? (decision tree)

```
Want to style something
│
├─ Does a shared class already do it?          → use it
│
├─ Is it a static value (color, size, spacing, font)?
│     → <Component>.module.css, with var(--lt-*)
│
├─ Does it depend on a JS variable?
│     ├─ image URL, height from a prop   → inline style={{ }}
│     └─ a computed design value         → style={{ '--x': v }} + CSS var
│
├─ Is it an antd style prop (styles={{ body: … }}, gutter)?
│     → stays in the .tsx
│
└─ Is it animation (initial/animate/variants)?
      → stays in the .tsx
```

The only three legitimate inline `style={{ }}` cases: antd style props, JS-
driven dynamic values/CSS variables, and Framer Motion animation props.
Anything else is debt.

`.module.css` files live next to their `.tsx` and share its name
(`AppBar.tsx` → `AppBar.module.css`). Shared across one module →
`shared.module.css` local to it; shared across modules → promote to
`src/ui/*.module.css`. `composes` never accepts aliases (`@ui`,
`@components`) — always a relative path.

## Layers and module boundaries

```
src/styles/          # single source of values (tokens.ts, tokens.css, antd-theme.ts)
src/ui/               # layer 1 — primitives, ZERO domain knowledge
src/components/        # layer 2 — editorial marketing blocks
src/pages/<module>/components/   # layer 3 — private to one module
```

Dependency rule: layer 3 → layer 2 → layer 1 → tokens. Never the reverse,
never sideways between modules (`pages/booksession` can't import from
`pages/weddings`). If two modules need the same component, promote it to
`src/ui` or `src/components` — don't reimplement or cross-import it. ESLint-
enforced (`no-restricted-imports`).

See `.claude/rules/components.md` for the catalog of components already
available before creating a new one.

## Before committing (if you touched styles)

```bash
npx tsc -b
npm run build
npm run lint            # must be 0 errors
bash tools/check-tokens.sh
```

Compiling doesn't mean it looks right — a misspelled class in a
`.module.css` applies nothing but doesn't error. Open the page if you
touched styles.
