# Design System Reference

Reference this skill when making UI decisions, styling components, or ensuring visual consistency.

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#7C7458` | Buttons, links, accents (configured in Ant Design ConfigProvider) |
| Dark text | `#333` | Body text, headings |
| Dark bg | `#231f20` | WhyDoSession section background |
| Cream bg | `#FFF9E5` | FAQs section background |
| Light bg | `rgb(246, 244, 240)` | AboutMe page background |
| Accent brown | `rgb(174, 142, 116)` | Decorative text |

Do **not** introduce new colors without a strong reason. Use these tokens consistently.

---

## Typography

| Font | Weight | Usage |
|------|--------|-------|
| Raleway | 300–600 | App-wide default (set via Ant Design, no need to declare) |
| Italiana | 400 | Decorative headings, session titles, descriptive paragraphs |
| Playfair Display | 400–900 | FAQs titles, elegant headers |
| Indie Flower | 400 | Casual/handwritten accents (WhyDoSession section) |

Font sizing rule — always use `clamp()`:
```css
font-size: clamp(1rem, 2vw, 1.4rem);   /* body text */
font-size: clamp(1.6rem, 3vw, 3rem);   /* section titles */
font-size: clamp(2rem, 5vw, 5rem);     /* hero/display */
```

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `pageBodyPadding` | `24px` | Outer padding for all page wrappers |
| `radii.sm` | `0.1rem` | Subtle rounding |
| `radii.md` | `0.3rem` | Default — images, cards |
| `radii.lg` | `0.5rem` | Larger elements |

Import: `import { pageBodyPadding, radii } from "../../styles/tokens/radii"`

Row gutters: `gutter={[24, 24]}` (horizontal, vertical) — use consistently.

Section vertical spacing: `margin: "48px 0"` between major page sections.

---

## Grid & Responsive Layout

Always use Ant Design `Row` / `Col`. Standard breakpoints:

| Columns | Col props |
|---------|-----------|
| 3-column | `xs={24} md={8}` |
| 2-column | `xs={24} md={12}` |
| Full width | `xs={24}` |

Never use CSS floats or absolute-positioned columns. All layouts must stack on mobile (`xs={24}`).

---

## Buttons

Configured globally in `App.tsx` via ConfigProvider:
- Border radius: `999px` (pill shape)
- Padding: `22px`
- Height: `40px`
- Primary color: `#7C7458`

Do not override these per-component. Use `<Button type="primary">` for CTAs.

---

## Animation

All scroll-triggered animations use Framer Motion with `viewport={{ once: true }}`.

**Standard fade-up variant** (use this for most elements):
```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};
```

**Stagger container** (for lists/grids):
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

**Hover scale** (for interactive cards/photos):
```typescript
whileHover={{ scale: 1.03 }}
```

---

## Image conventions

- All images served from `public/` folder
- Always use `getPublicPath(path)` — never raw string paths
- Aspect ratio for photos: **2:3** (portrait) — enforced via `aspect-ratio: 2/3`
- Image border-radius: `radii.md` (`0.3rem`)
- Hero images: full width, natural aspect ratio

```typescript
import { getPublicPath } from "@utils/pathUtils";
const src = getPublicPath("session-name/1.jpg");
```

---

## Ant Design component rules

- Use `<Row>` / `<Col>` for all grid layouts
- Use `<Typography.Title>` / `<Typography.Text>` sparingly — most text is styled via inline `style` props
- Cards: `boxShadow: "none"` to remove default Ant Design shadow
- Never mix Ant Design layout with raw CSS flexbox grids — pick one
