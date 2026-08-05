# Skill: Shared Components Reference

Reference this when building pages to know which components already exist and
how to use them, abans de crear-ne un de nou o de dur-lo cap dins d'un mòdul.

**Import paths:** tots els components de `src/components/` (capa 2, blocs
editorials de marketing) s'importen des del barril:

```typescript
import { CustomTitle, PricingCard, FAQs, ImageSlider, /* … */ } from "@components";
```

Mai per ruta de fitxer directa (`@components/customTitle`) — regla forçada per
ESLint (`no-restricted-imports`). Si un component encara no és a
`src/components/index.ts`, afegeix-l'hi en lloc d'importar-lo per ruta.

Aquest document no conté valors de disseny (colors, mides, escala tipogràfica)
— per a això, `.claude/skills/design-system.md` i `src/styles/tokens.ts`.

Per entendre **quan** crear un component nou i a quina capa va,
`.claude/skills/styling-guide.md` §2.

---

## CustomTitle

Capçalera de pàgina animada amb una etiqueta petita sobre el títol principal.

```typescript
import { CustomTitle } from "@components";

<CustomTitle label="sessió de" title="Embaràs" />
```

- Usat a la part superior de cada pàgina de sessió.

---

## ThreePhotoRow

Tres fotos esglaonades en fila amb animació d'aparició en scroll.

```typescript
import { ThreePhotoRow } from "@components";

<ThreePhotoRow
  photoPaths={[
    getPublicPath("session/2.jpg"),
    getPublicPath("session/3.jpg"),
    getPublicPath("session/4.jpg"),
  ]}
  rowClassName={blocks.sectionRow}
/>
```

- El prop és `photoPaths` (tupla de 3), **no** `photos`.
- `rowClassName` és opcional: normalment `blocks.sectionRow` de
  `@components/blocks.module.css`, o `sectionRowLoose` si la pàgina vol més aire.
- La foto central és més gran que les laterals.
- S'apila a amplada completa en mòbil.
- Relació d'aspecte retrat forçada per foto.

---

## PricingCard

Targeta de tarifa amb llista de característiques i botó de reserva.

```typescript
import { PricingCard } from "@components";

<PricingCard
  title="Bàsica"
  features={["10 fotos editades", "2 hores de sessió"]}
  price={250}
  adviceText="Preus orientatius"
  sessionTypeId={sessionType.id}
/>
```

- `price` és un **número**, no una cadena: el component el formata amb
  `Intl.NumberFormat('ca-ES')` en euros. No hi posis el símbol.
- `adviceText` és opcional; l'asterisc el posa el component, no l'escriguis.
- El prop és `sessionTypeId` (numèric, opcional) — **no** `onBook`. Amb
  `sessionTypeId`, el botó navega directament al pas de reserva d'aquell
  tipus de sessió; sense ell, cau a la ruta genèrica de reserva.
- Botó "Reserva" alineat a baix independentment de l'alçada del contingut.
- `features` accepta strings o elements JSX.
- Fer servir dins `<Col xs={24} md={8}>` per a 3 columnes o `md={12}` per a 2.

---

## ImageSlider (carrousel)

Carrusel d'imatges que rota automàticament.

```typescript
import { ImageSlider } from "@components";

const images = Array.from({ length: 12 }, (_, i) =>
  getPublicPath(`session/${i + 1}.jpg`)
);

<ImageSlider images={images} />
```

- Nombre d'imatges visibles depèn de `useIsMobile()` (1 en mòbil, més en
  escriptori) — no d'un `matchMedia` propi.
- Relació d'aspecte retrat per imatge.

---

## FAQs

Secció de dues columnes: imatge a l'esquerra, llista de preguntes/respostes a
la dreta.

```typescript
import { FAQs } from "@components";

<FAQs
  imageSrc={getPublicPath("session/faq.jpg")}
  faqs={[
    { title: "Quan és el millor moment?", text: "Entre les 28 i 34 setmanes." },
    { title: "Quant dura la sessió?", text: "Aproximadament 2 hores." },
  ]}
/>
```

- El prop és `imageSrc` — **no** `image`.
- `faqs`: array de `{ title: string, text: ReactNode }` — el text sol ser JSX
  (`<p>…</p>`), no una cadena.
- `imageWidth` opcional (per defecte `"100%"`), útil per acotar la foto.
- Fons de secció a amplada completa.

---

## WhyDoSession

Secció fosca a amplada completa amb un títol gran d'estil manuscrit, text
descriptiu i una imatge a sota.

```typescript
import { WhyDoSession } from "@components";

<WhyDoSession
  textWhyDoThisSession={<p>El text descriptiu, com a JSX.</p>}
/>
```

- Únic prop: `textWhyDoThisSession` (`ReactNode`). **No** accepta `heading`,
  `text` ni `image`.
- ⚠️ El titular ("Per què recomano fer la sessió d'embaràs?") i la imatge estan
  **hardcodejats** dins el component. Només serveix per a la pàgina d'embaràs
  tal com està; per fer-lo servir en una altra sessió cal parametritzar-lo abans.

---

## ImageBackground

Secció d'imatge de fons a amplada completa.

```typescript
import { ImageBackground } from "@components";

<ImageBackground
  height="80vh"
  imageUrl={getPublicPath("session/hero.jpg")}
/>
```

- Útil per a seccions hero sense una etiqueta `<img>`.

---

## AdviceText

Text d'avís petit i en cursiva.

```typescript
import { AdviceText } from "@components";

<AdviceText>* Preus orientatius, consulta disponibilitat.</AdviceText>
```

- El contingut va com a **children**, no com a prop `text`.
- Dins d'una `PricingCard`, l'asterisc el posa la targeta: passa-hi
  `adviceText` i no facis servir `AdviceText` directament.

---

## Utility: getPublicPath

Fes-lo servir sempre per a paths d'imatge — anteposa el `BASE_URL` de Vite.

```typescript
import { getPublicPath } from "@utils/pathUtils";

const src = getPublicPath("newborn/1.jpg");
```

---

## Utility: ScrollToTop

Ja aplicat globalment a `AppRouter.tsx`. No l'afegeixis a pàgines individuals.

---

## Primitives de `@ui` (capa 1, sense domini)

No específiques de marketing però reutilitzades arreu — vegeu
`.claude/skills/design-system.md` per a la regla de capes:

- `SurfaceCard`, `SurfaceCardHeader` — targeta de vidre amb capçalera (abans
  `GlassCard`/`WeddingCard`).
- `StatusCard` — resultat amb icona rodona i títol; `tone="success|error|info"`.
  Reserves i confirmació de bodes.
- `AppBar` — capçalera fosca enganxada a dalt de les zones d'aplicació (panell
  d'admin, gestor de bodes); accions a la dreta via `actions`.
- `MobileShell`, `MobileSwiper`, `DesktopSplitBackground` — layout de
  login/formularis amb imatge.
- `LoginCard` — formulari de login complet (admin, gestor de boda).
- `useIsMobile` — únic hook de breakpoint.

Fulls compartits (no components), per fer-hi `composes` des d'un `.module.css`
amb **path relatiu** (l'àlies `@ui` no funciona dins `composes`):

- `@ui/text.module.css` — `.body`, `.caption`.
- `@ui/formStyles.module.css` — `.label`, `.input`.
- `@ui/pageContainer.module.css` — `.page` (820), `.pageWide` (1200, sota
  `AppBar`), `.splitScreen` + `.splitPanel` (pantalla amb fons partit).
