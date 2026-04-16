# Skill: Shared Components Reference

Reference this when building pages to know which components already exist and how to use them.
**Import paths:**
- `CustomTitle` → `@components/customTitle`
- `PricingCard`, `PhotoItem`, `ImageSlider`, `AdviceText` → `@components` (via index)
- `Carrousel` → `@components/carrousel` (direct — not in index)
- Other components (`FAQs`, `ThreePhotoRow`, `WhyDoSession`, `ImageBackground`) → import directly from their file path

---

## CustomTitle

Animated page header with a small label above the main title.

```typescript
import { CustomTitle } from "@components";

<CustomTitle label="sessió de" title="Embaràs" />
```

- Label: small uppercase text
- Title: large Italiana serif with fade-in animation
- Used at the top of every session page

---

## ThreePhotoRow

Three staggered photos in a row with scroll-triggered stagger animation.

```typescript
import { ThreePhotoRow } from "@components";

<ThreePhotoRow
  photos={[
    getPublicPath("session/2.jpg"),
    getPublicPath("session/3.jpg"),
    getPublicPath("session/4.jpg"),
  ]}
/>
```

- Middle photo has larger max-width (430px vs 340px sides)
- Stacks to full-width on mobile
- Aspect ratio 2:3 enforced per photo

---

## PricingCard

A pricing tier card with feature list and book button.

```typescript
import { PricingCard } from "@components";

<PricingCard
  title="Bàsica"
  features={["10 fotos editades", "2 hores de sessió"]}
  price="250€"
  onBook={() => navigate(AppRoutes.bookSession)}
/>
```

- "Reserva" button is bottom-aligned regardless of content height
- Use inside `<Col xs={24} md={8}>` for 3-column or `md={12}` for 2-column layouts
- Features accept strings or JSX elements

---

## Carrousel

Auto-rotating image carousel (rotates every 2.5s).

```typescript
import Carrousel from "@components/carrousel";

const images = Array.from({ length: 12 }, (_, i) =>
  getPublicPath(`session/${i + 1}.jpg`)
);

<Carrousel images={images} />
```

- Shows 4 images on desktop, 1 on mobile
- Aspect ratio 2:3 per image
- Smooth CSS transform transitions

---

## FAQs

Two-column section: image on the left, Q&A list on the right. Cream background.

```typescript
import { FAQs } from "@components";

<FAQs
  image={getPublicPath("session/faq.jpg")}
  faqs={[
    { title: "Quan és el millor moment?", text: "Entre les 28 i 34 setmanes." },
    { title: "Quant dura la sessió?", text: "Aproximadament 2 hores." },
  ]}
/>
```

- `image`: path string (use `getPublicPath`)
- `faqs`: array of `{ title: string, text: string }`
- Playfair Display font for Q titles
- Full-width cream background section

---

## WhyDoSession

Dark full-width section with large handwritten heading, descriptive text, and an image below.

```typescript
import { WhyDoSession } from "@components";

<WhyDoSession
  heading="Per què fer una sessió de maternitat?"
  text="Lorem ipsum descriptive text here."
  image={getPublicPath("session/why.jpg")}
/>
```

- Background: `#231f20`
- Heading font: Indie Flower
- Used in pregnancy page — optional for other pages

---

## ImageBackground

Simple full-width background image section.

```typescript
import { ImageBackground } from "@components";

<ImageBackground
  height="calc(100vh - 180px)"
  imageUrl={getPublicPath("session/hero.jpg")}
/>
```

- Useful for hero sections without an `<img>` tag
- CSS `background-size: cover, center`

---

## AdviceText

Small italic gray disclaimer text.

```typescript
import { AdviceText } from "@components";

<AdviceText text="* Preus orientatius, consulta disponibilitat." />
```

---

## Utility: getPublicPath

Always use this for image paths — it prepends Vite's `BASE_URL`.

```typescript
import { getPublicPath } from "@utils/pathUtils";

const src = getPublicPath("newborn/1.jpg");
// → "/newborn/1.jpg" (or prefixed base in production)
```

---

## Utility: ScrollToTop

Already applied globally in `AppRouter.tsx`. Do not add it to individual pages.
