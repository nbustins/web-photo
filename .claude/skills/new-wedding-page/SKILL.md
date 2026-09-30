---
name: new-wedding-page
description: Use when a new wedding couple needs an RSVP page in the system. Almost always a data operation in the admin panel, not new frontend files — read this before creating any page under src/pages/weddings/.
---

# Add a new wedding

## The default case: no new files needed

Wedding pages are **generic and data-driven**, not one file per couple.
`/weddings/:slug` and `/weddings/:slug/manager` are the only two routes
(registered once in `src/router/AppRouter.tsx`, no per-wedding entry in
`AppRoutes`); they render `GenericWedding` → `WeddingGuestPage` and
`WeddingManagerPage` respectively, fetching everything by `slug` at
runtime. There is **no Supabase** — this app has no direct database access;
everything goes through `wedding-manager-api` over REST.

Adding a new wedding is an **admin-panel operation**, not a code change:

1. Log in at `#/admin/login`, go to the Weddings tab
   (`src/pages/admin/tabs/WeddingsTab.tsx`).
2. Create the wedding: title, slug, event date, closing date, invite-code
   length, and the guest list file. This calls `createAdminWedding`
   (`src/services/wedding/api/admin-wedding.api.ts`).
3. Upload the wedding's photos through the same admin flow. The RSVP page's
   hero and background images default to the first uploaded photo
   (`WeddingGuestPage.tsx` falls back to `photoUrls[0]` when the API doesn't
   return an explicit `hero_image`/`background_image`) — there is no
   `public/weddings/<slug>/` convention to fill in.

If the request is "add a wedding for X and Y", do this — don't create a page
component.

## Data flow

```
wedding-manager-api → src/services/wedding/{api.service.ts, guest.provider.ts}
                    → WeddingGuestPage / WeddingManagerPage → state components
```

- `src/services/wedding/api.service.ts` — `ApiGuestService`, the concrete
  implementation of `GuestServiceProvider` (`getWeddingBySlug`,
  `getWeddingPhotos`, `getInvitation`, `saveConfirmation`,
  `getConfirmations`).
- `src/services/wedding/guest.provider.ts` — exports the singleton
  `guestService` used by the pages. Mock mode (`npm run dev:mock`) covers
  this the same way it covers every other endpoint, via MSW — there is no
  mock/real seam inside this service.
- `Wedding` type: `src/model/wedding.types.ts` (`slug`, `title`, optional
  `subtitle`, `hero_image`, `background_image`, `event_date`,
  `closing_date`, optional `manager_code`). The public API DTO only returns
  `slug`/`title`/`eventDate`; the rest is filled client-side from the
  photos endpoint.
- Guest-side state components (`src/pages/weddings/WeddingGuest/components/`):
  `GuestLoadingState`, `GuestCodeEntry`, `GuestNotFoundState`,
  `GuestClosedState`, `GuestConfirmationForm`, `GuestSuccessState`,
  `GuestMobileLayout`.
- Manager-side components (`src/pages/weddings/WeddingManager/components/`):
  `ManagerDesktopDashboard`, `ManagerMobileDashboard`,
  `ManagerInvitationDrawer`, `ManagerNotesModal`, `ManagerShared`.
- Route helpers in `src/model/routes.model.ts`: `weddingPath(slug)`,
  `weddingManagerPath(slug)` — use these instead of building the string by
  hand.

## The exception: a bespoke custom layout

Only when a couple needs a genuinely different visual design (not just
different data), add a custom layout — see
`src/pages/weddings/WeddingGuest/custom/carla-joel/` for the only existing
example:

1. Create `src/pages/weddings/WeddingGuest/custom/<slug>/<Slug>CustomWedding.tsx`,
   rendering `WeddingGuestPage` with a `renderCustom` prop:
   ```tsx
   export const <Slug>CustomWedding: FC = () => (
     <WeddingGuestPage
       slug="<slug>"
       renderCustom={(ctx) => <<Slug>GuestLayout {...ctx} />}
     />
   );
   ```
2. Build `<Slug>GuestLayout.tsx` using the same `WeddingGuestPageContext`
   (`pageState`, `wedding`, `invitation`, `form`, etc. — see
   `WeddingGuestPage.types.ts`) to render the custom visuals.
3. Wire a literal route in `AppRouter.tsx` **above** the generic
   `/weddings/:slug` route, since React Router matches the first match:
   ```tsx
   <Route path="/weddings/<slug>" element={<<Slug>CustomWedding />} />
   ```
   (There's a commented-out example for `carla-joel` in `AppRouter.tsx` —
   uncomment/adapt that pattern rather than inventing a new one.)

The wedding still needs to exist in the backend (admin panel, as above) —
this only replaces the guest-facing layout, not the data source.

## Style rules

See `.claude/rules/styling.md` for shared rules. Wedding-specific notes:

- Guest/manager components rely mostly on inline styles and the shared
  `@ui` primitives (`SurfaceCard`, `DesktopSplitBackground`, `MobileShell`,
  `MobileSwiper`) rather than per-component `.module.css` files — follow the
  existing pattern in the component you're editing.
- Buttons rely on the global antd `ConfigProvider` theme (pill shape, brand
  primary color) — no `!important`.
- Background: solid page background when no image is configured; blurred
  image (via `DesktopSplitBackground`) when one is.
