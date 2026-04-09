# Skill: Create a New Photography Session Page

Use this skill when the user asks to add a new photography session type (e.g., "pets", "weddings", "boudoir", etc.).

## What to build

A session page follows this exact structure (top to bottom):

1. **CustomTitle** — label + title header
2. **Hero image** — full-width image (or ImageBackground) with Framer Motion fade-in
3. **Descriptive text** — one or two paragraphs, Italiana font
4. **ThreePhotoRow** — three staggered photos side-by-side
5. **WhyDoSession** (optional) — dark section with large heading + image
6. **Carousel** — rotating image gallery (4 visible on desktop, 1 on mobile)
7. **PricingCard grid** — 2 or 3 pricing tiers in a Row/Col layout
8. **FAQs** — cream section with image + Q&A list

---

## Step-by-step implementation

### 1. Add the route enum value

**File:** `src/model/routes.model.ts`

Add the new route to `AppRoutes`:
```typescript
export enum AppRoutes {
  // ...existing routes...
  pets = "/pets",  // example
}
```

### 2. Register the route in the router

**File:** `src/router/AppRouter.tsx`

Import and add the new page component:
```typescript
import PetsPage from "@pages/pets/pets.page";

// Inside <Routes>:
<Route path={AppRoutes.pets} element={<PetsPage />} />
```

### 3. Add to navigation menu

**File:** `src/layouts/components/main.header.tsx`

Find the menu items array and add the new entry:
```typescript
{ key: AppRoutes.pets, label: "Mascotes" }
```
Place it in the correct menu group (leftItems or rightItems).

### 4. Create the page directory and component

**File:** `src/pages/<name>/<name>.page.tsx`

Use this template:

```typescript
import { motion } from "framer-motion";
import { Col, Row } from "antd";
import { CustomTitle, ThreePhotoRow, PricingCard, FAQs } from "@components";
import Carrousel from "@components/carrousel";
import { getPublicPath } from "@utils/pathUtils";
import { pageBodyPadding } from "../../styles/tokens/radii";
import { useNavigate } from "react-router";
import { AppRoutes } from "../../model/routes.model";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const SESSION_IMAGES = Array.from({ length: 12 }, (_, i) =>
  getPublicPath(`<folder>/${i + 1}.jpg`)
);

const PRICING = [
  {
    title: "Bàsica",
    features: ["X fotos editades", "Y hores de sessió"],
    price: "XXX€",
  },
  {
    title: "Completa",
    features: ["X fotos editades", "Y hores de sessió", "Extra feature"],
    price: "XXX€",
  },
];

const FAQS = [
  { title: "Pregunta 1?", text: "Resposta 1." },
  { title: "Pregunta 2?", text: "Resposta 2." },
];

export default function <Name>Page() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: pageBodyPadding }}>
      <CustomTitle label="sessió de" title="<Nom de la Sessió>" />

      {/* Hero image */}
      <motion.img
        src={getPublicPath("<folder>/hero.jpg")}
        alt="<Session name>"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ width: "100%", borderRadius: "0.3rem", marginBottom: 32 }}
      />

      {/* Descriptive text */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          fontFamily: "Italiana, serif",
          fontSize: "clamp(1rem, 2vw, 1.4rem)",
          textAlign: "center",
          maxWidth: 700,
          margin: "0 auto 48px",
          color: "#333",
        }}
      >
        Text descriptiu de la sessió.
      </motion.p>

      {/* Three photo row */}
      <ThreePhotoRow
        photos={[
          getPublicPath("<folder>/2.jpg"),
          getPublicPath("<folder>/3.jpg"),
          getPublicPath("<folder>/4.jpg"),
        ]}
      />

      {/* Carousel */}
      <Carrousel images={SESSION_IMAGES} />

      {/* Pricing */}
      <Row gutter={[24, 24]} justify="center" style={{ margin: "48px 0" }}>
        {PRICING.map((plan) => (
          <Col xs={24} md={8} key={plan.title}>
            <PricingCard
              title={plan.title}
              features={plan.features}
              price={plan.price}
              onBook={() => navigate(AppRoutes.bookSession)}
            />
          </Col>
        ))}
      </Row>

      {/* FAQs */}
      <FAQs
        image={getPublicPath("<folder>/faq.jpg")}
        faqs={FAQS}
      />
    </div>
  );
}
```

---

## Design rules to follow

- **Never** hardcode font sizes — always use `clamp(min, vw, max)`
- **Always** add `viewport={{ once: true }}` to Framer Motion animations (fire once on scroll-in)
- **Always** use `getPublicPath()` for image paths — never raw strings
- **Always** use `pageBodyPadding` from tokens for the outer container padding
- Use `radii.md` (`0.3rem`) for image border-radius — import from `src/styles/tokens/radii`
- Grid columns: `xs={24} md={8}` for 3-column, `xs={24} md={12}` for 2-column

## Image folder convention

Place images in `public/<session-name>/` numbered from `1.jpg`.
Hero images are typically the best composed shot (not necessarily `1.jpg`).
