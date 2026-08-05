# Guia d'estils i components

Punt d'entrada. Llegeix això primer, per ordre; els altres dos documents són
referència de detall i s'hi entra quan aquest t'hi envia.

| Document | Què hi trobaràs |
|---|---|
| **aquest** | com funciona el sistema, jerarquia i decisions |
| `design-system.md` | les regles curtes, per consultar-les ràpid |
| `shared-components.md` | catàleg: què existeix ja i com s'usa |
| `src/styles/tokens.ts` | **els valors**. Autoritat única |

---

## 1. El principi

**Un valor viu en un sol lloc.** Si un color, una mida o un espai apareix
escrit literalment a dos fitxers, ja tens un bug futur: algú en canviarà un i
no l'altre.

Els valors viuen a `src/styles/tokens.ts` i es dupliquen com a custom
properties a `src/styles/tokens.css`. Aquesta és l'única duplicació acceptada,
i està vigilada: `tools/check-tokens.sh` peta si els noms divergeixen, i corre
a CI abans del build.

Conseqüència pràctica: **cap `#hex`, `rgb()` o `fontFamily` fora d'un
`.module.css` o de `tokens.ts`.** No és una recomanació, ho força ESLint en
mode error.

---

## 2. Les quatre capes

```
src/styles/     tokens.ts · tokens.css · antd-theme.ts · base.css
      ↑
src/ui/         primitives. ZERO coneixement de negoci
      ↑
src/components/ blocs editorials de màrqueting
      ↑
src/pages/<x>/  pàgines i els seus components privats
```

**Les fletxes només van cap avall.** Una pàgina pot importar de `@components`,
`@ui` i `@styles`. Un component de `@ui` no pot importar d'una pàgina, ni de
`@components`. Dues pàgines no s'importen entre elles mai — ho força ESLint
(`no-restricted-imports`).

### Com sé a quina capa va una cosa nova?

Una sola pregunta: **sap alguna cosa del negoci?**

| Sap què és una sessió, una reserva, una boda? | Va a |
|---|---|
| No. És una caixa, una barra, un layout | `src/ui/` |
| Sí, però és contingut de màrqueting reutilitzable | `src/components/` |
| Sí, i només serveix per a un mòdul | `src/pages/<mòdul>/components/` |

Test pràctic: **el podries copiar a un altre projecte tal qual?** Si sí, és
`@ui`.

`SurfaceCard` és una caixa amb ombra → `@ui`.
`PricingCard` sap de preus en euros i navega a la reserva → `@components`.
`GuestCodeEntry` només té sentit dins d'una boda → `pages/weddings/…/components`.

### Quan un component es fa servir des de dos mòduls

No el copiïs i no l'importis creuat. **Puja'l** a `@ui` o `@components`. És
literalment el que va passar amb `StatusCard`: existia dues vegades, a reserves
i a bodes, i ara viu a `@ui/StatusCard` amb un prop `tone`.

---

## 3. Colors — tres nivells

La jerarquia és el que fa que un canvi de marca sigui una línia i no una
cacera. Mai saltis un nivell.

```
PRIMITIVA          SEMÀNTIC                    ÚS
--lt-olive-500  →  --lt-color-brand         →  color: var(--lt-color-brand)
--lt-grey-500   →  --lt-color-text-secondary → color: var(--lt-color-text-secondary)
```

**Nivell 1 — primitives.** La paleta crua: `olive-700/600/500/300`, `sand-500`,
`ink-900/800/700/500`, `grey-600/500`, `warm-400`, `paper-100/200/300`,
`cream-100`, `success-500`, `danger-500`. Números baixos = més clar.

**No les facis servir directament** llevat que no hi hagi cap semàntic que
encaixi. Si t'hi trobes sovint, el que falta és un semàntic.

**Nivell 2 — semàntics.** Diuen **per a què** serveix el color, no quin és:

| Token | Quan |
|---|---|
| `--lt-color-brand` | l'oliva de la marca: títols, botó primari, icones |
| `--lt-color-brand-strong` | la versió fosca: capçaleres d'aplicació, anell de focus |
| `--lt-color-accent` | el sorra: subtítols en majúscules, detalls |
| `--lt-color-surface-page` | fons de pàgina |
| `--lt-color-surface-card` | fons de targeta (blanc translúcid) |
| `--lt-color-surface-inverse` | fons fosc |
| `--lt-color-text-primary` | text de lectura llarga (contracte, paràgrafs) |
| `--lt-color-text-secondary` | text de suport, descripcions |
| `--lt-color-text-muted` | metadades, peus, text desactivat |
| `--lt-color-text-brand` | text petit en color de marca (compleix AA) |
| `--lt-color-text-on-brand` | text sobre fons de marca |
| `--lt-color-border-subtle` | separadors i vores |
| `--lt-color-status-success` / `-danger` | confirmat / rebutjat, èxit / error |
| `--lt-color-focus-ring` | anell de focus (ja aplicat globalment) |

**Nivell 3 — ús.** Al `.module.css`, sempre `var(--lt-color-*)`.

### Text petit i contrast

`--lt-color-brand` i `--lt-color-text-brand` són olives diferents a propòsit:
el segon és més fosc i **passa AA a mida petita**. Per a text de 13px o menys en
color de marca, fes servir `--lt-color-text-brand`. Sis colors del projecte es
van haver de corregir per això.

### Quan no hi ha token

Passa i és acceptable en dos casos: **degradats** i **colors d'un sol ús** que
no tornaran (el `#8a8275` de les notes del gestor, el crema de la botiga).
Deixa'ls literals **al `.module.css`**, amb un comentari d'una línia dient per
què. No inventis un token semàntic per un sol ús.

El que **no** és acceptable és el literal dins el `.tsx`.

---

## 4. Tipografia

### Cinc famílies, cadascuna amb la seva feina

| Token | Font | Per a què |
|---|---|---|
| `--lt-font-display` | Italiana | títols, xifres grans, noms |
| `--lt-font-body` | Raleway | tot el text corrent, formularis, UI |
| `--lt-font-editorial` | Playfair Display | FAQs, frases destacades |
| `--lt-font-handwritten` | Indie Flower | la secció "per què fer la sessió" |
| `--lt-font-signature` | Borel | només la signatura del contracte |

Estan auto-allotjades amb `@fontsource` i importades a `base.css`. Si necessites
un pes nou (posem Playfair 600), s'afegeix l'import allà — no un `<link>`.

### Set passos de mida, tots fluids

`--lt-text-hero` · `display` · `title` · `heading` · `subheading` · `body` ·
`caption`

Tots són `clamp(mínim, vw, màxim)`: escalen amb la finestra sense media queries.

**No n'inventis un vuitè.** Si cap dels set encaixa, el que està malament és la
decisió de disseny, no l'escala. Parla-ho abans d'afegir un pas.

Excepció tolerada: una mida puntual dins d'un `.module.css` quan és una peça
única (el `26px` de l'`AppBar`, el `19px` d'una fila de convidat). No inventis
tokens per a aquests.

---

## 5. Espaiat — base 4

L'escala numèrica va de 4 en 4: `--lt-space-1` (4px) fins `--lt-space-16`
(64px), passant per 2, 3, 4, 5, 6, 8, 10, 12.

Però **primer mira els àlies**, que diuen per a què serveix l'espai:

| Àlies | Equival | Quan |
|---|---|---|
| `--lt-space-page` | 24px | padding del cos d'una pàgina |
| `--lt-space-gutter` | 24px | separació entre columnes |
| `--lt-space-section` | 48px | entre seccions d'una pàgina |
| `--lt-space-stack` | 16px | entre elements apilats |

Regla: **si l'espai té un nom, fes servir el nom.** El número és per als casos
que no encaixen en cap dels quatre.

Els `gutter` de `Row` d'antd es passen com a número (`gutter={[24, 24]}`) —
antd no llegeix CSS variables aquí. Fes-los coherents amb la pàgina veïna.

### Contenidors

Quatre amplades màximes, no n'inventis d'altres:

| Token | Amplada | Per a què |
|---|---|---|
| `--lt-container-form` | 520px | targetes de login i de convidat |
| `--lt-container-text` | 820px | reserva, contracte, lectura |
| `--lt-container-page` | 1200px | zones d'aplicació (admin, gestor) |
| `--lt-container-wide` | 1500px | galeries de màrqueting |

---

## 6. Radis, ombres i moviment

**Radis:** `xs` (0.1rem) · `sm` (0.3rem) · `md` (0.5rem) · `lg` (12px) ·
`sheet` (24px) · `pill` (999px). El `pill` és per a botons i etiquetes; el
`sheet` per al panell inferior de mòbil.

**Ombres:** `sm` · `md` · `lg` · `sheet`. Les `md` i `sheet` tenen tint oliva
(no negre) — són les de les targetes de la marca. Fes servir `sm`/`lg` per a
ombres neutres.

**Moviment:** `--lt-duration-fast` (150ms, hovers) · `base` (300ms,
transicions) · `slow` (800ms, entrades). L'`--lt-ease-out` és la corba de la
casa.

⚠️ Les animacions CSS ja respecten `prefers-reduced-motion` (bloc global a
`base.css`). **Les de Framer Motion no** — veure `specs/active/005-…`.

---

## 7. On escric l'estil? — l'arbre de decisió

```
Vull estilitzar una cosa
│
├─ Ja existeix una classe compartida que ho fa?  → fes-la servir (§8)
│
├─ És un valor estàtic (color, mida, espai, font)?
│     → <Component>.module.css, amb var(--lt-*)
│
├─ Depèn d'una variable de JS?
│     ├─ URL d'imatge, alçada per prop  → style={{ }} inline
│     └─ un valor de disseny            → style={{ '--x': v }} + CSS var
│
├─ És un prop d'estil d'antd (styles={{ body: … }}, gutter)?
│     → es queda al .tsx
│
└─ És d'animació (initial/animate/variants)?
      → es queda al .tsx
```

### Els únics tres casos on l'inline és legítim

1. props d'estil d'antd
2. CSS variables dinàmiques i valors que venen de JS (URLs, alçades per prop)
3. `initial` / `animate` / `variants` de Framer Motion

Qualsevol altre `style={{ }}` és deute. Al projecte en queden 36, tots d'aquests
tres tipus.

### El fitxer `.module.css`

Va **al costat** del `.tsx` i es diu igual: `AppBar.tsx` → `AppBar.module.css`.

Si dos fitxers del mateix mòdul comparteixen estil → un `shared.module.css`
local al mòdul.
Si dos **mòduls diferents** el comparteixen → puja'l a `src/ui/*.module.css`.

⚠️ `composes` **no accepta els àlies** (`@ui`, `@components`). Sempre path
relatiu:

```css
.label {
  composes: label from '../../ui/formStyles.module.css';
}
```

---

## 8. Mira si ja existeix abans d'escriure

### Fulls compartits de `@ui`

| Fitxer | Classes |
|---|---|
| `@ui/text.module.css` | `.body`, `.caption` |
| `@ui/formStyles.module.css` | `.label`, `.input` |
| `@ui/pageContainer.module.css` | `.page` (820) · `.pageWide` (1200, sota `AppBar`) · `.splitScreen` + `.splitPanel` (pantalla amb fons partit) |

### Primitives de `@ui`

`SurfaceCard` · `SurfaceCardHeader` · `StatusCard` · `AppBar` · `LoginCard` ·
`MobileShell` · `MobileSwiper` · `DesktopSplitBackground` · `useIsMobile`

### Blocs de `@components`

`CustomTitle` · `PricingCard` · `SessionPricingCards` · `FAQs` · `ImageSlider` ·
`WhyDoSession` · `ThreePhotoRow` · `PhotoItem` · `ImageBackground` ·
`AdviceText` · `PromoVideoBackground` · `ScrollToTop`

Sempre des del barril: `import { X } from "@components"`. Mai per ruta de
fitxer — ho força ESLint.

Detall d'ús de cadascun: `shared-components.md`.

---

## 9. Ant Design — el que has de saber

### Què configura el tema, i què no

`src/styles/antd-theme.ts` fixa **només** `colorPrimary`, `colorText`,
`fontFamily`, els breakpoints i els overrides de `Button`.

Això és deliberat. Afegir-hi `colorBgLayout`, `colorBorder` o `borderRadius`
tenyeix mig producte de cop, perquè antd els deriva a desenes de components.
**Si en vols afegir un, és una decisió de disseny amb revisió visual pròpia**,
no un detall d'implementació.

Els valors del tema han de ser colors **reals**, no `var(--lt-*)`: l'algorisme
d'antd calcula hover, active i disabled a partir d'ells i no sap resoldre una
referència CSS.

### Especificitat: per què no cal cap `!important`

antd injecta els seus estils **al principi del `<head>`**. El CSS de l'app hi va
darrere. Amb la mateixa especificitat, **guanya el teu**.

Per això `.primaryButton { background: … }` sobre un `<Button type="primary">`
funciona sense trucs, i per què es van poder eliminar els 12 `!important` que
hi havia.

### L'excepció: els títols

antd estilitza els títols amb `h2.ant-typography`, `h3.ant-typography` —
element **més** classe. Una classe sola perd.

```css
/* ✗ el font-size no s'aplicarà */
.title { font-size: var(--lt-text-heading); }

/* ✓ */
h3.title { font-size: var(--lt-text-heading); }
```

Només passa amb `Typography.Title`. Amb `Text`, `Paragraph` i la resta, la
classe sola va bé.

### On va la classe

Cada component d'antd posa el `className` en un element diferent. `Input` amb
`prefix` el posa al contenidor, no a l'`<input>`. Si un estil no s'aplica,
inspecciona abans de forçar res.

---

## 10. Responsive

**Una sola font de veritat:** `useIsMobile()` de `@ui/hooks/useIsMobile`, que
llegeix `breakpoint.md` (768px) de `tokens.ts`.

```typescript
import { useIsMobile } from "@ui/hooks/useIsMobile";
const isMobile = useIsMobile();
```

Mai `window.matchMedia` ni `window.innerWidth` directament — ho força ESLint, i
l'única implementació permesa és dins d'aquest hook.

Dins d'un `.module.css`, `@media (max-width: 768px)` normal. Els breakpoints
d'antd (`xs`…`xxl`) surten dels mateixos valors de `tokens.ts`, o sigui que
`Col xs={24} md={12}` i les teves media queries no es contradiuen.

Tot layout s'ha d'apilar en mòbil: `xs={24}`.

---

## 11. Imatges

- Sempre `getPublicPath(path)`, mai una ruta crua.
- Relació d'aspecte de retrat: `aspect-ratio: 2 / 3`.
- Radi: token, mai un valor a mà.
- **Reserva la caixa** si la imatge afecta el layout (`height` + `aspect-ratio`).
  Una imatge sense mida coneguda desplaça el que té al voltant en carregar; això
  és el que trencava el menú de la capçalera.

Excepció acceptada: `workshop.page.tsx` fa servir URLs de Cloudinary directes.

---

## 12. Abans de fer commit

```bash
npx tsc -b
npm run build
npm run lint            # ha de sortir 0 errors
bash tools/check-tokens.sh
```

I la comprovació que cap d'aquests quatre fa:

```bash
grep -c "style={{" <els teus fitxers>      # només els 3 casos legítims
```

**Compilar no vol dir que es vegi igual.** Un `.module.css` amb una classe mal
escrita no peta enlloc, simplement no aplica res. Si has tocat estils, obre la
pàgina.

---

## 13. Quan la guia i el codi no coincideixin

Guanya el codi. Aquest document ja va quedar desfasat un cop; per això ara els
valors no hi són i només hi ha regles i punters. Si trobes una divergència,
corregeix la guia en el mateix commit.

L'autoritat, per ordre: `src/styles/tokens.ts` → `eslint.config.js` → aquesta
guia.
