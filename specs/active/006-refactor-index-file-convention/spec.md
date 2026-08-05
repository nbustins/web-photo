# 006 — Refactor the `index` file convention

- **Status:** draft
- **Owner:** Narcís
- **Created:** 2026-08-05
- **Updated:** 2026-08-05

## 1. Context

`src/` has 13 files named `index.*`. They do three different jobs under one
name, and only one of the three is what `index` is for.

```
A. Barrel — only re-exports                              3 files
   src/components/index.ts
   src/pages/weddings/WeddingGuest/components/index.ts
   src/pages/weddings/WeddingManager/components/index.ts

B. Barrel of a single item                               1 file
   src/ui/hooks/index.ts                    (1 line, re-exports useIsMobile)

C. Module with logic, not a barrel                       1 file
   src/services/wedding/index.ts            (picks Mock vs Api from an env var)

D. A component wearing index as a costume                8 files
   src/ui/AppBar/index.tsx                  (21 lines)
   src/ui/DesktopSplitBackground/index.tsx  (32)
   src/ui/LoginCard/index.tsx               (92)
   src/ui/MobileShell/index.tsx             (38)
   src/ui/MobileSwiper/index.tsx            (58)
   src/ui/StatusCard/index.tsx              (38)
   src/ui/SurfaceCard/index.tsx             (49)
   src/pages/weddings/WeddingGuest/custom/carla-joel/index.tsx (10)
```

Category D is the real problem: eight editor tabs all reading `index.tsx`, and
fuzzy file search useless for the primitives that get opened most. It was never
a decision — spec 001 inherited the layout when it moved `LoginCard`,
`MobileShell`, `MobileSwiper` and `DesktopSplitBackground` into `src/ui/`, and
then `AppBar` and `StatusCard` were added the same way for consistency.

`src/ui/` is also internally inconsistent: `formStyles.module.css`,
`pageContainer.module.css` and `text.module.css` sit flat at the root, while
every component gets a folder.

### On the folder question

Both layouts are industry-standard; the discriminator is **how many files a
component has**. Mantine and MUI use a folder per component because each one
carries a tsx, a stylesheet, a context, tests and stories — five or more files.
shadcn/ui is flat because each component is a single file. The rule that falls
out: **a folder starts paying off at three files.**

Every `@ui` component here has exactly two — the `.tsx` and its `.module.css`.
The shared name prefix already groups them, and the editor already sorts them
adjacent. The folder adds a level that separates nothing.

Decisive fact: **the import path is identical either way.** `@ui/AppBar`
resolves to `src/ui/AppBar.tsx` exactly as it resolved to
`src/ui/AppBar/index.tsx`.

## 2. Goal

Every file in `src/` is named after what it contains; `index` survives only
where it is a genuine barrel.

## 3. Non-goals

- Changing any component's behaviour, props, markup or styling. Zero runtime diff.
- Removing the three real barrels (category A). Re-exporting a folder's public surface is exactly what `index` is for, and `@components` reads better than eleven file paths.
- Reorganising `src/pages/` or `src/components/` internals.
- Adding tests, stories or a component-library structure.

## 4. User stories

- As a developer, I want the editor tab to say `SurfaceCard.tsx`, so that I can tell my eight open primitives apart.
- As a developer, I want the filename to tell me what is inside, so that fuzzy file search finds it.
- As a developer reading `src/ui/`, I want one consistent layout, not two.

## 5. Functional requirements

- FR-1: The eight category-D files are renamed to the component they export, and their folder is removed (flat layout, decided in §12 Q1).
- FR-2: Every `@ui/*` import stays character-for-character identical. If any import string changes, the layout choice was applied wrong.
- FR-3: `src/services/wedding/index.ts` is renamed to a name describing what it does. It is not a barrel: it reads `VITE_USE_MOCK_DATA` and picks `MockGuestService` or `ApiGuestService`. Its two consumers update their import.
- FR-4: `src/ui/hooks/index.ts` (one line, one re-export) is removed; the seven `@ui/hooks` consumers import the hook directly.
- FR-5: The three category-A barrels stay untouched.
- FR-6: `src/pages/weddings/WeddingGuest/custom/carla-joel/index.tsx` is renamed after the component it exports (`CarlaJoelCustomWedding`).
- FR-7: The convention is written down so the next component does not reintroduce the problem.

## 6. Non-functional requirements

- NFR-1: `npx tsc -b`, `npm run build`, `npm run lint` and `tools/check-tokens.sh` clean.
- NFR-2: Pure rename. `git diff --stat` should show renames and import-line changes, nothing else.
- NFR-3: Use `git mv` so history follows the file.
- NFR-4: No new dependency, no new tooling.

## 7. Scope — the moves

### `src/ui/` → flat

| From | To |
|---|---|
| `AppBar/index.tsx` | `AppBar.tsx` |
| `AppBar/AppBar.module.css` | `AppBar.module.css` |
| `DesktopSplitBackground/index.tsx` | `DesktopSplitBackground.tsx` |
| `DesktopSplitBackground/DesktopSplitBackground.module.css` | `DesktopSplitBackground.module.css` |
| `LoginCard/index.tsx` | `LoginCard.tsx` |
| `LoginCard/LoginCard.module.css` | `LoginCard.module.css` |
| `MobileShell/index.tsx` | `MobileShell.tsx` |
| `MobileShell/MobileShell.module.css` | `MobileShell.module.css` |
| `MobileSwiper/index.tsx` | `MobileSwiper.tsx` |
| `MobileSwiper/MobileSwiper.module.css` | `MobileSwiper.module.css` |
| `StatusCard/index.tsx` | `StatusCard.tsx` |
| `StatusCard/StatusCard.module.css` | `StatusCard.module.css` |
| `SurfaceCard/index.tsx` | `SurfaceCard.tsx` |
| `SurfaceCard/SurfaceCard.module.css` | `SurfaceCard.module.css` |

`hooks/` keeps its folder (two files, and `useIsMobile.ts` is already named).

### Relative paths that change (all inside `src/ui/`)

Nine lines, and only because a folder level disappears:

- `../../utils/pathUtils` → `../utils/pathUtils` — in `DesktopSplitBackground` and `MobileSwiper`
- `../SurfaceCard` → `./SurfaceCard` — in `StatusCard`
- `../MobileSwiper` → `./MobileSwiper` — in `MobileShell`
- `composes: … from '../pageContainer.module.css'` → `'./pageContainer.module.css'` — two lines in `LoginCard.module.css`
- each `import styles from './X.module.css'` stays as it is

The **18 `composes` from outside `src/ui/`** (in `booksession`, `bookingview`,
`admin`, `WeddingGuest`, `WeddingManager`) all point at `formStyles`,
`pageContainer` and `text` — three files that are already flat and do not move.
**Not one of them changes.**

### Other renames

| From | To | Why |
|---|---|---|
| `src/services/wedding/index.ts` | `src/services/wedding/guest.provider.ts` | it selects an implementation, it is not a barrel. 2 consumers |
| `src/ui/hooks/index.ts` | *deleted* | one line re-exporting one hook. 7 consumers import `@ui/hooks/useIsMobile` |
| `.../custom/carla-joel/index.tsx` | `.../custom/carla-joel/CarlaJoelCustomWedding.tsx` | 1 consumer (`AppRouter`, commented out) |

## 8. API surface

None. Build-time only.

## 9. UI / UX

None. If anything renders differently, the refactor is wrong.

## 10. Edge cases

- **Vite/TS resolution:** `@ui/AppBar` resolving to `src/ui/AppBar.tsx` needs no config change — the alias points at `src/ui` and normal extension resolution takes over. Verify anyway on the first move before doing the other seven.
- **CSS Modules `composes`** does not accept the `@ui` alias (documented in spec 001). Every path stays relative; check the two in `LoginCard.module.css`.
- **Case-insensitive filesystems:** none of these renames differs only in case, so no two-step rename needed. Do not add one.
- **`git mv` of a folder to a file** is not one operation — move the files out, then remove the empty folder.
- `carla-joel/index.tsx` is referenced from a commented-out route in `AppRouter.tsx:65`. Update the comment too, or it rots.

## 11. Acceptance criteria

- [ ] `find src -name "index.*"` returns exactly the three category-A barrels.
- [ ] `git diff` shows no change to any `@ui/*` import string.
- [ ] `npx tsc -b`, `npm run build`, `npm run lint`, `tools/check-tokens.sh` clean.
- [ ] The app renders identically — spot-check a page using `SurfaceCard`, one using `MobileShell`, and both logins.
- [ ] `git log --follow` on one moved file still shows its history.
- [ ] `.claude/skills/design-system.md` states the rule (see FR-7).

## 12. Open questions

- Q1: **Resolved** — flat, no folder. A folder is justified from three files per component; these have two. Revisit per component if one ever grows sub-components or tests.
- Q2: Should the convention be enforceable rather than written down? An ESLint rule banning a default export from a file named `index` would catch category D, but not C. Probably not worth a custom rule — decide before implementing.
- Q3: `@ui/hooks` currently reads well as a namespace. Removing its barrel (FR-4) makes the seven consumers say `@ui/hooks/useIsMobile`. More honest, slightly longer. Confirm this is wanted, or drop FR-4.

## 13. Out of scope / future work

- Naming inside `src/components/`: `pricingCardComponent.tsx` exports `PricingCard`, `carrousel.tsx` exports `ImageSlider`, `photoComponent.tsx` exports `PhotoItem`, `threePhotoComponent.tsx` exports `ThreePhotoRow`. Four files whose name does not match their export — same class of problem, different spec.
- File-name casing is inconsistent across the repo (`advicetext.tsx`, `customTitle.tsx`, `FAQs.tsx`, `main.header.tsx`, `pregnant.page.tsx`). Worth one decision and one pass, not part of this.
- Whether `src/ui` should live at the root or under `src/components/ui`. It is at the root for the `@ui` alias; not revisited here.
