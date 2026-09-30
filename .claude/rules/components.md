---
paths:
  - "src/pages/**"
  - "src/components/**"
  - "src/ui/**"
  - "src/layouts/**"
---

# Shared components reference

What already exists and how to use it, before building a new component or
pulling one into a single module. For design values (colors, sizes, type
scale) see `.claude/rules/styling.md` and `src/styles/tokens.ts`. For which
layer a new component belongs in, see `.claude/rules/styling.md` → "Layers
and module boundaries".

**Import path:** everything in `src/components/` (layer 2, editorial
marketing blocks) is imported from the barrel:

```typescript
import { CustomTitle, PricingCard, FAQs, ImageSlider, /* … */ } from "@components";
```

Never by direct file path (`@components/customTitle`) — ESLint-enforced
(`no-restricted-imports`). If a component isn't in `src/components/index.ts`
yet, add it there instead of importing by path.

## CustomTitle

Animated page header with a small label above the main title.

```typescript
import { CustomTitle } from "@components";

<CustomTitle label="sessió de" title="Embaràs" />
```

Used at the top of every session page.

## ThreePhotoRow

Three staggered photos in a row, animated in on scroll.

```typescript
import { ThreePhotoRow } from "@components";

<ThreePhotoRow
  photoPaths={[
    getPublicPath("session/2.jpg"),
    getPublicPath("session/3.jpg"),
    getPublicPath("session/4.jpg"),
  ]}
  rowClassName={blocks.sectionRow}
/>
```

- The prop is `photoPaths` (a 3-tuple), **not** `photos`.
- `rowClassName` is optional: usually `blocks.sectionRow` from
  `@components/blocks.module.css`, or `sectionRowLoose` for more breathing
  room.
- The center photo is larger than the side ones.
- Stacks full-width on mobile; portrait aspect ratio enforced per photo.

## PricingCard

Pricing tier card with a feature list and a booking button.

```typescript
import { PricingCard } from "@components";

<PricingCard
  title="Bàsica"
  features={["10 fotos editades", "2 hores de sessió"]}
  price={250}
  adviceText="Preus orientatius"
  sessionTypeId={sessionType.id}
/>
```

- `price` is a **number**, not a string — the component formats it with
  `Intl.NumberFormat('ca-ES')` in euros. Don't include the symbol.
- `adviceText` is optional; the component adds the asterisk, don't write it
  yourself.
- The prop is `sessionTypeId` (numeric, optional) — **not** `onBook`. With
  `sessionTypeId`, the button navigates straight to that session type's
  booking step; without it, it falls back to the generic booking route.
- "Reserva" button stays bottom-aligned regardless of content height.
- `features` accepts strings or JSX elements.
- Use inside `<Col xs={24} md={8}>` for 3 columns, or `md={12}` for 2.

## ImageSlider (carousel)

Auto-rotating image carousel.

```typescript
import { ImageSlider } from "@components";

const images = Array.from({ length: 12 }, (_, i) =>
  getPublicPath(`session/${i + 1}.jpg`)
);

<ImageSlider images={images} />
```

- Number of visible images depends on `useIsMobile()` (1 on mobile, more on
  desktop) — not a custom `matchMedia` call.
- Portrait aspect ratio per image.

## FAQs

Two-column section: image on the left, question/answer list on the right.

```typescript
import { FAQs } from "@components";

<FAQs
  imageSrc={getPublicPath("session/faq.jpg")}
  faqs={[
    { title: "Quan és el millor moment?", text: "Entre les 28 i 34 setmanes." },
    { title: "Quant dura la sessió?", text: "Aproximadament 2 hores." },
  ]}
/>
```

- The prop is `imageSrc` — **not** `image`.
- `faqs`: array of `{ title: string, text: ReactNode }` — `text` is usually
  JSX (`<p>…</p>`), not a plain string.
- `imageWidth` optional (default `"100%"`), useful to constrain the photo.
- Section background is full-width.

## WhyDoSession

Full-width dark section with a large handwritten-style heading, descriptive
text, and an image below.

```typescript
import { WhyDoSession } from "@components";

<WhyDoSession
  heading={<>Per què recomano fer<br />la sessió d'embaràs?</>}
  textWhyDoThisSession={<p>El text descriptiu, com a JSX.</p>}
  image={getPublicPath("pregnancy/4.jpg")}
  imageAlt="Imatge de la mare embarassada"
/>
```

- All four props are required: the component has no idea which session it's
  for.
- `heading` and `textWhyDoThisSession` are `ReactNode`. The heading usually
  has a hand-placed `<br />`, hence it's not a plain string.
- `image` expects a path already resolved with `getPublicPath`. `imageAlt` is
  required: if you change the image, update the alt text with it.
- Works for any session type, not just pregnancy.

## ImageBackground

Full-width background-image section.

```typescript
import { ImageBackground } from "@components";

<ImageBackground
  height="80vh"
  imageUrl={getPublicPath("session/hero.jpg")}
/>
```

Useful for hero sections without an `<img>` tag.

## AdviceText

Small italic disclaimer text.

```typescript
import { AdviceText } from "@components";

<AdviceText>* Preus orientatius, consulta disponibilitat.</AdviceText>
```

- Content is **children**, not a `text` prop.
- Inside a `PricingCard`, the card itself adds the asterisk: pass
  `adviceText` there instead of using `AdviceText` directly.

## Utility: imageUrl

Always use this for image paths — resolves a local `public/` path (prefixing
Vite's `BASE_URL`), a Cloudinary URL (applying `f_auto,q_auto` and an
optional width transform), or any other external URL.

```typescript
import { imageUrl } from "@utils/pathUtils";

const src = imageUrl("newborn/1.jpg");
const optimized = imageUrl("https://res.cloudinary.com/.../hero.jpg", 1600);
```

## Utility: ScrollToTop

Already applied globally in `AppRouter.tsx`. Don't add it to individual
pages.

## `@ui` primitives (layer 1, domain-free)

Not marketing-specific but reused everywhere — see `.claude/rules/
styling.md` for the layer rule:

- `SurfaceCard`, `SurfaceCardHeader` — glass card with header (formerly
  `GlassCard`/`WeddingCard`).
- `StatusCard` — result with a round icon and title; `tone="success|error|
  info"`. Used for bookings and wedding confirmation.
- `AppBar` — dark header pinned to the top of app areas (admin panel, wedding
  manager); actions on the right via `actions`.
- `MobileShell`, `MobileSwiper`, `DesktopSplitBackground` — login/form layout
  with an image.
- `LoginCard` — full login form (admin, wedding manager).
- `useIsMobile` — the single breakpoint hook.

Shared stylesheets (not components), for `composes` from a `.module.css`
with a **relative path** (the `@ui` alias doesn't work inside `composes`):

- `@ui/text.module.css` — `.body`, `.caption`.
- `@ui/formStyles.module.css` — `.label`, `.input`.
- `@ui/pageContainer.module.css` — `.page` (820px), `.pageWide` (1200px,
  under `AppBar`), `.splitScreen` + `.splitPanel` (split-background screen).
