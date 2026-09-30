---
name: new-session-page
description: Use when the user asks to add a new photography session type (e.g. "pets", "boudoir", "newborn") as a full marketing page with hero, gallery, pricing, and FAQs. For a minimal placeholder page use add-route; for a wedding RSVP page use new-wedding-page.
---

# Create a new photography session page

Before writing any styles, check `.claude/rules/styling.md` and
`.claude/rules/components.md` (auto-loaded when you touch `src/pages/**` or
`src/components/**`) for the design tokens and component APIs used below.

## What to build

A session page follows this exact structure (top to bottom):

1. **CustomTitle** — label + title header
2. **ThreePhotoRow** or hero image — with Framer Motion fade-in
3. **WhyDoSession** (optional) — dark section with large heading + image
4. **ImageSlider** (carousel) — rotating image gallery
5. **SessionPricingCards** — pricing tiers, fetched from the backend
6. **FAQs** — section with image + Q&A list

## Pricing is backend-driven — not hardcoded

Prices, features, and advice text for a session type live in the backend's
session catalog and are edited in admin, **not** in this repo. The page only
passes a `sessionGroupId` to `<SessionPricingCards>`
(`src/components/sessionPricingCards.tsx`), which calls
`fetchSessionTypesByGroup` and renders one `PricingCard` per session type it
gets back — no hardcoded fallback (a stale local copy would recreate the
exact catalog drift this replaced). Adding a genuinely new session **group**
means it must first exist in `wedding-manager-api`'s session catalog; ask
before assuming one exists.

## Steps

### 1. Add the route enum value

**`src/model/routes.model.ts`**
```typescript
export enum AppRoutes {
  // ...existing routes...
  pets = "/pets",  // example
}
```

### 2. Register the route

**`src/router/AppRouter.tsx`** — add to the `privateRoutes` map (rendered
inside `MainLayout` automatically):
```typescript
import PetsPage from "@pages/pets/pets.page";

const privateRoutes: Partial<Record<AppRoutes, FC>> = {
  // ...
  [AppRoutes.pets]: () => <PetsPage/>,
};
```

### 3. Add to the SESSIONS list (drives header submenu + homepage strip)

**`src/model/sessions.ts`** — this is the single source for both the
header's "SESSIONS" submenu and the session strip on the home page; don't
edit `main.header.tsx` directly for a session page (that's only for
non-session top-level nav items — see the `add-route` skill).

```typescript
{
  key: AppRoutes.pets,
  label: "Mascotes",
  caption: "Un moment curt per costat",
  cover: "pets/1.jpg", // path inside public/, imageUrl() adds the base — or a full Cloudinary URL
  inMenu: true,
},
```

### 4. Create the page directory and component

**`src/pages/<name>/<name>.page.tsx`** + a sibling `<name>.module.css` for
any static styles.

```typescript
import { Row, Col } from "antd";
import { CustomTitle, ThreePhotoRow, WhyDoSession, ImageSlider, FAQs, SessionPricingCards } from "@components";
import { imageUrl } from "@utils/pathUtils";
import blocks from "@components/blocks.module.css";

const photoPaths = Array.from({ length: 3 }, (_, i) => imageUrl(`<folder>/${i + 1}.jpg`));
const carouselPaths = Array.from({ length: 8 }, (_, i) => imageUrl(`<folder>/${i + 4}.jpg`));

export default function <Name>Page() {
  return (
    <>
      <div className={blocks.pageBody}>
        <header>
          <CustomTitle label="sessió de" title="<Nom de la Sessió>" />
        </header>

        <ThreePhotoRow photoPaths={photoPaths} rowClassName={blocks.sectionRowLoose} />

        <Row gutter={[0, 24]} justify="center">
          <WhyDoSession
            heading={<>Per què recomano fer<br />aquesta sessió?</>}
            textWhyDoThisSession={<p>Text descriptiu de la sessió.</p>}
            image={imageUrl("<folder>/4.jpg")}
            imageAlt="<Descripció de la imatge>"
          />
        </Row>

        <Row gutter={[24, 24]} justify="center" className={blocks.carouselRowLoose}>
          <ImageSlider images={carouselPaths} />
        </Row>

        {/* sessionGroupId comes from the backend's session catalog */}
        <SessionPricingCards sessionGroupId={/* group id */ 0} />
      </div>

      <FAQs
        imageSrc={imageUrl("<folder>/faq.jpg")}
        faqs={[
          { title: "Pregunta 1?", text: <p>Resposta 1.</p> },
          { title: "Pregunta 2?", text: <p>Resposta 2.</p> },
        ]}
      />
    </>
  );
}
```

`blocks.pageBody` (from `@components/blocks.module.css`) applies the page
body padding (`var(--lt-space-page)`) — don't reinvent it with an inline
style. `blocks.sectionRowLoose` / `carouselRowLoose` give sections and the
carousel their vertical rhythm.

Component prop names above (`photoPaths`, `imageSrc`, `price` as a number on
`PricingCard`, no `onBook`) are load-bearing — see
`.claude/rules/components.md` for the full reference; don't guess prop
shapes from memory.

## Design rules to follow

See `.claude/rules/styling.md` for the full rule set. Key points for this
page type:

- Never hardcode font sizes — use the existing `--lt-text-*` scale tokens or
  `clamp(min, vw, max)` for a one-off.
- Always add `viewport={{ once: true }}` to any Framer Motion animation you
  add directly (the shared components already do this internally).
- Always use `imageUrl()` for image paths — never a raw string.
- Grid columns inside a custom `Row`: `xs={24} md={8}` for 3-column,
  `xs={24} md={12}` for 2-column. `SessionPricingCards` sizes its own
  columns.

## Image folder convention

Place images in `public/<session-name>/`, numbered from `1.jpg`. Hero images
are typically the best-composed shot (not necessarily `1.jpg`). A cover image
can also be a full Cloudinary URL — `imageUrl()` handles both.
