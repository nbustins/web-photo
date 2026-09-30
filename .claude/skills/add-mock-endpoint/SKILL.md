---
name: add-mock-endpoint
description: Use when you add a new function to src/services/ and need to add its MSW mock handler, or when npm run dev:mock logs "[MSW] Warning intercepted a request without a matching handler".
---

# Adding a mock endpoint

See `.claude/rules/mocks.md` (auto-loaded when you touch `src/mocks/**` or
`src/services/**`) for how MSW is wired, the API's wire-format rules, and the
seeded fixture data — read it before writing a handler.

## Steps

1. Pick the handler file by area: `src/mocks/handlers/auth.handlers.ts`,
   `booking.handlers.ts` (public), `booking-admin.handlers.ts`, or
   `wedding.handlers.ts`.
2. Register the path with the `api()` helper — MSW matches absolute URLs,
   and `api()` prefixes `VITE_API_BASE_URL` for you.
3. Read and write `db` from `src/mocks/mock.db.ts` rather than returning a
   constant, so a page that writes and then reads back behaves like the real
   thing.
4. `await delay()` first, so loading states stay visible.

```ts
http.get(api('/api/admin/things/:id'), async ({ params }) => {
  await delay();
  const thing = db.things.find(t => t.id === Number(params.id));
  if (!thing) return problem(404, 'THING_NOT_FOUND', "No s'ha trobat.");
  return HttpResponse.json(thing);
}),
```

5. Order matters inside a handler array: MSW matches in sequence, so a
   literal path has to be registered before a pattern that would swallow it
   (`/api/bookings/availability` before `/api/bookings/:token`).
6. Match the API's real wire format (camelCase, exact enum names, date
   formats, RFC 9457 errors, non-200 status codes) — see
   `.claude/rules/mocks.md` for the full list; getting this wrong produces a
   mock that works and a production page that doesn't.
7. New handlers must be collected into `src/mocks/handlers.ts` to take
   effect.
