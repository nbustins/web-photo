# Com funciona el sistema d'estils

Guia de lectura per entendre, de dalt a baix, com es centralitzen els estils
en aquest projecte: d'on surt un color, com arriba a un botó d'Ant Design, i
per què un `.module.css` guanya a l'estil per defecte d'antd sense escriure
`!important` enlloc.

Pensada per llegir-se seguida una vegada, no com a referència ràpida. Per a
consulta del dia a dia (regles, sense narrativa) hi ha els documents a
`.claude/skills/`, enllaçats a la secció 11.

---

## 0. Panorama general

```
src/styles/tokens.ts   ← ÚNICA autoria dels valors (colors, mides, fonts...)
        │
        ├──► src/styles/tokens.css        --lt-* custom properties
        │           │                     (dupl. a mà, vigilat per tools/check-tokens.sh)
        │           ▼
        │    src/styles/base.css          @import tokens.css + fonts + reset
        │           │
        │           ▼ (importat 1 sola vegada)
        │    src/main.tsx
        │           │
        │           ▼
        │    *.module.css de tot `src/`   consumeixen var(--lt-*)
        │
        └──► src/styles/antd-theme.ts     ThemeConfig d'antd (valors directes,
                    │                      NO var(--lt-*) — secció 4)
                    ▼
             <ConfigProvider> a src/App.tsx
                    │
                    ▼
             tots els components <Button>, <Input>, <Typography>... d'antd
```

Un sol fitxer, `tokens.ts`, alimenta dos camins independents: el CSS de l'app
(via `tokens.css`) i el tema intern d'antd (via `antd-theme.ts`). Els dos
camins no es toquen entre ells — per això un color de marca es veu igual a un
`<button>` propi i a un `<Button type="primary">` d'antd, tot i que arriben
per rutes diferents.

---

## 1. Els valors: `src/styles/tokens.ts`

Aquest fitxer és **l'única autoria** dels valors del sistema de disseny. Tot
el que ve després (CSS, tema d'antd) és una còpia o una lectura d'aquí, mai
un lloc nou on definir un valor.

```typescript
// src/styles/tokens.ts
export const primitives = {
  olive700: '#5C5440',
  olive500: '#7C7458',
  // ...
} as const;

export const semantic = {
  colorBrand: primitives.olive500,
  colorBrandStrong: primitives.olive700,
  // ...
} as const;
```

Categories que hi ha (totes `as const`, tipades):

| Export | Conté |
|---|---|
| `primitives` | paleta crua: olives, sand, ink, grey, warm, paper, cream, success/danger |
| `semantic` | color amb significat (`colorBrand`, `colorTextSecondary`...) — sempre derivat d'una primitiva |
| `space` / `spaceAlias` | escala 4-16px, i àlies amb nom (`page`, `gutter`, `section`, `stack`) |
| `radius` | `xs` fins `pill` (999px) |
| `shadow` | `sm/md/lg/sheet` (les de marca porten tint oliva, no negre pur) |
| `container` | 4 amplades màximes (`form` 520px, `text` 820px, `page` 1200px, `wide` 1500px) |
| `motion` | durades i corba d'easing |
| `font` | 4 famílies amb la pila de fallback sencera |
| `textScale` | 7 mides fluides (`clamp()`) |
| `breakpoint` | els 6 breakpoints d'antd, en px |

Per què només aquí: un color escrit dues vegades (un `.tsx` i un `.css`, per
exemple) és un bug futur garantit — algú en canviarà un i no l'altre. Aquesta
regla la força ESLint (`no-restricted-syntax` a `eslint.config.js`): cap
`#hex`, `rgb()` o `fontFamily` literal fora de `tokens.ts` o d'un
`.module.css` amb justificació d'un sol ús (secció 8).

---

## 2. El mirall CSS: `tokens.css`

`src/styles/tokens.css` **duplica a mà** els mateixos valors com a custom
properties, totes prefixades `--lt-*`:

```css
/* src/styles/tokens.css */
:root {
  --lt-olive-500: #7C7458;
  --lt-color-brand: var(--lt-olive-500);
  --lt-space-6: 24px;
  --lt-space-page: var(--lt-space-6);
  /* ... */
}
```

**Per què hi ha dos fitxers de tokens i no un de sol.** Cada un serveix un
consumidor diferent que no pot llegir l'altre format directament:

- `tokens.ts` el llegeix **codi TypeScript** — sobretot `antd-theme.ts`
  (secció 4), que necessita valors JS reals (`'#7C7458'`, `40`) perquè
  l'algorisme de color d'antd els pugui parsejar. Una referència CSS
  (`var(--lt-color-brand)`) no li serveix.
- `tokens.css` el llegeixen els **`.module.css`** de tot `src/`, via
  `var(--lt-*)`. TypeScript no pot definir una custom property CSS.

No hi ha cap pont natiu de l'un a l'altre sense afegir eina — TS no genera
CSS sol, i CSS no es pot importar com a valors JS. Per això existeixen tots
dos, i és **l'única duplicació acceptada** al projecte. Es manté a mà (no
generada per script ni pas de build) perquè és un equip petit (~60 tokens);
en compensació està vigilada: `tools/check-tokens.sh` (que crida
`tools/check-tokens.cjs`) compara els *noms* de `tokens.ts` i `tokens.css` i
falla si divergeixen. No compara valors — mantenir-los idèntics és
responsabilitat de qui edita, però un nom oblidat (afegit a un fitxer i no a
l'altre) es detecta sol.

*(`ponytail:` sync manual entre 2 fitxers — generar `tokens.css` des de `tokens.ts` amb script si els tokens creixen molt, >150, o l'equip creix.)*

---

## 3. La base global: `base.css` i `main.tsx`

`src/styles/base.css` és l'únic full d'estils que s'importa globalment, i
només **una vegada**, a `src/main.tsx:3`:

```typescript
// src/main.tsx
import './styles/base.css'
```

Dins de `base.css`:

1. `@import './tokens.css'` — primera línia, perquè tota la resta del
   fitxer i tot `src/` puguin fer servir `var(--lt-*)`.
2. Imports de **`@fontsource`** (fonts autoallotjades, no un `<link>` a
   Google Fonts): `italiana/400`, `raleway/300..600`, `playfair-display`
   (regular/italic/700/800), `indie-flower/400`. Si mai cal un pes nou d'una
   família, s'afegeix aquí.
3. Reset mínim: `box-sizing: border-box` universal, marges/padding a zero a
   `html/body/#root`, `overflow-x: hidden`.
4. Ajustos de renderització de text (`font-synthesis: none` perquè Italiana
   només té pes 400 i el navegador no en sintetitzi una negreta falsa;
   antialiasing).
5. `:focus-visible` global amb `var(--lt-color-focus-ring)`.
6. Un parell d'overrides puntuals d'antd, documentats amb comentari (per
   exemple el radi del botó dins `Space.Compact`, veure secció 4).
7. Bloc `@media (prefers-reduced-motion: reduce)` que talla totes les
   animacions CSS a 0.01ms — **només** les animacions CSS; les de Framer
   Motion (secció 6/skills) s'han de comprovar component a component amb
   `useReducedMotion`.

No hi ha cap altre `.css` global al projecte: tota la resta és `*.module.css`
amb àmbit de component (secció 7).

---

## 4. El tema d'Ant Design: `antd-theme.ts` + `ConfigProvider`

```typescript
// src/App.tsx
import { antdTheme } from './styles/antd-theme';

<ConfigProvider theme={antdTheme} locale={caES}>
  <AppRouter />
</ConfigProvider>
```

`antd-theme.ts` construeix un `ThemeConfig` (antd v5, sistema de tokens, no
`.less`/`modifyVars` de v4) a partir dels mateixos `tokens.ts`:

```typescript
// src/styles/antd-theme.ts
export const antdTheme: ThemeConfig = {
  cssVar: true,
  hashed: false,
  token: {
    colorPrimary: semantic.colorBrand,
    colorText: '#333333',
    fontFamily: font.body,
    screenXS: breakpoint.xs, /* ...fins screenXXL */
  },
  components: {
    Button: {
      paddingInline: 22,
      controlHeight: 40,
      borderRadius: 999,
      // duplicat a *LG/*SM: antd llegeix tokens diferents per size="large"/"small"
      borderRadiusLG: 999,
      borderRadiusSM: 999,
      contentFontSizeLG: 15,
      paddingInlineLG: 22,
    },
  },
};
```

Tres detalls que no són òbvios llegint-ho per sobre:

**Per què només `colorPrimary`, `colorText`, `fontFamily`, breakpoints i
`Button`, i res més.** És deliberat, no una llista a mig fer. Afegir-hi
`colorBgLayout`, `colorBorder` o `borderRadius` globals tenyeix desenes de
components de cop (antd els deriva automàticament a fons, vores, ombres
arreu). Es van provar i van tenyir de marronós coses que havien de quedar
blanques o grises neutres. Ampliar el tema global és, doncs, una decisió de
disseny amb revisió visual pròpia — no un detall d'implementació que es fica
de passada.

**Per què els valors són literals i mai `var(--lt-*)`.** Amb `cssVar: true`
antd genera les seves pròpies variables `--ant-*` a partir d'aquests valors,
i calcula automàticament els estats *hover/active/disabled* amb un algorisme
de color intern. Aquest algorisme necessita un color parsejable de veritat;
si li passes una referència CSS (`var(--lt-color-brand)`) no la pot resoldre
i els càlculs fallen — es trenquen botons i textos. Per això `antd-theme.ts`
importa els valors TS de `tokens.ts` directament, no els noms CSS.

**Per què els botons duplicen mides `LG`/`SM`.** antd no llegeix
`borderRadius` per a `<Button size="large">`: llegeix `borderRadiusLG`. Sense
la duplicació, els botons `large` sortien quadrats (radi 8px per defecte) al
costat dels botons per defecte, ja arrodonits en pill.

**No hi ha dark mode.** No hi ha `algorithm: darkAlgorithm`, ni context, ni
toggle, ni res llegint `prefers-color-scheme` — el projecte és d'un sol tema.

---

## 5. Per què el CSS de l'app guanya a antd sense `!important`

antd injecta els seus propis `<style>` **al principi** del `<head>`
(`prepend`). El CSS de l'aplicació (Vite el processa i l'injecta després) hi
va **darrere**. Amb la mateixa especificitat, guanya el que ve després al
DOM — per tant guanya sempre el teu `.module.css`. Aquest és el motiu pel
qual es van poder eliminar 12 `!important` que hi havia abans del refactor
(`specs/done/001-refactor-design-system`).

**L'única excepció és `Typography.Title`.** antd l'estilitza amb un selector
element+classe: `h2.ant-typography`, `h3.ant-typography`... Aquest selector
té especificitat (0,1,1) — un element més una classe. Una classe pròpia sola,
com `.title`, té especificitat (0,1,0) i **perd**:

```css
/* ✗ el font-size no s'aplica: perd contra h3.ant-typography */
.title { font-size: var(--lt-text-heading); }

/* ✓ h3.title empata en especificitat i, com que va després al DOM, guanya */
h3.title { font-size: var(--lt-text-heading); }
```

Es veu real a `src/ui/SurfaceCard.module.css:16`:

```css
/* Amb l'element al davant perquè guanyi la mida a h2.ant-typography d'antd. */
h2.title {
  font-family: var(--lt-font-display);
  font-size: clamp(2rem, 5vw, 2.8rem);
  ...
}
```

Amb `Typography.Text` o `Typography.Paragraph` no cal el truc: no tenen
aquest selector element+classe propi d'antd.

Un altre exemple d'override selectiu, a `src/styles/base.css:57`: dins
`Space.Compact`, antd fixa el radi del botó amb una variable inline sobre el
propi `<button>` (`--ant-border-radius-lg`), així que `var()` no serveix aquí
— cal el valor en px directament, amb comentari explicant per què.

---

## 6. Capes de components: qui pot importar de qui

```
src/styles/                       font única dels valors
      ▲
src/ui/                           primitives — ZERO coneixement de negoci
      ▲
src/components/                   blocs editorials de màrqueting reutilitzables
      ▲
src/pages/<mòdul>/components/     privats d'un sol mòdul
```

Les fletxes de dependència només van cap avall: una pàgina pot importar de
`@components`, `@ui` i `@styles`; un component de `@ui` no pot importar
d'una pàgina ni de `@components`; dues pàgines mai s'importen entre elles.
Ho força ESLint (`no-restricted-imports`), no és només convenció.

**Test pràctic per decidir la capa d'un component nou:** sap alguna cosa del
negoci (una sessió, una reserva, una boda, un preu)?

| Exemple real | Sap de negoci? | Capa |
|---|---|---|
| `SurfaceCard` (`src/ui/SurfaceCard.tsx`) — targeta amb ombra, títol i divider genèrics | No | `src/ui/` |
| `PricingCard` (`src/components/pricingCardComponent.tsx`) — sap de preus en euros i navega a la reserva | Sí, però reutilitzable a diverses pàgines | `src/components/` |
| `GuestCodeEntry` (`src/pages/weddings/WeddingGuest/components/GuestCodeEntry.tsx`) | Sí, i només té sentit dins d'una boda | `src/pages/weddings/.../components/` |

Un altre test: **el podries copiar tal qual a un altre projecte?** Si sí, és
`@ui`.

Quan un component acaba fent falta a dos mòduls, no es copia ni s'importa
creuat — es puja a `@ui` o `@components`. És literalment el que li va passar
a `StatusCard`: existia duplicat a reserves i a bodes, i ara viu a
`@ui/StatusCard` amb un prop `tone` que cobreix els dos casos.

`src/components/index.ts` és el barril; tot el que hi ha a `@components`
s'importa d'aquí (`import { PricingCard } from "@components"`), mai per ruta
de fitxer directa — també forçat per ESLint.

---

## 7. CSS Modules per component

47 fitxers `*.module.css` al projecte, cap `.scss`, cap styled-components,
cap Tailwind. És el mecanisme per defecte per a tot allò que no és un valor
dinàmic de JS.

**Conveni de noms:** el `.module.css` va al costat del `.tsx` i es diu igual.
```
src/ui/SurfaceCard.tsx
src/ui/SurfaceCard.module.css
```

**Exemple real** (`src/ui/SurfaceCard.module.css`):
```css
.card {
  background: var(--lt-color-surface-card);
  border-radius: var(--lt-radius-md);
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px);
  box-shadow: 0 4px 20px rgba(124, 116, 88, 0.1), 0 0 0 1px rgba(124, 116, 88, 0.05);
}
```
Nota la barreja: `var(--lt-*)` per als valors del sistema, i valors literals
(el `clamp()`, l'`rgba()` de l'ombra) quan és una mida o ombra d'ús únic
d'aquest component concret — vegeu secció 8 per quan és acceptable.

**Fulls compartits**, quan l'estil el fan servir diversos components, viuen a
`src/ui/*.module.css` sense component associat:

| Fitxer | Conté |
|---|---|
| `@ui/text.module.css` | `.body`, `.caption` |
| `@ui/formStyles.module.css` | `.label`, `.input` |
| `@ui/pageContainer.module.css` | `.page` (820px), `.pageWide` (1200px, sota `AppBar`), `.splitScreen`+`.splitPanel` (pantalla de fons partit) |

Per compartir una classe entre fulls s'usa `composes`, sempre amb **path
relatiu** — els àlies (`@ui`, `@components`) no funcionen dins de `composes`:

```css
.label {
  composes: label from '../../ui/formStyles.module.css';
}
```

Si dos fitxers **del mateix mòdul** comparteixen estil → un `shared.module.css`
local. Si el comparteixen **dos mòduls diferents** → puja't a `src/ui/`.

---

## 8. Colors, tipografia i espaiat: els tres nivells

La mateixa jerarquia de tres passos es repeteix per colors, espais i mides —
és el que permet que canviar el color de marca sigui una línia a `tokens.ts`
i no una cacera per tot `src/`.

```
PRIMITIVA          SEMÀNTIC                     ÚS
--lt-olive-500  →  --lt-color-brand         →   color: var(--lt-color-brand)
--lt-grey-500   →  --lt-color-text-secondary →  color: var(--lt-color-text-secondary)
```

No saltis mai un nivell (escriure `--lt-olive-500` directament a un
`.module.css` quan existeix `--lt-color-brand` per a aquest ús).

Semàntics de color més usats:

| Token | Quan |
|---|---|
| `--lt-color-brand` | oliva de marca: títols, botó primari, icones |
| `--lt-color-brand-strong` | versió fosca: capçaleres, anell de focus |
| `--lt-color-surface-page` / `-card` / `-inverse` | fons de pàgina / targeta / fosc |
| `--lt-color-text-primary` / `-secondary` / `-muted` | text de lectura llarga / suport / metadades |
| `--lt-color-text-brand` | text **petit** (≤13px) en color de marca — és un oliva més fosc que `colorBrand`, calibrat expressament perquè passi contrast AA a mida petita |
| `--lt-color-status-success` / `-danger` | confirmat/èxit / rebutjat/error |

Tipografia: 4 famílies (`display`=Italiana, `body`=Raleway,
`editorial`=Playfair, `handwritten`=Indie Flower), i 7 mides fluides
(`--lt-text-hero`...`-caption`), totes `clamp()` — s'escalen soles amb la
finestra, sense media queries per a la mida del text.

Espaiat: escala numèrica de 4 en 4 (`--lt-space-1`=4px fins `-16`=64px), però
primer es miren els àlies amb nom (`-page`, `-gutter`, `-section`, `-stack`):
si l'espai té un nom que hi encaixa, s'usa el nom.

**Quan no hi ha token, i és acceptable:** degradats, i colors d'un sol ús que
no es repetiran. Es deixen literals **dins del `.module.css`** (mai al
`.tsx`), amb un comentari d'una línia dient per què. No es crea un token
semàntic nou per a un valor que només es fa servir un cop.

---

## 9. Responsive

Font única del "és mòbil?": `src/ui/hooks/useIsMobile.ts`.

```typescript
// src/ui/hooks/useIsMobile.ts
const MOBILE_BREAKPOINT = `(max-width: ${breakpoint.md}px)`; // 768px, de tokens.ts

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(MOBILE_BREAKPOINT).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const update = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return isMobile;
};
```

`window.matchMedia` / `window.innerWidth` estan prohibits per ESLint a
qualsevol altre lloc del codi — aquest hook n'és l'única implementació
permesa, precisament perquè el llindar (768px) surti sempre del mateix
`breakpoint.md` de `tokens.ts` i no d'un número repetit a mà arreu.

Els breakpoints d'antd (`Row`/`Col`, `xs`/`sm`/`md`/`lg`/`xl`/`xxl`) surten
dels **mateixos** valors via `screenXS...screenXXL` a `antd-theme.ts`
(secció 4) — així `<Col xs={24} md={12}>` i una media query pròpia a
768px no es contradiuen mai. Tot layout s'apila en mòbil (`xs={24}`).

Dins d'un `.module.css`, `@media (max-width: 768px)` normal per a estils que
no depenen de React (només CSS).

---

## 10. On escric un estil nou? Arbre de decisió

```
Vull estilitzar una cosa
│
├─ Ja existeix una classe compartida (secció 7) que ho fa?  → fes-la servir
│
├─ És un valor estàtic (color, mida, espai, font)?
│     → al .module.css del component, amb var(--lt-*)
│
├─ Depèn d'una variable de JS?
│     ├─ URL d'imatge, alçada rebuda per prop  → style={{ }} inline
│     └─ un valor de disseny calculat          → style={{ '--x': v }} + var(--x) al CSS
│
├─ És un prop d'estil propi d'antd (styles={{ body: ... }}, gutter)?
│     → es queda al .tsx, és com antd espera rebre'l
│
└─ És d'animació (initial/animate/variants de Framer Motion)?
      → es queda al .tsx
```

**Els únics tres casos on `style={{ }}` inline és legítim:** props d'estil
d'antd, CSS variables/valors dinàmics vinguts de JS, i props d'animació de
Framer Motion. Qualsevol altre `style={{ }}` és deute pendent — al projecte
en queden 36, tots d'aquests tres tipus (abans del refactor n'hi havia 325).

---

## 11. On trobar més detall

Aquesta guia explica el **perquè** i el flux. Per a les **regles**
operatives del dia a dia (les que Claude segueix quan toca estils), la font
és:

| Document | Conté |
|---|---|
| `.claude/skills/styling-guide.md` | la guia completa, 13 seccions — el mateix contingut d'aquest document però com a referència de regles, no narrativa |
| `.claude/skills/design-system.md` | resum curt per consultar ràpid mentre es programa |
| `.claude/skills/shared-components.md` | catàleg de tots els components ja disponibles a `@ui` i `@components`, amb com usar-los |
| `src/styles/tokens.ts` | els valors, sempre actualitzats — si aquesta guia i el codi discrepen mai, guanya el codi |
| `specs/done/001-refactor-design-system/analysis.md` | l'auditoria que va originar aquest sistema: per què hi havia 4 fonts de breakpoints, 46 colors hexadecimals i 325 estils inline abans, i com es van consolidar |

Abans de fer commit tocant estils:

```bash
npx tsc -b
npm run build
npm run lint            # ha de sortir 0 errors
bash tools/check-tokens.sh
```

I obrir la pàgina al navegador: compilar no vol dir que es vegi igual — una
classe mal escrita en un `.module.css` no fa petar res, simplement no aplica
res.
