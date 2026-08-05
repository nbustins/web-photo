# 006 — Refactor the file naming convention

- **Status:** draft
- **Owner:** Narcís
- **Created:** 2026-08-05
- **Updated:** 2026-08-05

Two phases, deliberately separated: **F1 closes the analysis and writes the
convention down; F2 executes it.** F2 does not start until F1 is approved —
a rename pass with the rule still undecided is how you get a second rename pass.

---

## 1. Context

Spec 001 moved a lot of files. It did not touch what they are called. Three
naming problems are visible in `src/` today, and they compound: you cannot fix
one without deciding the others.

### 1.1 `index` doing three different jobs

`src/` has 13 files named `index.*`:

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

Category D is the visible pain: eight editor tabs all reading `index.tsx`, and
fuzzy file search useless for the primitives that get opened most. It was never
a decision — spec 001 inherited the layout when it moved `LoginCard`,
`MobileShell`, `MobileSwiper` and `DesktopSplitBackground` into `src/ui/`, then
`AppBar` and `StatusCard` were added the same way for consistency.

`src/ui/` is also internally inconsistent: `formStyles.module.css`,
`pageContainer.module.css` and `text.module.css` sit flat at the root, while
every component gets a folder.

### 1.2 Four casing conventions at once

Across the 65 `.tsx` files (excluding `index.tsx`):

| Pattern | Count | Examples |
|---|---|---|
| `PascalCase` | 35 | `SurfaceCard`, `GuestCodeEntry`, `BookingsTab` |
| `camelCase` | 12 | `customTitle`, `whyDoSession`, `storeBook` |
| `dot.separated` | 10 | `main.header`, `pregnant.page`, `under.construction` |
| `lowercase` | 8 | `advicetext`, `aboutme`, `booksession`, `bookstore` |

PascalCase dominates, but only because spec 001 created most of those files.
The older the file, the more likely it is lowercase.

### 1.3 Files whose name is not what they export

Casing aside, some names point at the wrong thing:

| File | Exports | Note |
|---|---|---|
| `components/carrousel.tsx` | `RotatingImageCarousel` | re-exported by the barrel as `ImageSlider`. **Three names for one component** |
| `components/photoComponent.tsx` | `PhotoItem` | "Component" adds nothing |
| `components/pricingCardComponent.tsx` | `PricingCard` | same |
| `components/threePhotoComponent.tsx` | `ThreePhotoRow` | same |
| `pages/familiar/components/threeFamiliarPhotos.tsx` | `ThreePhotoRow` | **same export name as the `@components` one**, different component |
| `pages/familiar/familiar.page.tsx` | `containerVariants` (exported) | animation variants leaking out of a page module |

`ImageSlider` is the worst case: the file says `carrousel`, the component says
`RotatingImageCarousel`, and the five pages that use it say `ImageSlider`.

### 1.4 On the folder question

Both layouts are industry-standard; the discriminator is **how many files a
component has**. Mantine and MUI use a folder per component because each carries
a tsx, a stylesheet, a context, tests and stories — five or more files.
shadcn/ui is flat because each component is a single file. The rule that falls
out: **a folder starts paying off at three files.**

Every `@ui` component here has exactly two — the `.tsx` and its `.module.css`.
The shared name prefix already groups them, and the editor already sorts them
adjacent. The folder adds a level that separates nothing.

Decisive fact: **the import path is identical either way.** `@ui/AppBar`
resolves to `src/ui/AppBar.tsx` exactly as it resolved to
`src/ui/AppBar/index.tsx`.

## 2. Goal

One written naming convention for `src/`, and the tree matching it: every file
named after what it contains, `index` surviving only where it is a real barrel.

## 3. Non-goals

- Changing any component's behaviour, props, markup or styling. Zero runtime diff in F2.
- Removing the three real barrels (§1.1 category A). Re-exporting a folder's public surface is exactly what `index` is for, and `@components` reads better than eleven file paths.
- Moving files between layers or reorganising `src/pages/`. This is about names, not structure.
- An ESLint rule to enforce it — see §12 Q2, resolved as no.
- Adding tests, stories or a component-library structure.

## 4. User stories

- As a developer, I want the editor tab to say `SurfaceCard.tsx`, so that I can tell my eight open primitives apart.
- As a developer, I want the filename to tell me what is inside, so that fuzzy file search finds it.
- As a developer adding a file, I want one written rule to follow, so that the tree does not drift back to four conventions.

---

## F1 — Close the analysis and write the convention

> Output: a `convention.md` next to this spec, plus the decisions filled into
> §5 below. **No file is renamed in F1.**

### T1.1 — Decide the casing rule

Pick one rule per kind of file and record the reasoning:

- React components (`.tsx` exporting a component)
- Hooks
- Non-component modules (`types.ts`, `labels.ts`, `hooks.ts`, `*.service.ts`)
- Pages and layouts — today `pregnant.page.tsx`, `main.header.tsx`. Is the `.page`/`.layout` suffix worth keeping, or does the folder already say it?
- CSS Modules — today always `<Owner>.module.css`, already consistent. Confirm and freeze.

**Done when:** each of the 65 `.tsx` files maps to exactly one rule, with no
"it depends".

### T1.2 — Produce the full rename table

One row per file that changes: current path → new path → consumers to update.
Derived mechanically from T1.1 plus §1.1 and §1.3. This table is what F2
executes; F2 adds no judgement of its own.

**Done when:** the table exists and every row has its consumer count.

### T1.3 — Resolve the three-names case

`carrousel` / `RotatingImageCarousel` / `ImageSlider` must end up as one name.
Also `ThreePhotoRow` existing twice, in `@components` and in
`pages/familiar/components/`, for two different components.

**Done when:** each has a single chosen name and the reason is written down.

### T1.4 — Write `convention.md`

Rules and examples, no inventory — the inventory rots, the rules do not. Linked
from `.claude/skills/design-system.md` so it is found when a new file is added.

**Done when:** a developer can name a new file without asking.

---

## F2 — Execute

> Starts only once F1 is approved. Mechanical: applies the T1.2 table.

Split into commits by area so a mistake is cheap to revert:

- **T2.1** `src/ui/` → flat layout, category-D files renamed (§7.1)
- **T2.2** the other `index` files: `services/wedding`, `ui/hooks`, `carla-joel` (§7.2)
- **T2.3** `src/components/` renames (name ≠ export, §1.3)
- **T2.4** casing pass over the rest, per the T1.1 rule
- **T2.5** documentation updated, spec moved to `specs/done/`

---

## 5. Functional requirements

### F1

- FR-1: A written convention covers every file kind in `src/`; no file falls outside it.
- FR-2: A complete rename table exists, one row per affected file, with consumers listed.
- FR-3: The `ImageSlider` triple-naming and the duplicated `ThreePhotoRow` each resolve to one name.
- FR-4: `convention.md` is reachable from `.claude/skills/design-system.md`.

### F2

- FR-5: The eight category-D files are renamed to the component they export, and their folder is removed (flat layout, §12 Q1).
- FR-6: Every `@ui/*` import stays character-for-character identical. If any import string changes, the layout choice was applied wrong.
- FR-7: `src/services/wedding/index.ts` is renamed to a name describing what it does. It is not a barrel: it reads `VITE_USE_MOCK_DATA` and picks `MockGuestService` or `ApiGuestService`. Its two consumers update their import.
- FR-8: `src/ui/hooks/index.ts` (one line, one re-export) is removed; the seven consumers import `@ui/hooks/useIsMobile`, which says at the import site which hook it is (§12 Q3).
- FR-9: The three category-A barrels stay untouched.
- FR-10: `src/pages/weddings/WeddingGuest/custom/carla-joel/index.tsx` is renamed after the component it exports (`CarlaJoelCustomWedding`).
- FR-11: The rest of `src/` matches the T1.1 casing rule.
- FR-12: `familiar.page.tsx` stops exporting `containerVariants` — it is page-local.

## 6. Non-functional requirements

- NFR-1: `npx tsc -b`, `npm run build`, `npm run lint` and `tools/check-tokens.sh` clean after every F2 commit, not just the last.
- NFR-2: Pure rename. `git diff --stat` shows renames and import-line changes, nothing else.
- NFR-3: Use `git mv` so history follows the file.
- NFR-4: No new dependency, no new tooling.

## 7. Scope — the moves already known

These are settled and go straight into the T1.2 table.

### 7.1 `src/ui/` → flat

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

**Relative paths that change — nine lines, all inside `src/ui/`,** and only
because a folder level disappears:

- `../../utils/pathUtils` → `../utils/pathUtils` — in `DesktopSplitBackground` and `MobileSwiper`
- `../SurfaceCard` → `./SurfaceCard` — in `StatusCard`
- `../MobileSwiper` → `./MobileSwiper` — in `MobileShell`
- `composes: … from '../pageContainer.module.css'` → `'./pageContainer.module.css'` — two lines in `LoginCard.module.css`
- each `import styles from './X.module.css'` stays as it is

The **18 `composes` from outside `src/ui/`** (in `booksession`, `bookingview`,
`admin`, `WeddingGuest`, `WeddingManager`) all point at `formStyles`,
`pageContainer` and `text` — three files that are already flat and do not move.
**Not one of them changes.**

### 7.2 The other `index` files

| From | To | Consumers |
|---|---|---|
| `src/services/wedding/index.ts` | `src/services/wedding/guest.provider.ts` | 2 |
| `src/ui/hooks/index.ts` | *deleted* | 7 → `@ui/hooks/useIsMobile` |
| `.../custom/carla-joel/index.tsx` | `.../custom/carla-joel/CarlaJoelCustomWedding.tsx` | 1 (commented-out route) |

## 8. API surface

None. Build-time only.

## 9. UI / UX

None. If anything renders differently, the refactor is wrong.

## 10. Edge cases

- **Vite/TS resolution:** `@ui/AppBar` resolving to `src/ui/AppBar.tsx` needs no config change — the alias points at `src/ui` and normal extension resolution takes over. Verify on the first move before doing the other seven.
- **CSS Modules `composes`** does not accept the `@ui` alias (documented in spec 001). Every path stays relative; check the two in `LoginCard.module.css`.
- **Case-only renames** (`advicetext.tsx` → `AdviceText.tsx`) are invisible to a case-insensitive filesystem and silently break on macOS/Windows. They need `git mv` through a temporary name, and they are the majority of T2.4. Do not batch them blindly.
- **`git mv` of a folder to a file** is not one operation — move the files out, then remove the empty folder.
- `carla-joel/index.tsx` is referenced from a commented-out route in `AppRouter.tsx:65`. Update the comment too, or it rots.
- Renaming a file that a barrel re-exports means touching two places; the barrel is not automatically updated.

## 11. Acceptance criteria

### F1

- [ ] `convention.md` exists, covers every file kind, and is linked from `.claude/skills/design-system.md`.
- [ ] The rename table is complete: no file in `src/` is left "to be decided".
- [ ] `ImageSlider` and the duplicated `ThreePhotoRow` each have one chosen name with a written reason.

### F2

- [ ] `find src -name "index.*"` returns exactly the three category-A barrels.
- [ ] `git diff` shows no change to any `@ui/*` import string.
- [ ] Every file in `src/` matches the convention; a fresh pass finds nothing.
- [ ] `npx tsc -b`, `npm run build`, `npm run lint`, `tools/check-tokens.sh` clean after each commit.
- [ ] The app renders identically — spot-check a page using `SurfaceCard`, one using `MobileShell`, both logins, and the carousel pages.
- [ ] `git log --follow` on one moved file still shows its history.

## 12. Open questions

- Q1: **Resolved** — flat, no folder for `@ui` components. A folder is justified from three files per component; these have two. Revisit per component if one ever grows sub-components or tests.
- Q2: **Resolved** — no ESLint rule. A custom rule for a problem that stops existing after this pass is not worth its maintenance; `convention.md` plus review is enough.
- Q3: **Resolved** — remove the `@ui/hooks` barrel. `@ui/hooks/useIsMobile` is longer but says at the import site which hook it is, which is the point.
- Q4: F1, T1.1 — is the `.page` / `.layout` suffix worth keeping (`pregnant.page.tsx`, `main.layout.tsx`)? It survives from before the folder structure existed. To decide in F1, not now.

## 13. Out of scope / future work

- Whether `src/ui` should live at the root or under `src/components/ui`. It is at the root for the `@ui` alias; not revisited here.
- Naming of non-`src` files (`tools/`, `specs/`, config at the root).
- Folder naming — `src/pages/weddings/WeddingGuest/` is PascalCase while its siblings are lowercase. Same class of problem; fold into F1 if it is cheap, otherwise a follow-up.
