# 001 — Sistema d'estils: desglossament de tasques

Executable de [`analysis.md`](analysis.md). Cap decisió nova aquí: si una tasca sembla
demanar-ne una, és que falta al document d'anàlisi i cal actualitzar-lo primer.

**Convenció:** cada tasca té *abast* (què es toca), *fet quan* (criteri verificable,
sempre que es pugui amb una ordre) i *depèn de*. Una tasca sense criteri verificable
no és una tasca, és una intenció.

---

## Resum

| Fase | Tasques | Esforç | Bloqueja |
|------|---------|--------|----------|
| **F0 — Neteja** | T0.1 – T0.4 | ~0,5 d | Tot |
| **F1 — Tokens** | T1.1 – T1.6 | ~1,5 d | F2, F4 |
| **F2 — Capes** | T2.1 – T2.6 | ~1 d | F4 |
| **F3 — Governança** | T3.1 – T3.4 | ~0,5 d | F4 (per disseny) |
| **F4 — Migració** | T4.1 – T4.10 | ~4–6 d | — |
| **Total** | 30 tasques | **~8–10 d** | |

**Ordre no negociable:** F0 → F1 → F2 → F3 → F4.
F3 va **abans** de F4 a propòsit: el lint ha d'estar actiu mentre es migra, o la
migració reintrodueix el que està esborrant.

**Únic paral·lelisme segur:** dins de F4, les tasques T4.1–T4.8 són independents
entre elles (mòduls diferents, fitxers disjunts).

---

## F0 — Neteja

> Objectiu: treure de la taula tot el que és mort o heretat abans de construir res
> a sobre. Cap canvi visual.

### T0.1 — Esborrar codi mort

**Abast:** eliminar els 3 fitxers verificats com a no importats enlloc:
- `src/App.css` (83 línies, plantilla Vite + carrusel obsolet)
- `src/components/components.css` (58 línies, amb `!important` i `.carousel-container` col·lident amb `App.css`)
- `src/layouts/components/main.header_old.tsx` (61 línies)

**Fet quan:**
```bash
git rm src/App.css src/components/components.css src/layouts/components/main.header_old.tsx
npm run build          # compila
grep -rn "App.css\|components.css\|header_old" src/ index.html   # sense resultats
```

**Depèn de:** —

---

### T0.2 — Substituir `index.css` per `styles/base.css`

**Abast:** `src/index.css` és encara la plantilla d'inici de Vite: `color-scheme:
light dark`, `background-color: #242424`, `a { color: #646cff }` i un selector global
`button {}` amb fons negre sota una app d'Ant Design (anàlisi 2.5).

Es crea `src/styles/base.css` amb **només** quatre coses:
1. `*, *::before, *::after { box-sizing: border-box }`
2. `html, body, #root` — reset de marges i `min-height` (l'únic que val la pena de l'actual)
3. `:focus-visible` global amb `--lt-color-focus-ring` *(l'anell de focus s'afegeix a T1.2, quan el token existeixi)*
4. `@media (prefers-reduced-motion: reduce)` global

**No** s'hi posa cap reset general: antd ja n'aporta un i duplicar-lo el contradiu.

`src/main.tsx` importa `./styles/base.css` en lloc de `./index.css`.

**Fet quan:** l'app es veu idèntica en les 5 zones (marketing, reserva, contracte,
boda, admin) i `grep -n "646cff\|#242424\|color-scheme" src/` no retorna res.

**Depèn de:** T0.1

---

### T0.3 — Netejar la càrrega de fonts

**Abast:** `index.html` té 6 `<link>` de Google Fonts amb `preconnect` duplicats i
carrega **7 famílies**, de les quals `Prata` i `Sour Gummy` no s'usen enlloc.

Deixar-hi exactament les 5 famílies en ús (Q1 tancada): Italiana, Raleway,
Playfair Display, Indie Flower, Borel — en **un sol** `<link>` consolidat amb
`display=swap` i un únic parell de `preconnect`.

**Fet quan:** `index.html` té 1 `<link>` de fonts + 2 `preconnect`; la pestanya
Network mostra 5 famílies i cap petició a `Prata` ni `Sour+Gummy`.

**Depèn de:** —

---

### T0.4 — Auto-allotjar les fonts (`@fontsource`)

**Abast:** substituir el `<link>` de T0.3 per imports de `@fontsource/*` a
`base.css`, traient el domini de Google del camí crític de render (anàlisi 3.10 J2).

⚠️ **Verificar disponibilitat abans de començar:** `italiana`, `raleway`,
`playfair-display`, `indie-flower` existeixen a fontsource; **cal comprovar `borel`**.
Si `borel` no hi és, es queda per `<link>` de Google i es documenta l'excepció — és
una sola família i només s'usa a la signatura del contracte.

**Fet quan:** cap petició a `fonts.googleapis.com` ni `fonts.gstatic.com` a la
pestanya Network (o només la de Borel, documentada); tipografies idèntiques.

**Depèn de:** T0.3

> Si T0.4 es descarta per cost, T0.3 ja deixa la situació acceptable. És l'única
> tasca de F0 realment opcional.

---

## F1 — Tokens

> Objectiu: una sola definició de cada valor, consumible des de CSS i des d'antd.
> Cap canvi visual excepte els 6 colors de contrast de T1.4.

### T1.1 — `src/styles/tokens.ts`

**Abast:** autoria única dels valors. Dues capes (anàlisi 3.5 E2):
- **primitives**: `olive-700/600/500/300`, `warm-400`, `sand-500`, `ink-900/700/500`,
  `grey-600/500`, `paper-100/200/300`, `cream-100`, `success-500`, `danger-500`
- **semàntics**: `color-brand`, `color-brand-strong`, `color-accent`,
  `color-surface-page/card/inverse`, `color-text-primary/secondary/muted/brand/on-brand`,
  `color-border-subtle`, `color-status-success/danger`, `color-focus-ring`
- **escales**: `space-1..16` (base 4) + àlies `page/gutter/section/stack`;
  `radius-xs..pill`; `shadow-sm/md/lg/sheet`; `container-form/text/page/wide`;
  `text-hero..caption` (7 passos); `font-display/body/editorial/handwritten/signature`;
  `duration-fast/base/slow`; `ease-out`; `breakpoint-xs..xxl`

Valors exactes: analysis.md §5.1–5.4.

**Fet quan:** el fitxer existeix, `tsc -b` passa, i cada valor de §5 hi és exactament
un cop.

**Depèn de:** F0

---

### T1.2 — `src/styles/tokens.css` + anell de focus

**Abast:** bloc `:root { --lt-*: … }` amb tots els tokens de T1.1, importat des de
`base.css`. Completar el `:focus-visible` que T0.2 va deixar pendent, amb
`--lt-color-focus-ring`.

**Fet quan:** `getComputedStyle(document.documentElement).getPropertyValue('--lt-color-brand')`
retorna `#7C7458` a la consola; tabular per qualsevol pàgina mostra un anell de focus
visible i coherent.

**Depèn de:** T1.1

> **Nota de manteniment:** `tokens.ts` i `tokens.css` han de dir el mateix. Amb ~60
> tokens i un sol desenvolupador, mantenir-los a mà és acceptable; el que **no** és
> acceptable és que divergeixin en silenci. Ho cobreix T3.2.

---

### T1.3 — `src/styles/antd-theme.ts` amb `cssVar`

**Abast:** extreure el `theme` inline de `src/App.tsx` a un `ThemeConfig` propi amb
`cssVar: true` i `hashed: false`, on els valors apunten a `var(--lt-*)`. Mapatge
mínim: `colorPrimary`, `colorText`, `colorTextSecondary`, `colorBgLayout`,
`colorBorder`, `colorError`, `colorSuccess`, `fontFamily`, `borderRadius`,
`screenXS…screenXXL`, més els overrides de `Button` que ja existeixen.

**Fet quan:** `App.tsx` només importa i passa el tema; l'inspector mostra
variables `--ant-*` al `:root`.

**Depèn de:** T1.2

---

### T1.4 — Corregir els 6 colors que fallen AA

**Abast:** aplicar la resolució de Q2 (analysis.md §5.2). Els reemplaçaments concrets:

| Substituir | Per | On |
|-----------|-----|-----|
| `#9a9a9a` | `--lt-color-text-muted` | `ContractSheet.tsx` ×3 |
| `#a09890` | `--lt-color-text-muted` | `workshop.page.tsx` ×3 |
| `#a09880` | `--lt-color-text-muted` | gradients de `StatusCard.tsx` *(revisar: és fons, no text → pot quedar-se)* |
| `#9a9080` | `--lt-color-text-muted` | `ManagerShared.tsx`, `glassCard.tsx` |
| `#888` | `--lt-color-text-muted` | `advicetext.tsx` |
| `#7C7458` com a **text petit** | `--lt-color-text-brand` | `LabelTag` (13px), `.manager-title` |

**Fet quan:** cap dels colors de la columna esquerra apareix com a `color:` en
text; verificació amb l'auditoria de contrast del DevTools sobre `bookingview`,
`workshop` i `WeddingManager`.

**Depèn de:** T1.2

> Aquesta tasca es fa **ara** i no a F4 perquè és l'únic canvi deliberat d'aparença
> del pla: convé aïllar-lo en un commit propi i revisar-lo sol.

---

### T1.5 — Deprecar `radii.ts`

**Abast:** `src/styles/tokens/radii.ts` (14 imports, alguns amb `../../../../`) passa
a re-exportar des de `tokens.ts` amb `@deprecated`. No se'n toquen els consumidors
encara: cauen a F4.

**Fet quan:** `radii.ts` no conté cap valor literal, només re-exports.

**Depèn de:** T1.1

---

### T1.6 — Validar `theme.cssVar` amb els components crítics

**Abast:** verificar que `cssVar: true` funciona amb `Button`, `Card`, `Table`,
`Steps`, `Form` i `Drawer` — els sis components d'antd amb més pes al projecte.

**Fet quan:** canviar `--lt-color-brand` a la consola repinta botons, taules i steps
sense recarregar.

**Si falla:** `ConfigProvider` es queda amb valors literals i els `.module.css` amb
`var(--lt-*)`. Es perd la definició única de la marca, no el pla (analysis.md §7).

**Depèn de:** T1.3

---

## F2 — Capes

> Objectiu: que "on va aquest component?" tingui una resposta objectiva, i que
> `pages/weddings` deixi de ser la llibreria compartida de facto.

### T2.1 — Crear `src/ui` i moure-hi `SurfaceCard`

**Abast:** `src/components/glassCard.tsx` → `src/ui/SurfaceCard/`. Renombrar
`GlassCard` → `SurfaceCard` i `GlassCardHeader` → `SurfaceCardHeader`. Esborrar
`pages/weddings/common/components/WeddingCard.tsx` (només és un àlies) i actualitzar
els 5 consumidors: `DetailsFormStep`, `StatusCard`, `SummaryStep`, `ConfirmationStep`,
`LoginCard`.

**Fet quan:** `grep -rn "GlassCard\|WeddingCard" src/` no retorna res.

**Depèn de:** F1

---

### T2.2 — Moure les primitives de layout mòbil

**Abast:** `MobileShell`, `MobileSwiper`, `DesktopSplitBackground` →
`src/ui/`. Avui viuen a `pages/weddings/common` però els usa el login d'admin.

**Fet quan:** `pages/weddings/common/components/` només conté components realment
específics de bodes.

**Depèn de:** T2.1

---

### T2.3 — Unificar breakpoints en un sol hook

**Abast:** el problema de les 4 fonts de veritat (analysis.md 2.6):
- `useIsMobile` → `src/ui/hooks/`, llegint `breakpoint-md` de `tokens.ts` en lloc de la cadena `'(max-width: 768px)'`
- els 3 `matchMedia("(max-width: 600px)")` de `home.page.tsx`, `aboutme.tsx` i `promoVideoBackground.tsx` passen a `useIsMobile()`
- `carrousel.tsx` deixa de llegir `window.innerWidth` sense listener — **això arregla un bug real**: avui no reacciona al `resize` ni a la rotació del dispositiu

**Fet quan:** `grep -rn "matchMedia\|innerWidth" src/` només retorna
`src/ui/hooks/useIsMobile.ts`; el carrusel canvia d'1 a 4 imatges en rotar el mòbil.

**Depèn de:** T2.2

> ⚠️ Canvi de comportament: 600px → 768px en 3 pàgines. Validar en dispositiu real,
> no només al DevTools.

---

### T2.4 — Alies `@ui` i `@styles`

**Abast:** afegir-los a `vite.config.ts` i `tsconfig.app.json`, al costat dels 6 que
ja hi ha. Elimina els `../../../../styles/tokens/radii` actuals.

**Fet quan:** `grep -rn "\.\./\.\./\.\./" src/` no retorna imports de `styles/` ni `ui/`.

**Depèn de:** T2.1

---

### T2.5 — Netejar `src/common`

**Abast:** `src/common/index.ts` re-exporta `useIsMobile` des de
`pages/weddings/common` — infraestructura genèrica servida des d'un mòdul de domini.
Després de T2.3 el re-export ja apunta a `@ui`; es decideix si `src/common` té sentit
o si `LoginCard` (l'únic que hi queda) puja a `src/ui`.

**Recomanació:** `LoginCard` → `src/ui/LoginCard/`, i `src/common/` desapareix. Una
carpeta amb un sol fitxer i un re-export no és una capa.

**Fet quan:** `src/common/` no existeix, o conté només codi sense cap import cap a `pages/`.

**Depèn de:** T2.3

---

### T2.6 — Moure els blocs de marketing a capa 2

**Abast:** confirmar que `src/components/` conté només blocs editorials
(`CustomTitle`, `FAQs`, `PricingCard`, `SessionPricingCards`, `Carrousel`,
`WhyDoSession`, `ThreePhotoRow`, `PhotoItem`, `ImageBackground`, `AdviceText`,
`PromoVideoBackground`) i cap primitiva. Actualitzar `src/components/index.ts`, que
avui només exporta 5 dels 12 components (la resta s'importen per ruta directa).

**Fet quan:** tots els components de capa 2 s'importen via `@components`; cap import
per ruta de fitxer.

**Depèn de:** T2.4

---

## F3 — Governança

> Objectiu: que a partir d'aquí la infracció no compili. Va **abans** de la migració
> massiva, no després.

### T3.1 — Regles ESLint

**Abast:** afegir a `eslint.config.js` (esbós complet a analysis.md §3.9):
- `no-restricted-syntax`: prohibir `fontFamily` inline, literals de color hex/rgb, `matchMedia`
- `no-restricted-imports`: prohibir imports entre mòduls (`**/pages/*/**`) i rutes internes d'antd (`antd/es/**`)
- excepció per a `src/styles/tokens.ts`

**Fet quan:** afegir `color: '#123456'` a qualsevol component fa fallar `npm run lint`;
`npm run lint` passa net sobre el codi ja migrat.

⚠️ Sobre el codi encara no migrat de F4 les regles dispararan centenars d'errors.
Opcions: activar-les com a `warn` fins que acabi F4 i pujar-les a `error` a T4.10, o
usar `overrides` per carpeta que es van retirant a mesura que cada mòdul es migra. La
segona és més feina però manté el senyal net.

**Depèn de:** F2

---

### T3.2 — Guarda de deriva `tokens.ts` ↔ `tokens.css`

**Abast:** un script mínim que comprovi que tots dos fitxers declaren el mateix
conjunt de noms de token. No cal comparar valors: la deriva perillosa és que un
tingui un token que l'altre no.

```bash
# tools/check-tokens.sh — falla si els noms no coincideixen
```

**Fet quan:** afegir un token a `tokens.ts` i no a `tokens.css` fa fallar l'script.

**Depèn de:** T1.2

---

### T3.3 — Lint a CI

**Abast:** afegir `npm run lint` i `tools/check-tokens.sh` a
`.github/workflows/deploy.yml`, abans del build.

**Fet quan:** un PR amb una infracció es marca en vermell a GitHub.

**Depèn de:** T3.1, T3.2

---

### T3.4 — Reescriure la documentació de disseny

**Abast:** `.claude/skills/design-system.md` avui repeteix valors que ja han derivat
del codi (analysis.md 2.9). Passa a contenir **regles i punters**, zero valors:
"els colors són a `@styles/tokens.ts`", "cap `fontFamily` inline", "capa 3 no importa
de capa 3".

També corregir els errors detectats a `shared-components.md`: `<FAQs image>` → `imageSrc`,
`<PricingCard onBook>` → `sessionTypeId`.

**Fet quan:** cap valor hex, cap `clamp()` i cap px dins dels dos `.md`.

**Depèn de:** T3.1

---

## F4 — Migració per mòduls

> Objectiu: `style={{}}` estàtic → `.module.css` amb tokens. Un mòdul complet per
> tasca i per commit; **mai un mòdul a mitges**.
>
> Ordre per risc i valor: primer el que té deute d'accessibilitat i és transaccional,
> últim el marketing.
>
> **Patró per a cada tasca:** crear `<Component>.module.css` al costat del `.tsx`,
> moure-hi tot valor estàtic, deixar inline només (a) props d'estil d'antd, (b) CSS
> vars dinàmiques, (c) `initial/animate` de Framer Motion.

| Tasca | Mòdul | Fitxers | Inline avui | Notes |
|-------|-------|---------|-------------|-------|
| **T4.1** | `bookingview` | `BookingViewPage`, `ContractSheet`, `SignaturePad` | 33 | Elimina les constants locals `OLIVE`/`INK`/`RULE`. Prioritat: és el contracte legal |
| **T4.2** | `booksession` | pàgina + 6 passos + `styles.ts` | 24 | `styles.ts` desapareix; `labelStyle`/`inputStyle` estan duplicats amb `LoginCard` — es resol amb un sol `.module.css` de formulari a `@ui` |
| **T4.3** | `admin` | `AdminPanel`, `AdminLogin`, 3 tabs, `FeaturesEditor` | 18 | Capçalera duplicada amb `WeddingManager.css` — unificar en una primitiva `AppBar` a `@ui` |
| **T4.4** | `weddings/WeddingManager` | 5 components + `WeddingManager.css` | 27 + 161 línies CSS | **Eliminar els 12 `!important`**; les constants `COLOR_*`/`FONT_*` de `ManagerShared` desapareixen |
| **T4.5** | `weddings/WeddingGuest` | 8 components + `custom/carla-joel` | 39 | `custom/carla-joel` es migra a tokens però **conserva el seu layout propi** (excepció acceptada, analysis.md 3.8) |
| **T4.6** | `@ui` + `@components` | `SurfaceCard`, `CustomTitle`, `PricingCard`, `FAQs`, `Carrousel`, `WhyDoSession`, `ThreePhotoRow`, `PhotoItem`, `AdviceText`, `MobileShell`, `MobileSwiper` | 45 | El de més impacte: cada component migrat aquí neteja totes les pàgines que l'usen |
| **T4.7** | Marketing | `pregnancy`, `newborn`, `familiar`, `smashcake`, `aboutme`, `home` | 32 | Mecànic un cop fet T4.6. `rowStyle` duplicat entre pàgines → un sol token de secció |
| **T4.8** | `store` + `workshop` | `store.page`, `storeBook`, `workshop.page`, `bookstore` | 46 | Els dos fitxers amb més inline del projecte. Cloudinary **no** es toca (Q3) |
| **T4.9** | `layouts` | `main.layout`, `main.header`, `footer` | 8 | `main.header` té `minWidth: 400px` al menú i un `forceMenuRecalc()` amb `key` que sembla un pegat de layout: revisar si desapareix amb CSS real |

**Fet quan (per a cada tasca T4.x):**
```bash
grep -c "style={{" <fitxers del mòdul>     # només inline justificat
grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(|fontFamily|clamp\(" <fitxers>   # cap resultat
npm run lint && npm run build
```
més comparació visual abans/després de les pantalles del mòdul.

**Depèn de:** F3. Entre elles, T4.1–T4.5 i T4.7–T4.9 són independents; **T4.6 convé
fer-la abans que T4.7 i T4.8** perquè arrossega la major part de la feina.

---

### T4.10 — Tancament

**Abast:**
- pujar les regles ESLint de `warn` a `error` (si es va triar aquesta via a T3.1)
- esborrar `src/styles/tokens/radii.ts` i els seus últims imports
- afegir `prefers-reduced-motion` als ~14 components animats que encara no el respecten (avui només `ContractSheet` usa `useReducedMotion`)
- moure `specs/active/001-…` → `specs/done/`

**Fet quan:**
```bash
grep -rn "styles/tokens/radii" src/        # sense resultats
grep -rc "style={{" src/ | awk -F: '{s+=$2} END {print s}'   # < 40 (avui 325)
npm run lint                                # net, en mode error
```
i el sistema activa "reduir moviment" sense que cap pàgina animi.

**Depèn de:** T4.1 – T4.9

---

## Mètriques de control

Els números d'avui, per poder dir objectivament si això ha servit d'alguna cosa:

| Mètrica | Avui | Objectiu | Com es mesura |
|---------|------|----------|---------------|
| Objectes `style={{}}` | 325 | < 40 | `grep -rc "style={{" src/` |
| Colors hex únics | 46 | 0 fora de `tokens.ts` | `grep -rhoiE "#[0-9a-f]{3,8}" src/ \| sort -u \| wc -l` |
| Valors `rgb()/rgba()` únics | 47 | 0 fora de `tokens.ts` | `grep -rhoE "rgba?\([^)]*\)" src/ \| sort -u \| wc -l` |
| `fontFamily` inline | 96 | 0 | `grep -rc "fontFamily" src/` |
| Expressions `clamp()` | 31 úniques | 7 (a `tokens.css`) | `grep -rhoE "clamp\([^)]*\)" src/ \| sort -u \| wc -l` |
| `!important` | 12 | 0 | `grep -rc "!important" src/` |
| Fonts carregades | 7 (2 sense usar) | 5 | inspecció de `index.html` / Network |
| Colors de text que fallen AA | 6 | 0 | auditoria de contrast del DevTools |
| Fonts de veritat de breakpoints | 4 | 1 | `grep -rn "matchMedia\|innerWidth" src/` |

Convé capturar-les abans de T0.1 i tornar-les a mesurar a T4.10.
