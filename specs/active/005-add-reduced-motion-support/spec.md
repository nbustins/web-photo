# 005 — Add prefers-reduced-motion support to the Framer Motion components

- **Status:** draft
- **Owner:** Narcís
- **Created:** 2026-08-05
- **Updated:** 2026-08-05

## 1. Context

`prefers-reduced-motion` is an OS accessibility setting (macOS/iOS *Reduce
motion*, Windows *Animation effects*, Android *Remove animations*, GNOME/KDE
*Reduce animation*) that browsers expose as a CSS media query and via
`matchMedia`. Users with vestibular disorders, migraine or photosensitive
epilepsy turn it on because large on-screen movement causes real dizziness and
nausea. It is WCAG 2.1 criterion 2.3.3 (Animation from Interactions, AAA).

Spec 001 (`specs/done/001-refactor-design-system`) added a global CSS guard in
`src/styles/base.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

That block kills every CSS `animation` and `transition` — hovers, the carousel,
`scroll-behavior`. **It does not touch Framer Motion.** Framer animates from
JavaScript, writing inline `transform`/`opacity` frame by frame; those are
neither CSS animations nor transitions, so the `!important` never applies.

Result: 11 of the 12 files that use Framer Motion keep sliding, fading and
spring-animating even when the user has asked the system to stop. Only
`ContractSheet.tsx` honours the setting today, via `useReducedMotion()`.

T4.10 of spec 001 listed this work and it was deliberately deferred: it changes
real behaviour, and it cannot be checked in a normal visual QA pass — with the
OS setting off (the usual case) nothing looks different.

## 2. Goal

With *Reduce motion* enabled in the OS, no page of the site animates position,
scale or opacity on entry; all content is present and readable immediately.

## 3. Non-goals

- Removing the animations for everybody. Default behaviour (setting off) is unchanged.
- Replacing Framer Motion, or reworking any animation's timing/easing.
- Touching the global CSS block in `base.css` — it already does its job for CSS animations.
- An in-app toggle for reduced motion. The OS setting is the single source.
- The carousel's auto-rotation interval (`carrousel.tsx`), which is a CSS transition and is already covered by the global block. See §13.

## 4. User stories

- As a user with a vestibular disorder who has enabled *Reduce motion*, I want the pages to appear without sliding or zooming, so that I can browse without getting dizzy.
- As a developer adding a new animated component, I want a single documented way to honour the setting, so that I do not have to rediscover it.

## 5. Functional requirements

- FR-1: With `prefers-reduced-motion: reduce` active, every `motion.*` element in the codebase renders directly in its final visual state — no entry animation of `opacity`, `x`, `y`, `scale`, `filter`.
- FR-2: With the setting inactive, every animation behaves exactly as today (same variants, durations, easings, stagger and `viewport={{ once: true }}` triggers).
- FR-3: The setting is read reactively: toggling it in the OS while the page is open updates the behaviour without a reload (this is what `useReducedMotion()` provides).
- FR-4: The 11 files listed in §7 honour the setting. `ContractSheet.tsx` already does and is the reference implementation.
- FR-5: `MobileShell`'s panel keeps its `expanded` state change (the panel still grows to `80vh`), but does so without the spring animation.
- FR-6: Hover affordances that convey interactivity (`whileHover={{ scale }}` in `aboutme.tsx`) are suppressed too — they are movement, and the element stays interactive via cursor and focus ring.

## 6. Non-functional requirements

- NFR-1: No new dependency. `useReducedMotion()` ships with `framer-motion`, already installed.
- NFR-2: No visual change whatsoever when the setting is off. This is the acceptance bar, same as spec 001.
- NFR-3: Content must never end up hidden. Suppressing an animation means starting at the *final* state, never leaving `opacity: 0` behind.
- NFR-4: `npm run lint`, `npx tsc -b`, `npm run build` and `tools/check-tokens.sh` stay clean.

## 7. Scope — files to change

| File | `motion.*` | Animation |
|---|---|---|
| `src/ui/SurfaceCard/index.tsx` | 2 | fade + `y: 30` on entry (default props) |
| `src/ui/MobileShell/index.tsx` | 2 | `maxHeight` spring on the bottom sheet |
| `src/components/customTitle.tsx` | 2 | fade-up on scroll, `delay: 0.15` |
| `src/components/photoComponent.tsx` | 2 | fade-up item variant |
| `src/components/threePhotoComponent.tsx` | 2 | stagger container |
| `src/pages/familiar/components/threeFamiliarPhotos.tsx` | 5 | stagger + scale `0.98 → 1` |
| `src/pages/aboutme/aboutme.tsx` | 5 | fade-up, fade-right, `whileHover` scale |
| `src/pages/newborn/newborn.page.tsx` | 4 | fade-up on scroll |
| `src/pages/smashcake/smashcake.page.tsx` | 4 | fade-up on scroll |
| `src/pages/store/store.page.tsx` | 4 | stagger + `filter: blur(6px)` |
| `src/pages/workshop/workshop.page.tsx` | 8 | fade-up on scroll |

`src/ui/StatusCard/index.tsx` passes `initial`/`animate` down to `SurfaceCard`,
so it is covered once `SurfaceCard` is — verify, do not duplicate.

Reference already done: `src/pages/bookingview/ContractSheet.tsx`.

## 8. API surface

None. Client-side only.

## 9. UI / UX

The pattern, as already used in `ContractSheet.tsx:32`:

```tsx
const reduceMotion = useReducedMotion();
<motion.div
  initial={reduceMotion ? false : { opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
>
```

`initial={false}` tells Framer to mount at the animated (final) state and skip
the entry transition.

For variant-driven components (`variants` + `initial="hidden"`), the equivalent
is skipping the `hidden` state: `initial={reduceMotion ? false : "hidden"}`, or
returning zero-duration variants. Pick one approach and apply it consistently —
that decision belongs in this spec before implementation starts (see §12 Q1).

## 10. Edge cases

- `whileInView` + `viewport={{ once: true }}`: with `initial={false}` the element must not stay invisible while off-screen. Verify on a long page (`workshop`, `store`).
- `store.page.tsx` animates `filter: blur(6px)`; text must never render blurred when motion is reduced.
- `MobileShell` animates `maxHeight`, which is layout, not transform. It must still reach the right height, only instantly.
- Framer's `useReducedMotion()` returns `null` on the first server/SSR-less render in some versions — treat any falsy value as "animate", never leave content hidden.
- Some browsers/OSes report `reduce` when the user has a battery saver or "reduce data" mode on. That is acceptable — the page still works, it just does not animate.

## 11. Acceptance criteria

- [ ] With *Reduce motion* enabled, no page shows entry movement: home, about me, the 4 marketing pages, store, workshop, booking flow (4 steps), contract, both logins, wedding guest and manager (desktop + mobile).
- [ ] With *Reduce motion* enabled, no content is missing, invisible or blurred.
- [ ] With *Reduce motion* disabled, a side-by-side comparison against `main` shows identical animation behaviour.
- [ ] Toggling the OS setting with a page open changes behaviour without a reload.
- [ ] `grep -rln "framer-motion" src/` and `grep -rln "useReducedMotion" src/` return the same file list.
- [ ] `npm run lint`, `npx tsc -b`, `npm run build`, `tools/check-tokens.sh` clean.
- [ ] `.claude/skills/design-system.md` §Animation states the rule and shows the pattern.

## 12. Open questions

- Q1: One approach for all components, or two? `initial={false}` is the minimal edit for the direct-props components; the variant-driven ones (`customTitle`, `threePhotoComponent`, `threeFamiliarPhotos`, `store`) may read better with zero-duration variants. Decide before implementing.
- Q2: Is a shared helper worth it (e.g. `useEntryAnimation()` in `@ui/hooks` returning the right `initial`), or is repeating two lines in 11 files simpler? Eleven call sites is the threshold where a helper starts paying off, but it also hides what is going on.
- Q3: Should an ESLint rule forbid `motion.` in a file that does not import `useReducedMotion`? It would stop the regression coming back, in the same spirit as the colour and `matchMedia` rules from spec 001.

## 13. Out of scope / future work

- Auto-playing media: `promoVideoBackground.tsx` plays a looping muted video with `autoPlay`. Under *Reduce motion*, WCAG suggests not auto-playing it. It is a separate decision (the video is the whole hero of the home page) and a separate spec.
- The image carousel's automatic rotation (`carrousel.tsx`): its CSS `transition` is already neutralised by the global block, but the `setInterval` keeps advancing slides, so the images still change — instantly instead of sliding. Whether that counts as "movement" is a product call.
- Auditing hover/focus micro-transitions declared in `.module.css`. They are already covered by the global block; listed only so it is on record that they were considered.
