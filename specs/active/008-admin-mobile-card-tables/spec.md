# 008 — Vista card mòbil per a les taules de l'AdminPanel

- **Status:** in-progress (implementat 2026-08-05, pendent QA visual)
- **Owner:** Narcís
- **Created:** 2026-08-05
- **Updated:** 2026-08-05

## 1. Context

Les 4 tabs de l'AdminPanel (Reserves, Sessions, Horaris, Casaments) usen antd `Table`. En mòbil les taules són més amples que el viewport; l'arreglo actual és scroll horitzontal (`overflow-x: auto` a `AdminPanel.module.css`), funcional però UX pobre: la informació queda amagada fora de pantalla.

El projecte ja té el patró de referència: `ManagerMobileDashboard` (llista vertical de cards + `useIsMobile`). El hook `useIsMobile` (`@ui/hooks`) és la font única de veritat per "és mòbil" (breakpoint `md` de tokens).

Inventari de taules afectades:

| Tab | Columnes | Particularitats |
|---|---|---|
| BookingsTab | Data, Sessió, Reserva, Estat, Contracte | clic fila → drawer; paginació default |
| SessionsTab (per grup) | Nom, Durada, Preu, Features, Publicat, Marge, Temporada, accions | botons editar/retirar; `pagination={false}` |
| ScheduleTab (bloquejos) | Des de, Fins a, Motiu, acció | botó desbloquejar; `pagination={false}` |
| WeddingsTab | Casament, Data, Tancament, Convidats, Enllaç web | clic fila → detall; `pagination={false}` |

## 2. Goal

En mòbil, cada taula de l'admin es renderitza com a llista vertical de cards (una card ≈ una pantalla d'ample), generada automàticament de la mateixa definició de columnes; desktop no canvia gens.

## 3. Non-goals

- Tocar la vista desktop (taules antd tal qual)
- Vista mòbil del `ManagerDesktopDashboard` (el manager ja té `ManagerMobileDashboard`)
- Vistes mòbils fetes a mà per tab (només si algun dia una tab necessita UX específica)
- Filtres/sorting de columna antd en mode card

## 4. User stories

- Com a admin al mòbil, vull veure cada reserva/sessió/casament com una card vertical llegible, sense scroll horitzontal.
- Com a admin al mòbil, vull mantenir les mateixes accions (obrir drawer, editar, retirar, desbloquejar) des de la card.

## 5. Functional requirements

- FR-1: Component genèric `ResponsiveTable<T>` a `src/ui/` amb la mateixa API que antd `Table` (props pass-through): desktop → `<Table>`, mòbil (via `useIsMobile`) → llista de cards.
- FR-2: Cards generades de `columns`: `title` de columna → etiqueta; `render`/`dataIndex` → valor. Sense codi nou per tab.
- FR-3: Extensions opcionals per columna: `mobileTitle` (fa de títol de card; default: primera columna amb títol) i `mobileHidden` (no surt a la card).
- FR-4: Columnes sense `title` (accions) es rendericen al peu de la card, sense etiqueta.
- FR-5: `onRow.onClick` → card clicable (drawer de reserves, detall de casament).
- FR-6: Estats loading (`Spin`) i empty (`locale.emptyText` o `Empty` default) equivalents als de la taula.
- FR-7: Les 4 tabs substitueixen `<Table>` per `<ResponsiveTable>`; cap altre canvi de lògica.
- FR-8: En mòbil no hi ha paginació: llista completa amb scroll vertical (la taula desktop conserva la seva).
- FR-9: En mòbil es mostren totes les columnes; `mobileHidden` queda disponible per afinar més endavant.

## 6. Non-functional requirements

- NFR-1: Estils amb tokens (`--lt-space-*`, `--lt-radius-*`, `--lt-shadow-*`, famílies `--lt-font-*`); cap literal.
- NFR-2: Desktop bit-a-bit igual: `ResponsiveTable` en desktop delega 100% a antd `Table`.
- NFR-3: Breakpoint únic: `useIsMobile` (cap `matchMedia` nou).

## 7. Data model

Cap. Tipus nou:

```ts
export type ResponsiveColumns<T> = (ColumnType<T> & {
  mobileTitle?: boolean;
  mobileHidden?: boolean;
})[];
```

## 8. API surface

Cap canvi d'API ni de clients.

## 9. UI / UX

**Nou:** `src/ui/ResponsiveTable.tsx` + `ResponsiveTable.module.css`.

**Card (mòbil):** flex column, ample complet, gap `--lt-space-3`; capçalera = valor de la columna `mobileTitle` (tipografia `--lt-font-display`); cos = files etiqueta–valor (etiqueta muted esquerra, valor dreta); peu = columnes d'acció. Card clicable si la taula tenia `onRow.onClick`.

**Tocats:** `BookingsTab`, `SessionsTab`, `ScheduleTab`, `WeddingsTab` — swap `Table` → `ResponsiveTable` + marcar `mobileTitle` (Reserva / Nom / Des de / Casament).

## 10. Edge cases

- `dataIndex` absent amb `render` (columnes calculades: Marge, Temporada) → es passa el `record` sencer al `render`, com fa antd.
- Botons dins card clicable (no és el cas ara: les tabs amb accions no tenen `onRow`) — si mai coincideixen, `stopPropagation` al peu d'accions.
- Llista buida amb filtres actius (Reserves) → mateix `Empty` que la taula.
- Rotació mòbil→desktop: `useIsMobile` re-renderitza a taula automàticament.

## 11. Acceptance criteria

- [x] Desktop: cap canvi visual ni funcional a les 4 tabs (NFR-2)
- [x] Mòbil: les 4 tabs mostren cards verticals sense scroll horitzontal (FR-1/2/7)
- [x] Clic a card de reserva obre el drawer; clic a card de casament obre el detall (FR-5)
- [x] Editar/retirar sessió i desbloquejar dia funcionen des de la card (FR-4)
- [x] Loading i empty visibles en mode card (FR-6)
- [x] Cap literal de color/font; ESLint net (NFR-1)
- [ ] QA visual mòbil (les 4 tabs) + desktop sense regressió

## 12. Open questions

Cap — resoltes 2026-08-05:

- **OQ-1** → sense paginació a mòbil, scroll vertical complet
- **OQ-2** → totes les columnes visibles; `mobileHidden` per al futur

## 13. Out of scope / future work

- Cerca/filtre text estil `ManagerMobileDashboard` a les tabs admin
- Virtualització si alguna llista creix molt
