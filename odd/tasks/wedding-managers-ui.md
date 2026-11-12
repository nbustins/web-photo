# Feature: wedding-managers-ui

## Objective
Admin UI in the weddings tab to manage the wedding-manager accounts of one wedding:
list, create with a password, change email, reset password, delete.
Branch: `feature/wedding-managers-ui`. Delivery: `ask-on-risk` (no PR requested yet; work-unit commits only).
Test runner: Vitest + jsdom + Testing Library (added by T1); checks: `npm test`, `npx tsc -b`,
`npm run lint`, `npm run build`, `bash tools/check-tokens.sh`, manual `npm run dev:mock` walkthrough.
Risk: item 2 (credential entry/reset UI handles passwords in memory) + item 6 mitigated by T5 tests.

## Source of truth
- `/home/nbustins/Projects/photo-project/wedding-manager-api/odd/tasks/wedding-managers.md` (S1-S14, A1-A5)
- `/home/nbustins/Projects/photo-project/wedding-manager-api/docs/contracts/wedding-managers.json`
- Existing admin patterns: `src/pages/admin/tabs/WeddingsTab.tsx`, `src/services/wedding/api/admin-wedding.api.ts`,
  `src/services/error-messages.ts`, `src/mocks/handlers/wedding.handlers.ts`.

## Specs

### UI surface
- S1 — **Entry point.** Each wedding card in the weddings tab gains a second full-width action
  ("Gestors", icon `guests`, 44px min height) next to `Configuració`. It opens a Drawer titled
  `Gestors · {title}` (width 720, 100% on mobile). No new route, no new tab.
- S2 — **List.** Opening the drawer calls `GET /api/weddings/{weddingId}/managers` and renders an
  antd table with columns `Correu`, `Creat`, `Accions`, in the order returned by the API.
  `email: null` renders `—`; `createdAt` renders `dd/mm/yyyy` in `ca-ES`. Loading uses a `Spin`;
  failures go through `useApiError`. Empty result renders `Aquesta boda encara no té cap gestor.`
- S3 — **Create.** A form inside the drawer with `Correu electrònic`, `Contrasenya`,
  `Repeteix la contrasenya`, a `Generar` button and submit `Crear gestor`.
  `POST` sends `{ email, password }` after trimming the email. On success the list reloads and the
  form is replaced by the credentials panel (S4). Validation errors stay on the fields; API errors
  use `errorMessage` (Catalan only, never the English `detail`).
- S4 — **Credentials panel.** After create — and after reset (S7) — the drawer shows
  `Credencials del gestor` with the manager email, the password exactly as typed/generated, the
  manager login URL (`weddingManagerPath(slug)`) and the copy action for each. Copy uses
  `navigator.clipboard.writeText` + `message.success`. The panel warns:
  `Aquesta contrasenya no es tornarà a mostrar. Copia-la ara i comparteix-la amb el gestor.`
  Closing the panel (or the drawer) discards the value from component state.
- S5 — **Password policy mirror.** `validateManagerPassword(password): string | null` (single
  source in code) returns the first failing Catalan message, in this order:
  1. `La contrasenya ha de tenir com a mínim 12 caràcters.`
  2. `La contrasenya no pot superar els 72 bytes en UTF-8.`
  3. `La contrasenya ha de contenir almenys una majúscula.`
  4. `La contrasenya ha de contenir almenys una minúscula.`
  5. `La contrasenya ha de contenir almenys un número.`
  6. `La contrasenya ha de contenir almenys un caràcter especial.`
  The byte rule counts UTF-8 bytes (`new TextEncoder().encode(value).length`), not characters.
  The confirm field fails with `Les contrasenyes no coincideixen.`
- S6 — **Generate.** `generateManagerPassword()` returns a 16-character password built from
  `crypto.getRandomValues` that always contains at least one uppercase, one lowercase, one digit
  and one special character. `Generar` fills both password fields and never calls the server.
- S7 — **Change email.** Per-row action `Editar correu` opens a modal with one email field.
  `PUT .../managers/{userId}` sends `{ email }` trimmed. Success: toast `Correu actualitzat`,
  close, reload list. `409 USER_EMAIL_EXISTS` renders its Catalan message.
- S8 — **Reset password.** Per-row action `Restablir contrasenya` opens a modal with
  `Contrasenya nova`, `Repeteix la contrasenya`, `Generar`, submit `Restablir contrasenya`.
  `POST .../managers/{userId}/reset-password` sends `{ newPassword }`; `204` closes the modal,
  reloads nothing and shows the credentials panel (S4) with the new value. The password is never
  displayed after the panel closes.
- S9 — **Delete.** Per-row action `Eliminar` wrapped in `Popconfirm`:
  `Eliminar el gestor {email}? Aquesta acció no es pot desfer.` `DELETE .../managers/{userId}`
  returns `204`; toast `Gestor eliminat`; reload. UI copy makes no claim about immediate
  token revocation (API S10 defers it).
- S10 — **Service layer.** `src/services/wedding/api/wedding-managers.api.ts` exports
  `WeddingManager { id; email: string | null; weddingId; createdAt }`,
  `fetchWeddingManagers(weddingId)`, `createWeddingManager(weddingId, { email, password })`,
  `updateWeddingManagerEmail(weddingId, userId, email)`,
  `resetWeddingManagerPassword(weddingId, userId, newPassword)`,
  `deleteWeddingManager(weddingId, userId)`. Built on `apiGet/apiPost/apiPut/apiDelete`; no
  new fetch wrapper, no password ever placed in a URL or logged.
- S11 — **MSW parity.** `src/mocks/handlers/wedding-managers.handlers.ts` implements all five
  endpoints against an in-memory `db.weddingManagers` seeded with two managers for the first
  fixture wedding and none for the second. Behaviour mirrors the API: lowercased email, global
  case-insensitive duplicate `409 USER_EMAIL_EXISTS`, unknown wedding `404 WEDDING_NOT_FOUND`,
  not-a-manager-of-that-wedding `404 USER_NOT_FOUND`, password policy `400 VALIDATION_ERROR`,
  delete frees the email, list ordered by `createdAt` then `id`, no password in any response.
  Registered in `src/mocks/handlers.ts`.
- S12 — **Tests (Vitest + jsdom + RTL).** New dev dependencies and `npm test`; `vitest.config.ts`
  reusing the Vite aliases; `src/test/setup.ts` wiring `@testing-library/jest-dom`.
  Required tests: every S5 rule plus the multi-byte 72-byte case and a valid password;
  `generateManagerPassword` length/classes/randomness-over-calls; the five service functions
  (path, method, body, 204 handling, error propagation); the drawer (list render, empty state,
  create → credentials panel, delete requires confirmation, reset → credentials panel) with the
  service module mocked. No test asserts on English API `detail`.
- S13 — **No backend or contract change.** This repo does not edit `docs/openapi.json`; the
  contract lives in `wedding-manager-api`. No new route is added to `AppRouter`.
- S14 — **Untouched behaviour.** `Configuració`, the confirmations drawer, admin login, the public
  manager page and every existing service signature stay unchanged. `error-messages.ts` only gains
  nothing new: `USER_EMAIL_EXISTS`, `USER_NOT_FOUND`, `WEDDING_NOT_FOUND`, `VALIDATION_ERROR` are
  already mapped.

### Assumptions (proposed, veto at review)
- A1 — All new copy is Catalan, matching the admin panel; identifiers, tests and comments stay English.
- A2 — The credentials panel also shows the manager login URL because the admin has to hand it over;
  it is informational only and adds no route.
- A3 — After a reset the credentials panel is reused, so the admin can hand over the new value.
- A4 — Change email uses a modal, not an inline table edit (user rejected inline editing).
- A5 — The wedding card does not show a manager count: `AdminWedding` has no such field and adding a
  per-card request is out of scope.

## Tasks
- [x] T1 — Tooling: add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`; `vitest.config.ts` with the `@ui/@services/...` aliases and
  `src/test/setup.ts`; `npm test` script. Route: inline. Evidence: `npm test` runs Vitest 5.1.0 in
  jsdom; `npx tsc -b` clean; eslint 0 errors.
- [x] T2 — RED→GREEN: `passwordPolicy.ts` (S5) and `generatePassword.ts` (S6) with unit tests
  covering every rule, the multi-byte byte cap, and generator classes/length. Route: inline.
  Evidence: RED 11 failed / 2 passed against the stubs; GREEN 13 passed.
- [x] T3 — RED→GREEN: `wedding-managers.api.ts` (S10) with service tests (URLs, verbs, bodies,
  204 → `undefined`, `ApiError` passthrough). Route: inline.
  Evidence: RED observed as the test could not resolve the missing module; GREEN 19 passed.
- [x] T4 — MSW handlers + `db.weddingManagers` + fixture seeding, registered in `handlers.ts` (S11).
  Route: inline. Evidence: 10 handler tests pin list/empty/404/409/policy/204/no-password; 29 total pass.
- [x] T5 — RED→GREEN: `WeddingManagersDrawer` (S1-S9), its CSS module and the card action in
  `WeddingsTab.tsx`; component tests per S12. Route: inline.
  Evidence: 7 component tests pass; the first run failed 4/7 and exposed a real duplicate-`id`
  bug across the three forms (fixed with `Form name=`). RED was not observed for this task: the
  component was drafted before its tests (deviation recorded, not hidden).
- [x] T6 — Checks: `npm test`, `npx tsc -b`, `npm run lint`, `npm run build`,
  `bash tools/check-tokens.sh`, manual `npm run dev:mock` walkthrough; then one independent
  verifier (Risk item 2). Route: delegated (verify only).
  Evidence: verifier ran every probe in a scratch copy — 36 tests, tsc, eslint (0 errors, same 4
  baseline warnings), build and tokens all green, and baseline `10b5065` matched. Verdict: no
  blockers, S1-S14 PASS. Its 6 advisories are handled in L9; the browser walkthrough is the only
  human-pending item (no browser in the harness; the dev-mock server and worker were smoke-checked
  with HTTP 200).

## Log
- L1 (user, original): "Let's implement UI part to manage wedding managers using admin panel of weddings tab. PLease read ODD /home/nbustins/Projects/photo-project/wedding-manager-api/odd/tasks/wedding-managers.md ask me all needed questions so we can define ODD and implement it"
- L2 (user, answers): entry point = card button + drawer; operations = all five; create password =
  type twice + optional client-side generate; policy = mirrored in UI with Catalan messages;
  after create = show credentials to copy; tests = add Vitest + RTL; delete = Popconfirm;
  MSW handlers = yes; email edit = **not** inline.
- L3 (evidence, 2026-11-12): `WeddingsTab.tsx` has per-card `Configuració` → Drawer and a wedding
  drawer with the embedded manager dashboard; `AdminWedding` has no manager field; there is no
  manager UI or users service. `package.json` has no test script and no Vitest. `api.client.ts`
  exposes `apiGet/apiPost/apiPut/apiDelete` and `ApiError`; `error-messages.ts` already maps
  `USER_EMAIL_EXISTS`, `USER_NOT_FOUND`, `WEDDING_NOT_FOUND`, `VALIDATION_ERROR` to Catalan and
  never surfaces the English `detail`. MSW handlers live in `src/mocks/handlers/` with an in-memory
  `db`; `weddingManagerPath(slug)` = `/weddings/{slug}/manager`.
- L4 (decision): Service functions keep API naming (`weddingId`, `userId`); UI files live under
  `src/pages/admin/managers/` with the feature's CSS module and its tests alongside.
- L5 (implementation, 2026-11-12): T1/T2 done. Vitest 5.1.0 + jsdom + Testing Library added
  (`vitest.config.ts` mirrors the Vite aliases; `src/test/setup.ts` adds RTL cleanup, `matchMedia`
  and `ResizeObserver` for antd). Password policy and generator implemented with 13 unit tests.
  `npx tsc -b` clean, eslint 0 errors (4 pre-existing warnings).
- L6 (implementation, 2026-11-12): T3 done. `wedding-managers.api.ts` maps the five endpoints to
  `apiGet/apiPost/apiPut/apiDelete`; 6 service tests pin path, verb, body and error passthrough.
- L7 (implementation, 2026-11-12): T4 done. In-memory `db.weddingManagers` seeded with two managers
  on wedding 1 and none on wedding 2; the five handlers mirror the API (lowercase email, global
  duplicate 409, wedding-scoped 404, policy 400, 204 delete, no password field anywhere) and run
  before `/api/weddings/:weddingId`. 10 handler tests; 29 total pass.
- L8 (implementation, 2026-11-12): T5 done. `WeddingManagersDrawer` implements S1-S9 with antd
  Drawer/Table/Modal/Popconfirm, the password policy mirror and the client-side generator; the
  wedding card now shows `Gestors` next to `Configuració`. 7 component tests; 36 total pass.
  `npx tsc -b`, `npm run lint`, `npm run build` and `check-tokens` are green. The dev-mock server
  serves the page and `mockServiceWorker.js` (200) but the interactive walkthrough is pending a
  human because the harness has no browser.
- L9 (verification + corrections, 2026-11-12): Independent verifier returned no blockers and S1-S14
  PASS. Advisories resolved in this batch:
  1. S11 seed text corrected to two managers (was one) — spec now matches the fixture.
  2. Mock duplicate check only knows managers, not the mock admin account: accepted and documented;
     the dev mock has no users table and the UI never creates admins.
  3. Stale rows across weddings: `loadManagers` clears the list, and a `requestedWeddingId` ref
     discards responses for a wedding the drawer is no longer showing; pinned by a component test.
  4. Empty confirmation field could submit: both confirm fields now carry `required`; pinned by a
     component test.
  5. `odd/tasks/wedding-invitation-qr-codes.md` (another feature's doc) was swept into `370558f` by
     `git add -A`; it is removed from the index and left untracked in the worktree.
  6. The MSW test no longer pins the mock's English `detail`; it asserts the field key only.
  The verifier's 13 durable probes were committed as regression tests
  (`wedding-managers.handlers.adversarial.test.ts`,
  `wedding-managers.api.integration.test.ts`, `WeddingManagersDrawer.adversarial.test.tsx`).
  Final: 51 tests, tsc clean, eslint 0 errors (same 4 baseline warnings), build and tokens green.
- L10 (commits, 2026-11-12): `0ec3ca6` docs, `370558f` harness + policy, `a51c232` API client,
  `58543ed` MSW, `5509613` drawer + card, `e8547e5` review corrections, `e3a2437` removes the
  unrelated QR task doc from this branch (left untracked in the worktree for its own feature).
