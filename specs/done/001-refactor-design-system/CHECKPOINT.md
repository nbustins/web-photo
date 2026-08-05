# Checkpoint — 001-refactor-design-system

**Estat:** F0–F4 completes (T0.1 – T4.10), excepte `prefers-reduced-motion` per
component, que queda com a punt obert per decisió de l'usuari.
**Branch:** `feature/booking`, un commit per tasca.

## Fet

| Fase | Estat |
|------|-------|
| F0 — Neteja (T0.1–T0.4) | ✅ |
| F1 — Tokens (T1.1–T1.6) | ✅ |
| F2 — Capes (T2.1–T2.6) | ✅ |
| F3 — Governança (T3.1–T3.4) | ✅ |
| F4 — Migració (T4.1–T4.10) | ✅ (T4.10 sense reduced-motion) |

## Mètriques finals

| Mètrica | Abans | Objectiu | Ara |
|---------|-------|----------|-----|
| Objectes `style={{}}` | 325 | < 40 | **36** |
| `fontFamily` inline | 96 | 0 | **1** (`antd-theme.ts`, la del tema) |
| `!important` | 12 | 0 | **4** (només el bloc `prefers-reduced-motion` de `base.css`) |
| Fonts carregades | 7 (2 sense usar) | 5 | **5**, auto-allotjades |
| Fonts de veritat de breakpoints | 4 | 1 | **1** (`useIsMobile`) |
| ESLint | — | error | **error, 0 errors** |

Els `style={{}}` que queden són tots casos legítims del patró: URLs d'imatge
dinàmiques, `transform` animat, alçades per prop i props de layout d'antd
(`width: '100%'`, `marginBottom`).

## Regressions trobades i corregides durant la revisió

1. **`antd-theme.ts` amb `var(--lt-*)`** (sessió anterior): l'algorisme de color
   d'antd necessita colors parsejables. Només s'hi fixen `colorPrimary`,
   `colorText` i `fontFamily`, que és el que hi havia al `ConfigProvider`
   original.
2. **Playfair Display 800**: en passar de Google Fonts a `@fontsource` es va
   perdre el pes 800 que fa servir `FAQs` (abans venia de la font variable).
3. **Tinta de la signatura**: havia canviat de `#3f3a30` a `#4A4539`. Recuperat
   com a primitiva `ink800`.
4. **"Esborra" desactivat** del `SignaturePad`: havia passat a `text-muted` i
   ja no es llegia com a desactivat. Torna a `#c4c0b4` (WCAG exclou els
   controls desactivats del contrast AA).
5. **Amplada de `BookingViewPage`**: els estats d'error i càrrega havien passat
   de 820 a 900.
6. **Títols d'antd amb classe**: `.title` sol perd el `font-size` contra
   `h3.ant-typography` (0,1,1). Tots els títols estilitzats des d'un
   `.module.css` porten ara l'element davant.

## Canvis deliberats (no són regressions, però es veuen)

- **T1.4**: els 6 colors de text que fallaven AA. Era l'objectiu de la tasca.
- **T2.3**: el breakpoint de `home`, `aboutme` i `promoVideoBackground` passa de
  600px a 768px, unificat a `useIsMobile()`.
- **Capçalera del gestor de bodes**: el títol s'alinea amb el cos de la pàgina
  (abans sobresortia 24px per banda); ara comparteix `@ui/AppBar` amb l'admin.
- **`main.header`**: el logo reserva la seva caixa (`aspect-ratio` 666/375), que
  era la causa del `forceMenuRecalc()`. El remuntatge dels menús desapareix.
- **`prefers-color-scheme: dark`** de la plantilla de Vite: eliminat amb
  `index.css`. Abans, amb el SO en fosc, les zones sense pintar es veien
  `#242424`.

## Verificació feta

Per tasca: `npx tsc -b`, `npm run build`, `npm run lint`, `tools/check-tokens.sh`
i recompte de `style={{` / literals de color al mòdul.

Al final, dues comprovacions automàtiques contra els modes de fallada silenciosos
dels CSS Modules (no peten el build, només deixen d'aplicar estil):

- totes les classes referenciades des d'un `.tsx` existeixen al `.module.css`
  corresponent (seguint `composes` entre fitxers) — **cap error**;
- tot `Typography.Title` amb `font-size` propi porta el selector d'element
  (`h2.x`, `h3.x`) — **cap error**.

## Punts oberts

1. **La QA visual no s'ha executat.** No hi havia extensió de navegador
   disponible. Cal fer-la pàgina per pàgina amb `npm run dev`, especialment:
   contracte (`bookingview`), els 4 passos de reserva, login d'admin i de
   gestor, dashboard de bodes (escriptori i mòbil), i les pàgines de màrqueting.
2. `prefers-reduced-motion` per component (~14 components animats) — no s'ha fet
   per decisió explícita: canvia el comportament real de les animacions.
3. Revisió en dispositiu real del canvi de breakpoint 600px → 768px a `home`,
   `aboutme` i `promoVideoBackground`.
4. Confirmar el menú d'escriptori sense `forceMenuRecalc()`: si els ítems es
   plegaven dins el "…", tornar a posar el remuntatge a `main.header.tsx`.
