# 007 — Admin Weddings Tab

- **Status:** in-progress (implementat 2026-08-05, pendent QA visual)
- **Owner:** Narcís
- **Created:** 2026-08-05
- **Updated:** 2026-08-05

## 1. Context

L'AdminPanel (`src/pages/admin/AdminPanel.tsx`) té 3 tabs: Reserves, Sessions, Horaris. Els casaments es gestionen fora d'aquesta vista: cada wedding manager entra per `/weddings/:slug/manager` i veu el seu dashboard (`WeddingManagerPage`). L'admin no té cap vista unificada dels casaments.

L'API ja ho suporta tot:

- `GET /api/weddings` — `AdminOnly`, retorna `WeddingListDto[]` (`id, slug, title, eventDate, closingDate, createdAt, guestCount`)
- `GET /api/weddings/{id}/confirmations/list` — `Authorize` + `CanAccessWedding` (admin sempre passa: `IsAdmin || WeddingId == weddingId`)

El frontend ja té el client `fetchConfirmations(weddingId)` (`services/wedding/api/confirmations.api.ts`) i els components de dashboard del manager (`ManagerDesktopDashboard`, `ManagerMobileDashboard`, `ManagerInvitationDrawer`, `ManagerNotesModal`) que són purs de props — no depenen d'auth ni de slug.

**Cap canvi d'API necessari.** Feature només frontend.

## 2. Goal

L'admin veu tots els casaments en una tab "Weddings" de l'AdminPanel i, en clicar-ne un, veu el mateix dashboard que veu el wedding manager, reutilitzant els components existents.

## 3. Non-goals

- Crear / editar / esborrar weddings des de l'admin (el `POST /api/weddings` existeix però queda fora)
- Editar confirmacions o invitacions des de la vista admin (mateixa capacitat que el manager: consulta)
- Canvis a la vista del wedding manager per als managers
- Canvis d'API

## 4. User stories

- Com a admin, vull veure la llista de casaments amb les seves dades bàsiques, per tenir visió global sense demanar credencials de manager.
- Com a admin, vull obrir un casament i veure el dashboard de confirmacions (stats, taula, drawer d'invitació, notes), per consultar el mateix que veu el manager.

## 5. Functional requirements

- FR-1: Nova tab "Weddings" a l'AdminPanel, després de les existents.
- FR-2: La tab mostra la llista de weddings (`GET /api/weddings`): títol, data de l'esdeveniment, nº convidats, slug; ordenada per `eventDate` desc.
- FR-3: Clicar un wedding mostra el dashboard de confirmacions d'aquell wedding (stats + taula + drawer + modal de notes), idèntic al del manager.
- FR-4: Des del dashboard es pot tornar a la llista amb un botó "Tornar" (no fa logout de l'admin). El dashboard es renderitza a pantalla completa (tapa AppBar+tabs de l'admin), amb prop `exitLabel`/`onExit` als dashboards.
- FR-5: En mòbil es mostra `ManagerMobileDashboard` (mateix switch `useIsMobile` que `WeddingManagerPage`).
- FR-6: La llista és només consulta: cap acció extra per fila.
- FR-7: Errors d'API es mostren amb el patró existent d'admin (`useApiError`).

## 6. Non-functional requirements

- NFR-1: Estils segons `.claude/skills/design-system.md` — cap literal de color/font, tokens `--lt-*`, grid antd `Row`/`Col`, gutters coherents amb tabs veïnes.
- NFR-2: Reutilització màxima: cap component de dashboard nou; només s'escriu la llista i el "glue".
- NFR-3: Català a tota la UI (com la resta d'admin).

## 7. Data model

Cap entitat nova. Tipus frontend nou:

```ts
// services/wedding/api/admin-wedding.api.ts
export interface AdminWedding {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;   // DateOnly → "YYYY-MM-DD"
  closingDate: string | null;
  createdAt: string;
  guestCount: number;
}
```

`ConfirmationRow`, `ManagerStats`, `InvitationSummary` ja existeixen.

## 8. API surface

Ja existent — només client nou:

| Client | Endpoint | Notes |
|---|---|---|
| `fetchAdminWeddings()` (nou) | `GET /api/weddings` | AdminOnly, JWT admin ja al `api.client` |
| `fetchConfirmations(id)` (existent) | `GET /api/weddings/{id}/confirmations/list` | admin passa `CanAccessWedding` |

## 9. UI / UX

**Fitxers nous:**

- `pages/admin/tabs/WeddingsTab.tsx` — llista + estat de selecció
- `services/wedding/api/admin-wedding.api.ts` — client llista

**Fitxers tocats:**

- `AdminPanel.tsx` — afegir tab
- `WeddingManagerPage.tsx` — extreure `getStats` i `buildSummary` a helper compartit (p. ex. `WeddingManager/manager.utils.ts`) perquè la tab admin els reutilitzi
- `ManagerDesktopDashboard` / `ManagerMobileDashboard` — prop opcional `exitLabel` (default "Tancar sessió"); `onLogout` ja és genèric, es reutilitza com a `onExit`

**Estats:** loading (com `BookingsTab`), empty (`Empty` antd), error (`useApiError`).

**Vista llista:** taula antd (patró `BookingsTab`) amb títol, data, convidats, slug.

**Vista detall:** drilldown inline — estat local `selectedWedding` dins `WeddingsTab`; quan hi ha selecció es renderitza el dashboard a pantalla completa i "Tornar" reseteja l'estat. Cap ruta nova.

## 10. Edge cases

- Wedding sense confirmacions → dashboard amb stats a 0 i `Empty` (ja gestionat pels components).
- `eventDate` null → mostrar "—".
- Token admin expira mentre navega → `useApiError` redirigeix a login (patró existent).
- El dashboard tapa les tabs de l'admin mentre està obert — acceptat (decisió OQ-2): "Tornar" recupera la vista de tabs.

## 11. Acceptance criteria

- [x] Tab "Casaments" visible només a l'AdminPanel (rere `RequireAuth` existent) (FR-1)
- [x] Llista mostra tots els weddings amb títol, data, convidats (FR-2)
- [x] Clic a un wedding → dashboard idèntic al del manager (stats, taula, filtres, drawer, notes) (FR-3)
- [x] "Tornar" torna a la llista sense tancar sessió admin (FR-4)
- [x] Cap literal de color/font nou; ESLint net (NFR-1)
- [x] `ManagerDesktopDashboard`/`Mobile` no dupliquen codi — mateixos components a les dues vistes (NFR-2)
- [ ] QA visual (desktop + mòbil) amb API real

## 12. Open questions

Cap — resoltes 2026-08-05:

- **OQ-1** → drilldown inline (estat local, sense ruta nova)
- **OQ-2** → pantalla completa amb prop `exitLabel`; "Tornar" en context admin
- **OQ-3** → sí, variant mòbil via `useIsMobile` com el manager
- **OQ-4** → només consulta

## 13. Out of scope / future work

- Crear wedding des de l'admin (el `POST` amb Excel ja existeix a l'API)
- Editar invitacions / reenviar codis
- Exportar confirmacions (CSV/Excel)
