# Photo Gallery + Booking + Wedding RSVP

Photography portfolio built with Vite + React + TypeScript + Ant Design + Framer Motion.
It also hosts the session-booking flow (`/book-session`), the signed-contract view
(`/bookings/:token`), the admin panel (`/admin`) and the wedding RSVP pages
(`/weddings/:slug`).

The backend is a separate service, **wedding-manager-api** (ASP.NET Core). This app talks to
it over REST through `src/services/`; there is no Supabase any more.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

`.env` needs a single value, the backend's base URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run

```bash
npm run dev        # against the real API at VITE_API_BASE_URL
npm run dev:mock   # against mock data, no backend needed
```

## Mock mode

`npm run dev:mock` loads `.env.mock` and starts [MSW](https://mswjs.io), which intercepts
every HTTP request in the browser and answers it from `src/mocks/`. No application code is
involved in the switch: `api.client.ts` and the `*.api.ts` modules run exactly as they do
against the real API. Use it to design new pages, or to work on any flow while the backend
is down.

What you get:

- the real session catalog (the 10 types with their prices and features, mirrored from the
  API's seed), so pricing cards look like production;
- a working availability calendar generated relative to today, including the two blocked
  periods from the API's dev seed (`today+3`, and `today+7..+10`) and the "Exterior" types
  that only shoot on Tuesday mornings;
- writes that persist for the life of the tab — create a booking and you can then open it by
  its token, sign the contract, and see it in the admin panel;
- errors in the API's RFC 9457 shape with real `errorCode` values, so the Catalan messages in
  `src/services/error-messages.ts` are actually exercised.

Fixtures worth knowing:

| What | Value |
|---|---|
| Admin login (`#/admin/login`) | any email and password |
| Wedding | `#/weddings/anna-joan` |
| Invite codes | `GARCIA01`, `LOPEZ002` |

Adding an endpoint to `src/services/` means adding a handler in `src/mocks/handlers/`;
`.claude/skills/mock-data.md` describes how.

## Build

```bash
npm run build
```

Output is in `dist`. MSW is behind a dynamic import guarded by `VITE_ENABLE_MSW`, so it is
never part of a production build.
