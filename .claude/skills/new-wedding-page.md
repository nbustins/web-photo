# Skill: Create a New Wedding RSVP Page

Use this skill when adding a new wedding couple's RSVP page to the system.

## Architecture

Wedding pages are **standalone** — no MainLayout wrapper, no site header/footer. They're accessed via direct URL (e.g. `/#/weddings/slug?code=CODE`).

Each wedding has:
- An **RSVP page** for guests to confirm attendance
- A **Manager page** for the couple to view confirmations
- Configurable **images** (hero + background) stored in `public/weddings/<slug>/`

## Data Flow

```
Supabase (weddings table) → guestService → WeddingRsvpPage → State Components
```

The `Wedding` type (`src/model/wedding.types.ts`):
```typescript
interface Wedding {
  id: string;
  slug: string;
  title: string;            // e.g. "Anna & Joan"
  subtitle?: string;        // e.g. "Confirma la teva assistència"
  hero_image?: string;      // relative path: "weddings/slug/hero.jpg"
  background_image?: string;
  event_date: string;
  closing_date: string;
  manager_code: string;
}
```

## Steps to add a new wedding

### 1. Add Supabase data
Insert a new row in the `weddings` table with the couple's details, slug, dates, and manager code.

### 2. Add route
**File:** `src/model/routes.model.ts`
```typescript
weddingNewCouple = "/weddings/new-couple",
weddingNewCoupleManager = "/weddings/new-couple/manager",
```

### 3. Create the page (thin wrapper)
**File:** `src/pages/weddings/new-couple.tsx`

Copy `anna-joan.tsx` and change the `SLUG` constant to the new wedding slug. Everything else (title, subtitle, images) comes from the database.

### 4. Register in router
**File:** `src/router/AppRouter.tsx`
```typescript
<Route path={AppRoutes.weddingNewCouple} element={<NewCoupleWedding />} />
<Route path={AppRoutes.weddingNewCoupleManager} element={<Manager />} />
```

### 5. Add images (optional)
Place files in `public/weddings/<slug>/`:
- `hero.jpg` — displayed inside the card header (max-height 200px, cover)
- `bg.jpg` — blurred full-page background

If no images are configured, the page gracefully shows the text-only design.

## Shared Components

All wedding components live in `src/pages/weddings/components/`:
- `WeddingCard` — glassmorphism card wrapper with Framer Motion
- `WeddingCardHeader` — title, subtitle, guest name, optional hero image
- `EnterCodeState`, `FormState`, `SuccessState`, `NotFoundState`, `ClosedState`, `LoadingState`

Components accept `title`, `subtitle`, and `heroImage` props — all derived from the `Wedding` data model.

## Style rules

- **Inline styles only** — no CSS class files for wedding components
- Colors follow the design system: `#7C7458` primary, `rgb(174, 142, 116)` accent
- Font sizing: always `clamp(min, vw, max)`
- Buttons: rely on Ant Design ConfigProvider (pill shape, primary color) — no `!important`
- Background: solid `rgb(246, 244, 240)` when no background image; blurred image when configured
