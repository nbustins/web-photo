# 001 — Sistema d'estils: anàlisi i propostes

- **Status:** review — punts oberts tancats, llest per implementar
- **Owner:** nbustins
- **Created:** 2026-08-04
- **Updated:** 2026-08-04
- **Tipus:** document d'anàlisi i decisió (precedeix `spec.md`)
- **Desglossament executable:** [`tasks.md`](tasks.md)

---

## 0. Com llegir aquest document

Seccions 1–2: **diagnòstic** amb mesures reals sobre `src/` (no impressions).
Secció 3: **eixos de decisió**. Cada eix planteja el problema, 2–4 opcions, què resol
cada una, què costa, i una recomanació justificada.
Seccions 4–9: **arquitectura objectiu**, tokens concrets, pla de migració, riscos,
preguntes obertes.

Aquestes decisions ja estan preses amb l'stakeholder i condicionen la resta del
document; s'hi fa referència com **[D1]**, **[D2]**, **[D3]**:

| # | Decisió | Impacte |
|---|---------|---------|
| D1 | **Ant Design 5 es queda** com a base | El sistema s'ha d'integrar amb `ConfigProvider`, no competir-hi |
| D2 | Migració **big-bang per capes** | Es pot refer la base sense mantenir compatibilitat amb l'estat actual |
| D3 | El **branding per boda és futur llunyà** i **no condiciona cap decisió base** | Es tracta com a *porta oberta*, no com a requisit. Cap fase del pla el construeix |

> **Sobre D3.** L'existència de `WeddingGuest/custom/carla-joel/` podria suggerir que
> la personalització per esdeveniment és imminent. No ho és. Per tant cap opció
> d'aquest document es tria *perquè* faciliti el branding; on la solució
> recomanada l'acabi facilitant, es diu explícitament que és un efecte secundari
> gratuït i no la raó de la tria. L'eix H (3.8) queda com a anàlisi preparatòria,
> fora de l'abast d'implementació.

---

## 1. Context

`web-photo` és el front d'un monolit modular que va afegint mòduls de domini.
Avui conviuen, dins la mateixa app i el mateix bundle, cinc "productes" amb
necessitats visuals diferents:

| Mòdul | Naturalesa | Prioritat visual |
|-------|-----------|------------------|
| Marketing (embaràs, nadó, familiar, smash cake, botiga, taller, sobre mi) | Portfoli editorial | Estètica, tipografia gran, animació |
| Reserves (`booksession`) | Formulari transaccional multi-pas | Claredat, validació, mobile |
| Contractes (`bookingview`) | Document legal signable | Llegibilitat, impressió, confiança |
| Bodes (`weddings/WeddingGuest`, `WeddingManager`) | Producte per al convidat + panell de gestió | Mobile-first, to celebratiu |
| Admin (`admin`) | Back-office CRUD | Densitat, taules, velocitat |

Aquesta barreja és **normal i correcta** com a producte. El problema és que avui
no hi ha cap frontera declarada entre "el que és compartit" i "el que és del
mòdul", i cada mòdul nou ha resolt els estils des de zero. El resultat mesurable
és a la secció 2.

### 1.1 Estat actual del sistema (el que ja existeix)

No es parteix de zero. Ja hi ha tres intents parcials de sistema:

1. `ConfigProvider` a `src/App.tsx` — 4 tokens globals (`colorPrimary`, `colorLink`,
   `colorText`, `fontFamily`) + overrides de `Button`.
2. `src/styles/tokens/radii.ts` — 3 radis + `pageBodyPadding`.
3. `.claude/skills/design-system.md` — documentació d'un sistema que **descriu més
   del que existeix** i que ja ha derivat del codi (secció 2.9).

Cap dels tres cobreix color semàntic, espaiat, tipografia, ombres, breakpoints ni
motion. Tot això viu inline.

---

## 2. Diagnòstic

Mesures obtingudes sobre `src/` (113 fitxers, ~9.000 línies).

### 2.1 L'estil viu inline, i inline no escala

**325 objectes `style={{...}}`** repartits en **59 fitxers**. Els pitjors:

| Fitxer | Objectes inline |
|--------|-----------------|
| `pages/workshop/workshop.page.tsx` | 22 |
| `pages/weddings/WeddingGuest/components/GuestMobileLayout.tsx` | 20 |
| `pages/bookingview/ContractSheet.tsx` | 19 |
| `pages/weddings/WeddingManager/components/ManagerMobileDashboard.tsx` | 16 |
| `pages/store/store.page.tsx` | 14 |

Per què això és un problema estructural i no només estètic:

- **No hi ha pseudo-classes ni media queries.** `:hover`, `:focus-visible`,
  `@media`, `@supports`, `prefers-reduced-motion` són impossibles inline. Per això
  cada vegada que calen apareix un `.css` ad-hoc (`WeddingManager.css`, 161 línies
  amb 12 `!important`) o un `matchMedia` a mà (secció 2.6).
- **No hi ha cascada ni reutilització.** Copiar l'objecte és més barat que
  extreure'l → `labelStyle` i `inputStyle` estan duplicats **byte a byte** entre
  `pages/booksession/styles.ts` i `common/LoginCard.tsx`.
- **Cost de runtime.** Cada render crea objectes nous → React comparava
  `style` per identitat i re-aplica; a `workshop.page.tsx` són 22 objectes nous per
  render dins de `.map()`.
- **No és auditable.** No es pot fer grep d'"on s'usa el color de marca" quan el
  color de marca està escrit de 6 maneres diferents.

### 2.2 El color no té sistema: ~90 literals per una paleta de ~10

- **46 valors hex únics** + **47 valors `rgb()/rgba()` únics** al codi.
- `#7C7458` (el color de marca) apareix **22 vegades escrit a mà**, tot i estar
  ja definit com a `colorPrimary` al `ConfigProvider`.
- El mateix color apareix amb grafies incompatibles per a grep i per a diff:
  `rgba(124, 116, 88, 0.08)` (8 usos) i `rgba(124,116,88,0.08)` (3 usos) són el
  mateix valor escrit diferent.
- Existeixen **illes de constants locals** que redefineixen la mateixa paleta amb
  noms diferents a cada mòdul:

  ```ts
  // pages/weddings/WeddingManager/components/ManagerShared.tsx
  export const COLOR_OLIVE = '#7C7458';   // = colorPrimary
  export const COLOR_MUTED = '#9a9080';

  // pages/bookingview/ContractSheet.tsx
  const OLIVE = '#7C7458';                // = COLOR_OLIVE = colorPrimary
  const INK   = '#4a4539';
  const RULE  = 'rgba(124, 116, 88, 0.25)';
  ```

  Tres noms per al mateix color, en tres fitxers, cap d'ells importable des del
  tercer. Aquest és el patró que es repetirà a cada mòdul nou si no es talla.
- **Grisos de text sense escala:** `#333`, `#444`, `#5a5a5a`, `#6a6a6a`, `#888`,
  `#9a9a9a`, `#9a9080`, `#a09890`, `#a09880`, `#c4c0b4`. Deu grisos per a tres
  nivells de jerarquia reals (primari / secundari / deshabilitat).

### 2.3 La tipografia és el pitjor cas

- **~96 declaracions `fontFamily` inline**, amb **7 grafies diferents per a 2
  famílies**:

  | Grafia | Usos |
  |--------|------|
  | `"'Raleway', sans-serif"` | 36 |
  | `"Italiana"` | 13 |
  | `"'Italiana', Georgia, serif"` | 13 |
  | `"Raleway, sans-serif"` | 6 |
  | `FONT_BODY` (constant local de WeddingManager) | 11 |
  | `FONT_TITLE` (íd.) | 5 |
  | `'Italiana'`, `"Georgia, serif"`, `fontFamily:"Raleway"` | 4 |

  Conseqüència real, no teòrica: la meitat dels títols `Italiana` **no tenen
  fallback serif**. Mentre la webfont carrega (o si falla), aquests títols cauen a
  la sans-serif del sistema i la pàgina fa un salt de layout visible; l'altra
  meitat cau correctament a Georgia.

- **31 expressions `clamp()` diferents**, de les quals només 4 es reutilitzen més
  de dues vegades. Exemples de valors pràcticament idèntics coexistint:
  `clamp(0.9rem, 1.4vw, 1rem)`, `clamp(0.9rem, 1.3vw, 1rem)`,
  `clamp(0.9rem, 1.4vw, 1.05rem)`, `clamp(0.85rem, 1.5vw, 1rem)`.
  Això no és una escala tipogràfica: és soroll amb aparença de precisió.

- **7 famílies de Google Fonts carregades a `index.html`** en 6 `<link>` separats
  amb `preconnect` duplicats. **`Prata` i `Sour Gummy` no s'usen enlloc del codi.**
  Dues peticions bloquejants per a res.

### 2.4 Espaiat, radis, ombres i amplades: sense escala

| Dimensió | Estat actual |
|----------|--------------|
| Espaiat | **18 valors diferents** en `padding/margin/gap` (0,1,2,3,4,5,6,8,10,12,14,16,18,20,24,25,26,28,30,32,40). Un únic token: `pageBodyPadding = 24px` |
| Radis | Token `radii` existeix (3 valors, 21 usos) però conviu amb **9 literals** (`8`, `10`, `4`, `3`, `2`, `18`, `"0.3rem"` escrit a mà 3 cops = el mateix que `radii.md`) |
| Ombres | **12 ombres diferents**, totes ad-hoc. `0 2px 12px rgba(124,116,88,0.08)` apareix 6 vegades (3 en TS + 3 en CSS) sense ser un token |
| Amplades màximes | **22 valors** (`1500px`, `1800px`, `2000px`, `1200`, `1100`, `950px`, `900`, `820`, `800`, `700`…). Un contenidor de 2000px no té cap significat de disseny |
| Motion | Durades de `0.15s` a `1.5s` sense escala; `prefers-reduced-motion` es respecta a **1** dels ~15 components animats (`ContractSheet.tsx`) |

### 2.5 CSS mort i CSS base tòxic

- **`src/App.css` (83 línies) i `src/components/components.css` (58 línies) no
  s'importen enlloc.** Són codi mort que encara es llegeix com si fos actiu.
- Tots dos defineixen `.carousel-container` **amb valors diferents**. Si algú
  n'importa un, trenca l'altre. És una bomba de rellotgeria latent.
- **`src/index.css` continua sent la plantilla d'inici de Vite**, i s'importa a
  `main.tsx`:

  ```css
  :root { color-scheme: light dark; background-color: #242424;
          color: rgba(255,255,255,0.87); }
  a { color: #646cff; }
  button { border-radius: 8px; background-color: #1a1a1a; padding: 0.6em 1.2em; }
  @media (prefers-color-scheme: light) { :root { background-color: #fff } }
  ```

  Això és un selector d'element `button` global amb fons negre sota una app
  d'Ant Design. Avui no explota perquè les classes d'antd tenen més
  especificitat, però **qualsevol `<button>` nadiu** (n'hi ha a
  `WeddingManager.css` com `.invitation-label-btn`) hereta aquests valors, i el
  `background-color: #242424` del `:root` és el que veurà l'usuari en qualsevol
  zona on el `Layout` d'antd no pinti fons. També declara `color-scheme: light
  dark`, que fa que els controls nadius del navegador es pintin en fosc segons
  el sistema operatiu de l'usuari. És soroll heretat que ningú ha decidit.

### 2.6 Quatre fonts de veritat per als breakpoints

| Mecanisme | Valor | On |
|-----------|-------|-----|
| `Grid.useBreakpoint()` d'antd | `md` = 768 | `main.header.tsx` |
| `useIsMobile()` (matchMedia propi) | 768px | `weddings/common/hooks`, usat per 4 mòduls |
| `matchMedia` ad-hoc | **600px** | `home.page.tsx`, `aboutme.tsx`, `promoVideoBackground.tsx` |
| `window.innerWidth` sense listener | 768 | `carrousel.tsx` |
| `@media` en CSS | 768 i 480 | `components.css` (mort), `WeddingManager.css` |

Tres valors diferents (480/600/768) per a la mateixa pregunta "sóc mòbil?".
`carrousel.tsx` a més llegeix `innerWidth` sense subscriure's a `resize`, per tant
no reacciona a la rotació del dispositiu.

### 2.7 Frontera de mòduls trencada: `weddings/` és la llibreria de facto

Aquest és el problema d'arquitectura més seriós, perquè és el que garanteix que
el desordre creixi amb cada mòdul nou.

```
src/components/glassCard.tsx
        ↑ re-export amb àlies
src/pages/weddings/common/components/WeddingCard.tsx   (export GlassCard as WeddingCard)
        ↑                    ↑                    ↑
booksession/DetailsFormStep  booksession/StatusCard   common/LoginCard
```

- `pages/booksession/**` importa **`WeddingCard`** de `pages/weddings/common`. Un
  formulari de reserva de sessions de fotos renderitza un component anomenat
  "targeta de boda".
- `src/common/index.ts` — que hauria de ser infraestructura genèrica — fa
  `export { useIsMobile } from '../pages/weddings/common'`. La utilitat genèrica
  viu dins d'un mòdul de domini i el barril genèric la re-exporta cap enfora.
- El mateix component té **dos noms** (`GlassCard` / `WeddingCard`) segons qui
  l'importa. Cap cerca per nom el troba tot.

Regla que s'està violant: *un mòdul no pot dependre d'un altre mòdul; només de la
capa compartida*. Avui no hi ha capa compartida real, així que el primer mòdul que
va construir alguna cosa reutilitzable (bodes) s'ha convertit en la llibreria.

### 2.8 Accessibilitat: deutes concrets, no genèrics

- **Contrast insuficient.** `#9a9a9a` sobre `#FFFDF7` (peus de contracte a
  `ContractSheet.tsx`) ≈ **2,9:1**; `#a09890` sobre `rgb(246,244,240)` (etiquetes
  de `workshop.page.tsx`) ≈ **2,7:1**. El mínim WCAG AA per a text és 4,5:1.
  *(Xifres aproximades — cal validar-les amb eina abans de fixar els tokens.)*
- **Cap estratègia de focus.** L'única regla de focus del projecte és
  `button:focus-visible { outline: 4px auto -webkit-focus-ring-color }` heretada
  de la plantilla de Vite, i només per a `<button>` nadius.
- **Motion sense opció de reducció** a 14 dels 15 components animats.

Això importa aquí més del normal: `bookingview` és **un contracte legalment
vinculant que se signa a la web**. Un contracte que no es pot llegir amb contrast
suficient és un problema de negoci, no de polish.

### 2.9 La documentació ja ha derivat del codi

`.claude/skills/design-system.md` i `shared-components.md` són bons documents,
però ja **menteixen** — cosa esperable quan la documentació és l'únic mecanisme
d'aplicació:

| El doc diu | El codi fa |
|------------|------------|
| `<FAQs image={...} />` | La prop és `imageSrc` |
| `<PricingCard onBook={...} />` | La prop és `sessionTypeId`; `onBook` no existeix |
| "Totes les imatges des de `public/` amb `getPublicPath`" | `workshop.page.tsx` té 5 URLs de Cloudinary hardcodejades |
| "No introduïu colors nous sense una raó forta" | 90 literals de color |
| Llista 6 colors com a paleta | N'hi ha 46 hex + 47 rgb |

**Conclusió transversal:** el problema no és que falti documentació. És que no hi
ha cap mecanisme que faci que la manera correcta sigui també la més fàcil. Tota
proposta d'aquest document que no vagi acompanyada d'aplicació automàtica
(secció 3.9) tornarà a derivar en sis mesos.

### 2.10 Bundle

`dist/assets/index-*.js` = **1,52 MB** sense comprimir; `index-*.css` = **3,5 KB**.
El desequilibri és perquè antd injecta tot el CSS des de JS (cssinjs) en runtime.
No és l'objecte d'aquest document, però condiciona l'eix 3.2: afegir una segona
solució CSS-in-JS empitjoraria exactament la mètrica ja dolenta.

---

## 3. Eixos de decisió

### 3.1 Eix A — On viu la veritat dels tokens

**Problema:** avui la veritat està repartida entre el `ConfigProvider` (4 tokens),
`radii.ts` (4 valors), constants locals per mòdul i 90 literals.

El criteri decisiu **no és el branding per boda** (D3: futur, no condiciona res).
És aquest: els estils han de poder deixar de ser inline (eix B), i **un fitxer
`.css` no pot llegir una constant de TypeScript**. Qualsevol solució que mantingui
els valors només en JS obliga o bé a duplicar-los en CSS a mà, o bé a afegir un
pas de codegen. Aquest és el pes real de la decisió.

| Opció | Què resol | Què costa / on falla |
|-------|-----------|----------------------|
| **A1. Constants TypeScript** (ampliar `radii.ts` a un `tokens.ts` complet) | Type-safety, autocompletat, refactor segur amb "find usages". Migració trivial des d'avui | **No arriba al CSS.** Obliga a mantenir els mateixos valors duplicats en `.module.css`, que és exactament el problema d'avui reproduït un nivell més amunt. Alternativa: codegen TS→CSS, que és més maquinària que A2 per al mateix resultat |
| **A2. CSS custom properties com a font de veritat, autoria en TS** | Un sol valor llegible alhora des de CSS, des de JS i des d'antd. Cascada i overrides per subarbre nadius, zero dependències, zero runtime | Els valors són `string` opacs en TS (`var(--lt-…)`), per tant no es poden fer càlculs en JS amb ells. A la pràctica no cal: els càlculs es fan en CSS amb `calc()` |
| **A3. Tokens d'antd com a font única** (`ConfigProvider` + `theme.useToken()`) | Coherència total amb els components d'antd, un sol lloc | El gruix del marketing és markup cru (`div`, `p`, `img`), que no rep tokens d'antd sense cridar `useToken()` a cada component → un hook a tot arreu i cap accés des de CSS. A més el vocabulari d'antd (`colorBgContainer`) no és el del disseny (`surface-editorial`) |

**Recomanació: A2, amb A3 alimentat des d'A2.**
Un únic mòdul `src/styles/tokens.ts` és l'autoria (llegible, revisable en PR). D'allà
surten dues sortides:

1. Un bloc `:root { --lt-*: … }` injectat al CSS base — que és el que consumeixen els
   `.module.css` de l'eix B.
2. L'objecte `theme` del `ConfigProvider`, els valors del qual són `var(--lt-*)`.

Antd 5.24.6 (versió instal·lada, verificat: `ThemeConfig.cssVar` existeix als tipus)
suporta `theme={{ cssVar: true }}`, que fa que els seus propis tokens s'emetin com a
variables CSS. El benefici **avui** és que hi ha una sola definició de la marca en
lloc de dues (una per a antd, una per al markup propi) i que antd deixa de
recalcular estils quan el tema canvia.

*Efecte secundari gratuït, no la raó de la tria:* aquesta estructura fa que un futur
dark mode o un branding per boda siguin sobreescriure variables en un subarbre, en
lloc d'un refactor. No es construeix res per a això ara.

Prefix `--lt-` (Laura Trias) per no col·lidir amb `--ant-*`.

### 3.2 Eix B — Com es declara l'estil

**Problema:** 325 objectes inline, sense pseudo-classes ni media queries, amb
duplicació literal entre fitxers.

| Opció | Què resol | Què costa / on falla |
|-------|-----------|----------------------|
| **B1. Inline disciplinat** (objectes compartits en `styles.ts` per mòdul) | Migració mínima, cap eina nova | No resol el problema de fons: segueix sense `:hover`, `:focus-visible`, `@media`, `@media (prefers-reduced-motion)`. És el que ja s'ha intentat (`booksession/styles.ts`) i que ja s'ha duplicat |
| **B2. CSS Modules** (nadiu a Vite, zero dependències) | CSS real: pseudo-classes, media queries, cascada; scoping per fitxer sense convenció de noms; s'extreu a `.css` (no penalitza el JS); casa perfectament amb les CSS vars de l'eix A | Fitxer separat per component (2 fitxers en lloc d'1). Els valors dinàmics (una alçada calculada) segueixen anant inline o per CSS var |
| **B3. antd cssinjs** (`@ant-design/cssinjs`, ja al `package.json` però **sense usar**) | Co-localització, API familiar per a qui ve d'antd | Afegeix runtime de CSS-in-JS al bundle que ja pesa 1,5 MB per aquesta mateixa raó. Estil calculat en render |
| **B4. Tailwind** | Escala molt bé, tokens per disseny, purga el CSS no usat | Xoca amb el reset i l'especificitat d'antd (**[D1]** el manté); reescriptura total del marcatge; el marketing editorial (títols `clamp` grans, composicions úniques) és on Tailwind menys aporta |
| **B5. vanilla-extract** | Zero-runtime + type-safety total | Dependència + build plugin + corba d'aprenentatge, per a un equip petit i una app d'aquesta mida |

**Recomanació: B2 (CSS Modules) com a mecanisme per defecte**, amb tres excepcions
explícitament permeses:

1. **Props d'estil d'antd** (`styles={{ body: … }}`, `size`, `variant`): és l'API del
   component, s'usa tal com és.
2. **Valors dinàmics de veritat**: passar-los com a CSS var inline
   (`style={{ '--card-h': h }}`) i consumir-los des del mòdul CSS.
3. **Framer Motion**: `initial/animate/variants` continuen en JS (és la seva API).

Tot valor estàtic que avui és inline ha d'acabar en un `.module.css`. Aquesta és la
regla que farà complir el lint de l'eix 3.9.

### 3.3 Eix C — Escala d'espaiat

**Problema:** 18 valors sense escala; cap token més enllà de `pageBodyPadding`.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **C1. Base 4px, escala numèrica** (`--lt-space-1..12`) | La majoria de valors actuals ja són múltiples de 4 → migració quasi mecànica. Prou granularitat per a densitat d'admin | Els outliers actuals (2, 6, 10, 14, 18, 25, 26, 30) s'han d'arrodonir; canvis visuals de ±2px en alguns llocs |
| **C2. Base 8px** | Escala més curta, ritme vertical més estricte | Obliga a retocar 12, 20 i 28, que són dels valors més usats (19 + 9 + 1 usos). Massa fricció per al benefici |
| **C3. Noms t-shirt** (`xs/sm/md/lg/xl`) | Llegible, semàntic | 6–7 valors màxim; a la pràctica genera la discussió "necessito una cosa entre md i lg" i s'acaba amb `md-plus` |

**Recomanació: C1**, amb àlies semàntics per als 4 usos recurrents
(`--lt-space-gutter` = 24, `--lt-space-section` = 48, `--lt-space-page` = 24,
`--lt-space-stack` = 16) perquè el codi de layout es llegeixi per intenció i no
per xifra.

### 3.4 Eix D — Escala tipogràfica

**Problema:** 31 `clamp()` diferents i 7 grafies de família, la meitat sense fallback.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **D1. Statu quo** amb `clamp()` per ús | Res | 31 → 50 amb el proper mòdul |
| **D2. Escala fixa en rem + overrides per breakpoint** | Previsible, fàcil de raonar | Molt més CSS; salts de mida en canviar de breakpoint, cosa que a un portfoli editorial es nota |
| **D3. Escala fluida amb 7 passos anomenats**, cada pas un `clamp()` definit una sola vegada | Cobreix els 31 casos actuals amb 7 tokens; escalat continu (millor per a editorial); un sol lloc on ajustar el ritme | Cal mapejar els 31 valors actuals a 7 passos → alguns textos canvien 1–2px |

**Recomanació: D3.** Mapatge proposat dels valors existents (secció 5.3).

Complement obligatori en els tres casos: **3 tokens de família**
(`--lt-font-display`, `--lt-font-body`, `--lt-font-script`), cadascun amb la seva
pila de fallback completa, i **prohibició de `fontFamily` inline** via lint. Això
sol ja arregla el salt de layout dels títols sense fallback (secció 2.3).

### 3.5 Eix E — Arquitectura de color

**Problema:** 90 literals, tres noms per al mateix color, 10 grisos per a 3 nivells de
jerarquia reals.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **E1. Paleta plana** (`--lt-olive`, `--lt-cream`…) | Elimina els literals; migració directa i mecànica | No diu *quan* usar cada color. `--lt-olive-500` en un botó, en una vora i en un text són tres intencions diferents amb el mateix nom: quan calgui pujar el contrast del text (2.8), o es toca el botó també, o es torna a hardcodejar |
| **E2. Dues capes: primitives + semàntics** | Les primitives són valors (`--lt-olive-500`), els semàntics són intencions (`--lt-color-text-primary`, `--lt-color-border-subtle`, `--lt-color-status-danger`). Permet arreglar els 4 problemes de contrast tocant **un** token sense repintar la marca | Un nivell d'indirecció més a aprendre. ~30 tokens en lloc de ~16 |
| **E3. Tres capes** (+ tokens per component: `--lt-card-bg`…) | Màxim control, ideal per a multi-marca real | Sobredimensionat per a 5 mòduls i un equip petit. Es pot afegir després sense trencar E2 |

**Recomanació: E2.** El motiu és d'avui, no de futur: els deutes d'accessibilitat de
la secció 2.8 (`#9a9a9a` a 2,9:1) es corregeixen movent
`--lt-color-text-muted` a una primitiva més fosca, i això no ha de tenir cap efecte
sobre la vora, la pastilla d'estat ni el botó que casualment comparteixen família de
color. Amb E1 això és impossible sense revisar els 90 usos un per un.

*Efecte secundari:* si algun dia entra branding per boda o dark mode, la capa
semàntica ja marca la frontera del que és personalitzable (marca, superfícies) i del
que no ho és mai (estats, anell de focus, contrastos de text).

### 3.6 Eix F — Breakpoints

**Problema:** 3 valors diferents (480/600/768) i 4 mecanismes per a la mateixa pregunta.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **F1. Adoptar els breakpoints d'antd** (xs 480 / sm 576 / md 768 / lg 992 / xl 1200 / xxl 1600) i derivar-ho tot d'ells | Coherència gratuïta amb `Row/Col` i `Grid.useBreakpoint()`, que ja s'usen a tot arreu ([D1]). Un sol valor per breakpoint compartit entre CSS i JS | Els punts de 600px actuals passen a 576 o 768 → canvi de comportament en 3 pàgines, cal validar-lo visualment |
| **F2. Escala pròpia** | Ajustada al contingut real (portfoli amb fotos 2:3) | Obliga a sobreescriure els tokens de `Grid` d'antd i a mantenir dues taules sincronitzades |

**Recomanació: F1.** A més:
- `useIsMobile()` passa a `src/ui/hooks` i llegeix la constant compartida.
- Es prohibeix `window.matchMedia` i `window.innerWidth` directes fora d'aquest hook
  (lint), cosa que de passada arregla el bug de `carrousel.tsx`, que avui no
  reacciona al `resize` ni a la rotació del dispositiu.

### 3.7 Eix G — Frontera de mòduls i ubicació dels components

**Problema:** secció 2.7 — `pages/weddings/common` s'ha convertit en la llibreria
compartida, `src/common` re-exporta des d'un mòdul de domini, i el mateix component
té dos noms.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **G1. Tres capes explícites** — `src/ui` (primitives sense domini) → `src/components` (blocs de marketing) → `src/pages/<mòdul>/components` (privats del mòdul) | Fa que la pregunta "on va això?" tingui una resposta objectiva. Permet imposar-la amb `no-restricted-imports` (un mòdul no importa d'un altre mòdul) | Moure ~10 fitxers i renombrar `GlassCard`. És un canvi d'imports gran però mecànic — assumible amb [D2] |
| **G2. Workspaces / paquets per mòdul** | Frontera imposada per l'empaquetador, no per convenció | Prematur: una sola app, un sol desplegament, un sol equip. Afegeix build i versionat sense cap benefici avui |
| **G3. Deixar-ho i documentar-ho** | Cost zero | És l'opció que ja s'ha provat: `design-system.md` existeix i el codi n'ha derivat igualment (2.9). Amb un monolit modular que afegeix mòduls, el deute creix per disseny |

**Recomanació: G1.** Renombrar `GlassCard`/`WeddingCard` → **`SurfaceCard`** (nom
que descriu la forma, no el domini) i moure'l a `src/ui`. `useIsMobile` →
`src/ui/hooks`. `MobileShell`, `DesktopSplitBackground`, `MobileSwiper` → `src/ui`
(els usa login d'admin, no només bodes).

### 3.8 Eix H — Branding per boda *(fora d'abast — anàlisi preparatòria)*

**[D3]: futur llunyà. No es construeix res d'aquesta secció, i cap decisió dels
eixos A–G s'ha pres per facilitar-lo.** Queda documentat aquí per dues raons: perquè
`WeddingGuest/custom/carla-joel/` ja existeix i cal saber què se'n fa mentrestant, i
perquè el dia que entri en agenda no calgui refer aquesta anàlisi.

**Situació actual:** l'únic mecanisme de personalització és un component sencer a
mida per boda. Funciona i no fa mal a ningú, però N bodes = N components.

**Decisió d'ara:** `custom/carla-joel/` **es queda tal com està** i es documenta com
a *excepció acceptada*, no com a patró a seguir. No s'hi inverteix ni per
generalitzar-lo ni per eliminar-lo.

**Quan arribi el moment** — les opcions, sense recomanació ferma perquè el context
haurà canviat:

| Opció | Què resoldria | Cost / risc |
|-------|---------------|-------------|
| H1. Temes estàtics en CSS (`[data-theme="carla-joel"] { --lt-color-brand: … }`) | Simple, revisable en PR, zero risc d'injecció | Cada boda nova = commit + desplegament |
| H2. Tema des de l'API aplicat com a custom properties al wrapper de la boda | Boda nova sense desplegar | Requereix contracte amb l'API i validació estricta de valors (avís sota) |
| H3. Component a mida per boda (statu quo) | Llibertat total de layout | No escala; només justificable quan el layout és realment únic |

> **Nota de seguretat, per si algun dia s'implementa H2.** Si els valors del tema
> venen de l'API i s'escriuen amb `element.style.setProperty('--lt-color-brand', v)`,
> `v` és text controlat per dades. Una custom property accepta qualsevol token CSS;
> si un consumidor la fa servir en un context com `background: var(--x)`, un valor
> tipus `url(https://…)` genera una petició externa (filtració d'IP dels convidats).
> Caldria llista blanca estricta al client (regex per a `#rgb`/`#rrggbb`, `rgb()`,
> `hsl()`; enum tancat de famílies) **i** validació al backend. Anotat aquí perquè
> no es descobreixi el dia de la implementació.

### 3.9 Eix I — Aplicació i governança

**Problema:** secció 2.9. La documentació sola ja ha fallat en aquest repositori.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **I1. Documentació** (actualitzar `.claude/skills/design-system.md`) | Zero cost, ajuda l'onboarding i els agents | Ja demostrat insuficient aquí |
| **I2. Documentació + ESLint + CI** | Fa que la infracció sigui **impossible de mergear**, no només desaconsellada. És l'única manera que el resultat de [D2] no torni a derivar | Mig dia de configuració; algun fals positiu inicial |
| **I3. I2 + Storybook + regressió visual** (Chromatic/Playwright) | Detecta canvis visuals no volguts; catàleg viu que substitueix `shared-components.md` (que ja menteix) | Dependència gran + temps de CI + manteniment d'stories. Val la pena **quan** hi hagi més d'un desenvolupador tocant UI |

**Recomanació: I2 ara, I3 com a fase opcional posterior.** Regles concretes:

```js
// eslint.config.js — esbós
'no-restricted-syntax': [
  'error',
  { selector: "Property[key.name='fontFamily']",
    message: 'Usa var(--lt-font-*) en un .module.css, no fontFamily inline.' },
  { selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,8})$/]",
    message: 'Color literal prohibit. Usa un token semàntic --lt-color-*.' },
  { selector: "CallExpression[callee.property.name='matchMedia']",
    message: 'Usa useBreakpoint()/useIsMobile() de @ui/hooks.' },
],
'no-restricted-imports': [
  'error',
  { patterns: [
      { group: ['**/pages/*/**'], message: 'Un mòdul no importa d’un altre mòdul. Puja-ho a src/ui.' },
      { group: ['antd/es/**'],     message: 'Importa des de "antd", no de rutes internes.' },
  ]},
],
```

*(Nota: la regla de colors literals necessitarà una excepció per a
`src/styles/tokens.ts`, que és precisament on han de viure.)*

### 3.10 Eix J — CSS base i càrrega de fonts

**Problema:** `index.css` és la plantilla de Vite amb tema fosc; `App.css` i
`components.css` són codi mort amb classes col·lidents; 7 famílies carregades, 2 sense usar.

| Opció | Què resol | Què costa |
|-------|-----------|-----------|
| **J1. Google Fonts consolidat** (un `<link>`, treure `Prata` i `Sour Gummy`) | 2 peticions menys, 5 minuts de feina | Segueix depenent d'un tercer per al render: una petició extra de DNS/TLS abans del primer text, i les fonts servides des d'un CDN de Google |
| **J2. Auto-allotjar amb `@fontsource/*`** (Raleway, Italiana, Borel, Playfair Display, Indie Flower) | Elimina el tercer domini del camí crític → LCP més ràpid; control de `font-display` i de subsets; sense transferència d'IP dels visitants a un tercer (rellevant per a RGPD en un negoci amb clients a la UE) | +5 dependències de dev i ~200–400 KB d'assets propis (servits del mateix host, amb hash i cache llarga) |

**Recomanació: J2.** L'argument decisiu no és el rendiment sinó que la web ja
recull dades personals (reserves, DNI al contracte, convidats de boda); treure una
transferència d'IP no necessària cap a un tercer és net i barat.

En tots dos casos: **esborrar `App.css` i `components.css`** i substituir
`index.css` per un `src/styles/base.css` que contingui només (a) `:root` amb els
tokens, (b) `box-sizing`, (c) `:focus-visible` global amb el token d'anell de
focus, (d) `@media (prefers-reduced-motion: reduce)` global. Antd ja aporta el seu
propi reset; no cal duplicar-lo ni contradir-lo.

---

## 4. Arquitectura objectiu

```
src/
  styles/
    tokens.ts          # ÚNICA autoria de valors (primitives + semàntics)
    tokens.css         # :root { --lt-* } generat/derivat de tokens.ts
    base.css           # reset mínim, focus-visible, reduced-motion
    antd-theme.ts      # ThemeConfig amb cssVar:true, valors = var(--lt-*)
  ui/                  # CAPA 1 — primitives, ZERO domini
    SurfaceCard/       # (avui GlassCard/WeddingCard)
    MobileShell/  DesktopSplitBackground/  MobileSwiper/
    Section/  Stack/  PageContainer/
    hooks/             # useBreakpoint, useIsMobile
  components/          # CAPA 2 — blocs editorials de marketing
    CustomTitle/  FAQs/  PricingCard/  Carrousel/  WhyDoSession/ …
  pages/<mòdul>/
    components/        # CAPA 3 — privats del mòdul, mai importats des de fora
```

**Regla de dependència (imposada per lint):** capa 3 → capa 2 → capa 1 → tokens.
Mai al revés, mai lateral entre mòduls.

**Flux de tokens:**

```
tokens.ts ──┬─→ tokens.css  :root{--lt-*}  ──→ *.module.css      (markup propi)
            └─→ antd-theme.ts (cssVar:true) ──→ ConfigProvider   (components antd)
```

Una sola definició de cada valor, consumida pels dos móns. És l'única part de
l'arquitectura que no es pot ajornar: tot el pla de la secció 6 hi depèn.

---

## 5. Proposta concreta de tokens

Derivada dels valors **realment usats** avui, no inventada. Els valors marcats amb
⚠️ canvien respecte de l'actual i necessiten validació visual.

### 5.1 Color — primitives

| Token | Valor | Origen |
|-------|-------|--------|
| `--lt-olive-700` | `#5C5440` | Capçalera admin/manager |
| `--lt-olive-500` | `#7C7458` | `colorPrimary`, 22 usos manuals |
| `--lt-olive-300` | `#A09880` | Gradients d'estat |
| `--lt-sand-500` | `rgb(174,142,116)` | Text decoratiu |
| `--lt-ink-900` | `#231F20` | Fons secció fosca |
| `--lt-ink-700` | `#3D3228` | Text fort de manager |
| `--lt-ink-500` | `#4A4539` | Text de contracte |
| `--lt-grey-600` | `#5A5A5A` | Etiquetes de formulari |
| `--lt-grey-500` | `#6A6A6A` | Text de cos secundari |
| `--lt-warm-400` | `#6E675A` ⚠️ | Unifica `#888`/`#9a9a9a`/`#9a9080`/`#a09890`/`#a09880` — l'únic to càlid que passa AA (5.2) |
| `--lt-olive-600` | `#6a6450` ⚠️ | Brand utilitzable com a text petit (5.2) |
| `--lt-paper-100` | `#FFFDF7` | Full de contracte |
| `--lt-paper-200` | `#F6F4F0` | Fons d'app (`rgb(246,244,240)`) |
| `--lt-paper-300` | `#F5F0EA` | Fons de mobile shell |
| `--lt-cream-100` | `#FFF9E5` | Secció FAQs |
| `--lt-success-500` | `#5E8A4E` | Pastilla "Confirmat" |
| `--lt-danger-500` | `#B06A3A` | Pastilla "Rebutjat" |

### 5.2 Color — semàntics (la capa que consumeix el codi)

| Token | → primitiva | Substitueix avui |
|-------|-------------|------------------|
| `--lt-color-brand` | `--lt-olive-500` | 22 literals `#7C7458` + `COLOR_OLIVE` + `OLIVE` |
| `--lt-color-brand-strong` | `--lt-olive-700` | `#5C5440` (capçaleres admin/manager) |
| `--lt-color-accent` | `--lt-sand-500` | `rgb(174,142,116)` en 5 grafies |
| `--lt-color-surface-page` | `--lt-paper-200` | `rgb(246,244,240)` ×10 |
| `--lt-color-surface-card` | `rgba(255,255,255,0.9)` | Targeta de vidre + variants a 0.95/0.97 |
| `--lt-color-surface-inverse` | `--lt-ink-900` | `#231f20` (secció fosca) |
| `--lt-color-text-primary` | `--lt-ink-500` | `#333`, `#444`, `#4a4539` |
| `--lt-color-text-secondary` | `--lt-grey-500` | `#5a5a5a`, `#6a6a6a` |
| `--lt-color-text-muted` | `--lt-warm-400` = `#6E675A` ⚠️ | `#888`, `#9a9a9a`, `#9a9080`, `#a09890`, `#a09880`, `#c4c0b4` — **tots fallaven AA** (Q2) |
| `--lt-color-text-brand` | `--lt-olive-600` = `#6a6450` ⚠️ | Usos de `#7C7458` com a **text petit** (`LabelTag` 13px, `.manager-title`) — el brand a 4,25:1 no arriba a AA |
| `--lt-color-text-on-brand` | `#FFF` | `#fff` ×12 |
| `--lt-color-border-subtle` | `rgba(124,116,88,0.25)` | `RULE` + 6 variants d'opacitat |
| `--lt-color-status-success` | `--lt-success-500` | Pastilla "Confirmat" |
| `--lt-color-status-danger` | `--lt-danger-500` | Pastilla "Rebutjat" |
| `--lt-color-focus-ring` | `--lt-olive-700` | *(no existeix avui — deute d'a11y 2.8)* |

Els grisos de text i els estats són **fixos per definició**: són contrast i
semàntica, no marca. Si algun dia hi ha temes variables, aquesta columna ja marca la
frontera.

**Contrastos verificats** (WCAG 2.1, càlcul sobre les 5 superfícies del sistema —
Q2 tancada):

| Color | Millor cas | Pitjor cas | Veredicte |
|-------|-----------|-----------|-----------|
| `#333` / `#444` / `#4a4539` | 12,6:1 | 8,4:1 | AAA — es queden |
| `#5a5a5a` | 6,9:1 | 6,1:1 | AA — es queda |
| `#6a6a6a` | 5,4:1 | 4,8:1 | AA — es queda |
| `#888` | 3,5:1 | 3,1:1 | **Només text gran** |
| `#9a9080` | 3,2:1 | 2,8:1 | **Falla** |
| `#9a9a9a` · `#a09890` · `#a09880` | 2,8:1 | 2,5:1 | **Falla a tot arreu** |
| `#c4c0b4` | 1,8:1 | 1,6:1 | **Falla greument** |
| `#7C7458` (brand) | 4,7:1 | **4,1:1** | **Falla com a text petit** |
| **`#6E675A` (proposat)** | 5,6:1 | **4,9:1** | **AA a totes les superfícies** |
| **`#6a6450` (proposat)** | 5,9:1 | **5,2:1** | **AA** — brand utilitzable com a text |

`#6E675A` es tria en lloc d'un gris neutre (`#6a6a6a`) perquè conserva el to càlid
de la paleta actual; el gris fred trencaria el registre editorial. Blanc sobre
`#7C7458` dona 4,67:1 → els botons primaris estan bé i no es toquen.

### 5.3 Tipografia

**Famílies** — 5 tokens, cap `fontFamily` inline (Q1 resolta: es mantenen les cinc
famílies en ús; cada una té una funció distinta i identificable):

```
--lt-font-display:     'Italiana', Georgia, 'Times New Roman', serif;   /* hero, títols */
--lt-font-body:        'Raleway', system-ui, -apple-system, sans-serif; /* tot el text corrent */
--lt-font-editorial:   'Playfair Display', Georgia, serif;              /* FAQs, familiar */
--lt-font-handwritten: 'Indie Flower', 'Segoe Script', cursive;         /* WhyDoSession */
--lt-font-signature:   'Borel', 'Brush Script MT', cursive;             /* signatura del contracte */
```

Cada token porta la seva pila de fallback completa — és el que arregla el salt de
layout dels 13 `"Italiana"` sense serif de reserva (2.3).
`Prata` i `Sour Gummy` s'eliminen: no s'usen enlloc.

**Escala** — els 31 `clamp()` actuals mapejats a 7 passos:

| Token | `clamp()` | Substitueix (valors actuals) |
|-------|-----------|------------------------------|
| `--lt-text-hero` | `clamp(3rem, 6vw, 6rem)` | `clamp(3rem,6vw,6rem)`, `clamp(3rem,5vw,5rem)` |
| `--lt-text-display` | `clamp(2rem, 5vw, 2.8rem)` | `clamp(2rem,5vw,2.8rem)`, `clamp(1.9rem,5vw,2.6rem)`, `clamp(1.8rem,7vw,2.4rem)` |
| `--lt-text-title` | `clamp(1.6rem, 3vw, 3rem)` | `clamp(1.6rem,3vw,3rem)` ×2, `clamp(1.6rem,3vw,4rem)`, `clamp(1.6rem,6vw,2rem)` |
| `--lt-text-heading` | `clamp(1.4rem, 3vw, 1.8rem)` | `clamp(1.4rem,3vw,1.8rem)` ×4, `clamp(1.4rem,2.4vw,1.9rem)`, `clamp(1.5rem,4vw,2.1rem)` |
| `--lt-text-subheading` | `clamp(1.05rem, 2.2vw, 1.3rem)` | `clamp(1.05rem,2.2vw,1.2rem)`, `clamp(1.1rem,2vw,1.3rem)` |
| `--lt-text-body` | `clamp(0.9rem, 1.4vw, 1.05rem)` | `clamp(0.9rem,1.4vw,1rem)` ×4, `clamp(0.9rem,1.4vw,1.05rem)` ×3, `clamp(0.9rem,1.3vw,1rem)`, `clamp(0.85rem,1.5vw,1rem)` |
| `--lt-text-caption` | `clamp(0.85rem, 1.3vw, 0.9rem)` | `clamp(0.85rem,1.3vw,0.9rem)` ×4, `clamp(0.8rem,1.2vw,0.85rem)` ×2, `clamp(0.88rem,1.4vw,0.95rem)`, `0.78rem`, `0.7rem` |

31 → 7. Cap pas perd un cas d'ús real.

### 5.4 Espaiat, radis, ombres, contenidors, motion

```
/* espaiat — base 4 */
--lt-space-1: 4px;   --lt-space-2: 8px;   --lt-space-3: 12px;  --lt-space-4: 16px;
--lt-space-5: 20px;  --lt-space-6: 24px;  --lt-space-8: 32px;  --lt-space-10: 40px;
--lt-space-12: 48px; --lt-space-16: 64px;
/* àlies d'intenció */
--lt-space-page: var(--lt-space-6);      /* substitueix pageBodyPadding */
--lt-space-gutter: var(--lt-space-6);    /* gutter={[24,24]} */
--lt-space-section: var(--lt-space-12);

/* radis — el token actual es manté i s'amplia */
--lt-radius-xs: 0.1rem;  --lt-radius-sm: 0.3rem;  --lt-radius-md: 0.5rem;
--lt-radius-lg: 12px;    --lt-radius-sheet: 24px; --lt-radius-pill: 999px;

/* ombres — 12 ad-hoc → 4 nivells */
--lt-shadow-sm: 0 2px 8px rgba(0,0,0,.08);
--lt-shadow-md: 0 2px 12px rgba(124,116,88,.08);   /* la que ja es repeteix 6 cops */
--lt-shadow-lg: 0 10px 28px rgba(0,0,0,.12);
--lt-shadow-sheet: 0 10px 40px rgba(124,116,88,.12);

/* contenidors — 22 amplades → 4 */
--lt-container-form: 520px;    /* login, passos de reserva */
--lt-container-text: 820px;    /* contracte, text llarg */
--lt-container-page: 1200px;   /* admin, manager */
--lt-container-wide: 1500px;   /* galeries de marketing */

/* motion */
--lt-duration-fast: 150ms;  --lt-duration-base: 300ms;  --lt-duration-slow: 800ms;
--lt-ease-out: cubic-bezier(.22,1,.36,1);
```

Les amplades de `1800px` i `2000px` actuals desapareixen: per sobre de ~1500px el
contingut editorial es fa il·legible i cap disseny les demana explícitament.

---

## 6. Pla de migració (big-bang per capes) **[D2]**

Cinc fases. Cada una és mergeable i té criteri de sortida verificable. L'ordre no és
negociable: cada fase depèn de l'anterior.

| Fase | Abast | Criteri de sortida |
|------|-------|--------------------|
| **F0. Neteja** | Esborrar `App.css` i `components.css` (morts). Substituir `index.css` per `base.css` mínim. Treure `Prata` i `Sour Gummy`. Consolidar `<link>` de fonts o migrar a `@fontsource` (eix J) | L'app es veu idèntica; `grep -r "carousel-container"` no retorna definicions duplicades |
| **F1. Tokens** | `styles/tokens.ts` + `tokens.css` + `antd-theme.ts` amb `cssVar: true`. `ConfigProvider` consumeix el tema nou. `radii.ts` es manté com a re-export deprecat | `--lt-*` disponibles a tot arreu; cap canvi visual; `theme.cssVar` verificat a l'inspector |
| **F2. Capes** | Crear `src/ui`. Moure `SurfaceCard` (ex `GlassCard`/`WeddingCard`), `MobileShell`, `DesktopSplitBackground`, `MobileSwiper`, `useIsMobile`. Actualitzar imports. Alies `@ui`, `@styles` a `vite.config.ts` + `tsconfig` | `pages/booksession` no importa res de `pages/weddings`; `src/common` no re-exporta des de `pages/` |
| **F3. Governança** | Regles ESLint de l'eix I2 + pas de lint a `.github/workflows`. **Es fa aquí, no al final**: a partir d'ara F4 no pot reintroduir el que s'està esborrant | `npm run lint` falla amb un color literal o un `fontFamily` inline nou |
| **F4. Migració per mòduls** | Convertir `style={{}}` → `.module.css` amb tokens, mòdul a mòdul. Ordre proposat per risc/valor: `bookingview` (a11y de contracte) → `booksession` → `admin` → `weddings` → marketing. Inclou corregir els contrastos de 2.8 i afegir `prefers-reduced-motion` | 0 literals de color/font fora de `tokens.ts`; els 325 objectes inline baixen a < 40 (només dinàmics justificats) |

**Fora d'abast (futur, sense data):** branding per boda (eix H, per [D3]); Storybook +
regressió visual (eix I3); auditoria del bundle d'antd (1,5 MB, secció 2.10).

**Estimació d'esforç** (dev sol, coneixent el codi): F0 ≈ 0,5 d · F1 ≈ 1,5 d ·
F2 ≈ 1 d · F3 ≈ 0,5 d · F4 ≈ 4–6 d. **Total ≈ 8–10 dies**, amb F4 com a única fase
realment llarga i, alhora, l'única interrompible sense deixar el sistema
inconsistent (F0–F3 s'han de completar seguides).

---

## 7. Riscos

| Risc | Probabilitat | Mitigació |
|------|--------------|-----------|
| F4 s'atura a mig camí i conviuen dos sistemes indefinidament | Alta (és el patró habitual) | F3 (lint) va **abans** de F4: el codi nou ja neix correcte encara que el vell trigui. Migrar per mòduls complets, mai a mitges |
| Deriva visual acumulada per arrodoniments (±2px d'espaiat, 1–2px de tipografia) | Alta, impacte baix | Captures abans/després per pàgina a cada PR de F4. És el substitut barat de la regressió visual mentre no hi hagi Storybook |
| `theme.cssVar` d'antd es comporta diferent del previst en algun component | Mitjana | Validar-ho a F1 amb `Button`, `Card`, `Table` i `Steps` **abans** de construir-hi res a sobre. Si falla: `ConfigProvider` amb valors literals i els `.module.css` seguint amb `var(--lt-*)`; es perd la definició única de la marca, no el pla |
| El canvi de breakpoint 600 → 576/768 trenca el layout de `home`, `aboutme` o `promoVideoBackground` | Mitjana, impacte baix | Són 3 fitxers; validació manual a F2 en dispositiu real, no només al DevTools |
| El `.claude/skills/design-system.md` torna a derivar | Alta | Reduir-lo a *regles* i enllaçar `tokens.ts` com a font de veritat, en lloc de repetir-ne els valors. La documentació no ha de contenir cap valor duplicat (és exactament el que ha fallat, 2.9) |

---

## 8. Punts tancats

Cap punt obert. Les cinc qüestions plantejades a la primera versió d'aquest document
queden resoltes així:

| # | Qüestió | Resolució | Efecte |
|---|---------|-----------|--------|
| Q1 | Consolidació tipogràfica | **Es mantenen les 5 famílies en ús.** Cada una té funció pròpia i identificable | 5 tokens de família (5.3). `Prata` i `Sour Gummy` s'eliminen igualment: no s'usen |
| Q2 | Contrastos | **Calculats, no estimats** (WCAG 2.1 sobre les 5 superfícies). 6 colors de text fallen AA; el propi color de marca falla com a text petit | `--lt-color-text-muted` = `#6E675A`; nou `--lt-color-text-brand` = `#6a6450`. Taula completa a 5.2 |
| Q3 | Cloudinary a `workshop.page.tsx` | **Fora d'abast.** Es documenta com a excepció coneguda i no es toca | `getPublicPath` continua sent la regla per a tota la resta. No genera cap tasca |
| Q4 | `@media print` del contracte | **No cal.** El PDF signat el genera el servidor (`GET /api/bookings/{token}/contract/pdf`); la pàgina no és l'artefacte imprimible | Cap regla de print. Si algú fa Ctrl+P té el botó de descàrrega al costat |
| Q5 | `main.header_old.tsx` | **S'esborra.** Verificat: cap import en tot `src/` | Entra a la tasca T0.1 amb la resta de codi mort |

> Q2 és l'únic punt que canvia l'aparença a propòsit. Els 6 colors afectats són
> text secundari (peus de contracte, etiquetes de taller, pastilles del manager):
> el canvi es nota poc i corregeix un incompliment real d'accessibilitat en un flux
> que inclou la signatura d'un contracte.

---

## 9. Resum executiu

**El problema real** no és que hi hagi estils desordenats; és que **no hi ha cap
lloc correcte on posar-los**. La documentació de disseny existeix i ja ha derivat
del codi, cosa que demostra que la convenció sola no aguanta. Amb un backend que
és un monolit modular i que continuarà afegint mòduls, cada mòdul nou reprodueix
el desordre des de zero — com ja s'observa comparant `WeddingManager`,
`booksession` i `bookingview`, que resolen el mateix problema tres vegades amb
tres vocabularis diferents.

**La proposta**, en una frase: *tokens en CSS custom properties com a font única de
veritat, CSS Modules com a mecanisme de declaració, i tres capes de components amb
la frontera imposada per lint en lloc de per convenció.*

Res d'això es tria pensant en el branding per boda, que és futur llunyà i queda fora
d'abast; si algun dia arriba, aquesta estructura ja el suporta sense refactor, però
no és el motiu de cap decisió.

**El que fa que aquesta vegada aguanti** no és cap de les tres decisions
tècniques: és la **fase F3** (lint + CI abans de la migració massiva). Sense això,
aquest document té una vida útil de sis mesos.
