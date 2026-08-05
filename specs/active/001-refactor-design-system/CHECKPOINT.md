# Checkpoint — 001-refactor-design-system

**Última actualització:** després de completar T4.2 (booksession) + 3 fixes de regressió visual trobats per QA manual de l'usuari.
**Branch:** `feature/booking` (canvis encara NO commitejats — 86+ fitxers tocats).
**Mode:** execució automàtica sense parar per tasca (tasks.md), revisió al final.

## ⚠️ Regressions trobades i corregides després de T1.3 (llegir abans de tocar antd-theme.ts)

1. **Botons/títols trencats**: `antd-theme.ts` passava strings `var(--lt-*)` com a valors de token d'antd. L'algorisme de color intern d'antd (hover/active/disabled) necessita un color parsejable, no una referència CSS — es trencava tot el que depenia de `colorPrimary`/`colorText`. Fix: usar els valors REALS de `tokens.ts` (no `tokens.css`) dins `antd-theme.ts`; `cssVar:true` ja fa que antd generi les seves `--ant-*` a partir d'aquests valors.
2. **Lletres marrons en lloc de negres**: `colorText` s'havia mapejat a `semantic.colorTextPrimary` (ink-500, #4A4539 — un marró pensat per al text del contracte), substituint l'original `#333` del `ConfigProvider`. Fix: `colorText: '#333333'` (valor original, sense token perquè no n'hi ha cap d'exacte encara).
3. **Fons de pàgina més marró que abans**: `colorBgLayout`, `colorBorder`, `colorError`, `colorSuccess`, `colorTextSecondary` i `borderRadius:8` NO existien al `ConfigProvider` original (que només tenia `colorPrimary`, `colorLink`, `colorText`, `fontFamily`) — introduir-los ara TRENCA el criteri "cap canvi visual" de F1. Fix: **`antd-theme.ts` ara només fixa `colorPrimary`, `colorText`, `fontFamily` + breakpoints** (aquests últims són els mateixos valors per defecte d'antd, sense canvi). Si en algun moment es vol introduir aquests altres tokens de manera deliberada, cal fer-ho com a tasca pròpia amb revisió visual explícita, no dins T1.3.

**Lliçó per a la resta de la migració:** el `tasks.md` original d'aquest spec definia un "mapatge mínim" més ampli a T1.3 que el que hi havia realment a l'app — seguir-lo literalment introdueix canvis visuals no volguts. A partir d'ara, qualsevol token nou d'antd (`ConfigProvider`) que no existís abans s'ha de proposar i verificar visualment abans de fixar-lo, no assumir que "existeix un semantic amb un nom semblant" vol dir que és el valor correcte per a aquell context.

## Fet (F0–F3 completes, F4 en curs)

| Fase | Estat |
|------|-------|
| F0 — Neteja (T0.1–T0.4) | ✅ Completa |
| F1 — Tokens (T1.1–T1.6) | ✅ Completa |
| F2 — Capes (T2.1–T2.6) | ✅ Completa |
| F3 — Governança (T3.1–T3.4) | ✅ Completa |
| F4 — Migració (T4.1–T4.10) | 🔶 T4.1, T4.2 fets. **Pendents: T4.3–T4.10** |

Detall F4 fet:
- **T4.1 bookingview**: `BookingViewPage`, `ContractSheet`, `SignaturePad` → `.module.css` + tokens. Constants locals `OLIVE`/`INK`/`RULE` eliminades.
- **T4.2 booksession**: `booksession.tsx` + 6 components de pas + `styles.ts` (esborrat). Duplicació `labelStyle`/`inputStyle` amb `LoginCard` resolta amb `src/ui/formStyles.module.css` compartit. També creat `src/ui/pageContainer.module.css` compartit (bookingview + booksession).

Objectes `style={{...}}` restants a tot `src/`: **267** (partint de 325; objectiu final <40). Verificat amb:
```bash
grep -rc "style={{" src/ | awk -F: '{s+=$2} END {print s}'
```

## Pendent — per ordre (tasks.md)

- **T4.3** admin — `AdminPanel`, `AdminLogin`, 3 tabs, `FeaturesEditor`. Unificar capçalera amb `WeddingManager.css` en una primitiva `AppBar` a `@ui`.
- **T4.4** weddings/WeddingManager — 5 components + `WeddingManager.css` (eliminar 12 `!important`; `COLOR_*`/`FONT_*` de `ManagerShared` desapareixen — ATENCIÓ: ja hem canviat `COLOR_MUTED`/`COLOR_OLIVE` a strings `var(--lt-*)` en T1.4, cal acabar la resta).
- **T4.5** weddings/WeddingGuest — 8 components + `custom/carla-joel` (aquest darrer migra a tokens però conserva el seu layout propi, excepció acceptada).
- **T4.6** `@ui` + `@components` — `SurfaceCard`, `CustomTitle`, `PricingCard`, `FAQs`, `Carrousel`(`ImageSlider`), `WhyDoSession`, `ThreePhotoRow`, `PhotoItem`, `AdviceText`, `MobileShell`, `MobileSwiper`. **Inclou acabar `LoginCard.tsx`** (encara té 7 `style={{}}` inline, fora d'abast de T4.2).
- **T4.7** marketing — `pregnancy`, `newborn`, `familiar`, `smashcake`, `aboutme`, `home`. Fer-la **després** de T4.6.
- **T4.8** `store` + `workshop` — els 2 fitxers amb més inline del projecte. Cloudinary NO es toca (Q3).
- **T4.9** `layouts` — `main.layout`, `main.header`, `footer`. Revisar `minWidth: 400px` i `forceMenuRecalc()` al menú.
- **T4.10** Tancament — pujar ESLint `warn`→`error`, esborrar `src/styles/tokens/radii.ts` i últims imports, afegir `prefers-reduced-motion` als ~14 components animats que encara no el respecten (avui només `ContractSheet` ho fa), moure `specs/active/001-…` → `specs/done/`.

## Patró establert (seguir-lo igual a T4.3–T4.9)

1. Crear `<Component>.module.css` al costat del `.tsx`.
2. Moure-hi tot valor CSS estàtic (color, font, mida, espaiat) fent servir `var(--lt-*)` de `src/styles/tokens.css`.
3. Deixar inline només: (a) props d'estil d'antd (`styles={{ body: … }}`), (b) CSS vars dinàmiques (`style={{ '--x': v }}`), (c) `initial/animate/variants` de Framer Motion.
4. Si dos fitxers del mateix mòdul comparteixen un estil → un `shared.module.css` local al mòdul amb `composes`.
5. Si dos **mòduls diferents** el comparteixen → puja'l a `src/ui/*.module.css` (ja fet per `formStyles` i `pageContainer`); `composes: X from '<path relatiu>'` — **no funciona amb alies `@ui`**, cal path relatiu.
6. Colors sense token semàntic exacte (casos rars, p.ex. `#eceae2` a `SummaryStep`, gradients `#a09880` marcats "és fons, no text" a T1.4): deixar-los literals al `.module.css`, no inventar token nou per un sol ús.
7. Verificar cada tasca amb: `npx tsc -b`, `npm run build`, `bash tools/check-tokens.sh`, `npx eslint <fitxers tocats>`, i `grep -c "style={{" <fitxers>` (ha de baixar a 0 o quedar només els casos (a)(b)(c) de dalt).

## Per a la següent sessió

- Continuar amb **T4.3 (admin)**.
- La llista de tasques també viu al Task tool intern (30 tasks, IDs #1–#30); si la sessió nova no hi té accés, aquest fitxer és la font de veritat.
- Cap commit fet encara — decidir quan committejar (per fase F4 sencera, o per tasca T4.x). No s'ha demanat explícitament fer commits.
- **Abans de continuar F4**: fer QA visual de tot el que ja està fet (F0–F3 + T4.1 + T4.2) amb `npm run dev`, pàgina per pàgina, ja que T1.3 ha demostrat que "compila i el build passa" no garanteix "es veu igual". Mirar especialment: `bookingview` (contracte), `booksession` (tots els passos), login (admin + gestor de boda), i qualsevol pàgina amb `Button`/`Typography` d'antd sense estil propi.
- Sessió tancada el 2026-08-04 amb l'app en estat compilable i buildable (`npm run build` net), però **sense QA visual completa** — les 3 regressions d'aquesta sessió (botons trencats, text marró, fons marró) es van trobar per inspecció manual de l'usuari, no per cap verificació automàtica. Repetir aquest tipus de revisió a cada checkpoint futur.
