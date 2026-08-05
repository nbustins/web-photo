# Design System Reference

Reference this skill when making UI decisions, styling components, or ensuring visual consistency.

**Regla mestra:** aquest document conté regles i punters, mai valors. Els valors
viuen en un sol lloc — `src/styles/tokens.ts` (autoria) i `src/styles/tokens.css`
(`--lt-*`, consumit per CSS i pel tema d'antd). Si aquest fitxer i el codi
divergeixen alguna vegada, guanya el codi: és exactament el que va passar amb
la versió anterior d'aquest document (veure `specs/done/001-refactor-design-system`).

---

## Colors

Cap literal de color (`#hex`, `rgb()`, `rgba()`) fora de `tokens.ts`. Fes servir
sempre el token semàntic corresponent (`var(--lt-color-*)` en CSS, o la mateixa
cadena com a string en `style` mentre el component no s'hagi migrat a CSS Modules).

Regla forçada per ESLint (`no-restricted-syntax`, ix `eslint.config.js`).

Primitives i semàntics complets: `src/styles/tokens.ts` (secció `primitives` /
`semantic`).

---

## Tipografia

Cap `fontFamily` inline — regla forçada per ESLint. Fes servir els 5 tokens de
família (`--lt-font-display/body/editorial/handwritten/signature`), cadascun amb
la seva pila de fallback completa.

Cap pas d'escala fluida nou fora dels 7 ja definits a `tokens.css`
(`--lt-text-hero` … `--lt-text-caption`). Si cap dels 7 encaixa, el problema és
la decisió de disseny, no que falti un pas 8è — revisa amb l'stakeholder abans
d'afegir-ne un.

---

## Espaiat, radis, ombres, contenidors, motion

Tots vénen de `tokens.css` (`--lt-space-*`, `--lt-radius-*`, `--lt-shadow-*`,
`--lt-container-*`, `--lt-duration-*`, `--lt-ease-out`). Des de TypeScript,
importa'ls de `@styles/tokens`.

Row gutters d'antd i marges de secció: fes-los servir de manera consistent amb
el que ja hi ha a la pàgina veïna, no inventis un valor nou.

---

## Grid & Responsive Layout

Fes servir sempre `Row` / `Col` d'antd. Tots els layouts han d'apilar-se en
mòbil (`xs={24}`). No barregis floats CSS ni columnes amb posicionament
absolut amb el grid d'antd — tria'n un.

**Breakpoints:** única font `useIsMobile()` de `@ui/hooks`, que llegeix
`breakpoint.md` de `tokens.ts`. Mai `window.matchMedia` ni `window.innerWidth`
directament fora d'aquest hook — regla forçada per ESLint.

---

## Botons

Configurats globalment a `src/styles/antd-theme.ts` (`components.Button`).
No sobreescriguis aquests valors component a component — si un botó necessita
ser diferent, és una decisió de disseny nova, no una excepció local.

---

## Animation

Totes les animacions amb scroll trigger fan servir Framer Motion amb
`viewport={{ once: true }}`, i han de respectar
`prefers-reduced-motion` (global a `src/styles/base.css`; els components
individuals que animen posició/opacitat també ho han de comprovar amb
`useReducedMotion` quan l'animació és prou notòria).

**Fade-up estàndard** (variant per defecte per a la majoria d'elements):

```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};
```

**Stagger container** (per a llistes/graelles):

```typescript
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
```

**Hover scale** (per a targetes/fotos interactives): `whileHover={{ scale: 1.03 }}`.

---

## Convencions d'imatges

- Totes les imatges des de `public/`, sempre amb `getPublicPath(path)` — mai un
  path cru. Excepció coneguda i acceptada: `workshop.page.tsx` fa servir URLs de
  Cloudinary directes (no es toca, veure analysis.md Q3).
- Relació d'aspecte per a fotos: retrat (`aspect-ratio: 2 / 3`).
- Radi d'imatge: token de radi, mai un valor a mà.

```typescript
import { getPublicPath } from "@utils/pathUtils";
const src = getPublicPath("session-name/1.jpg");
```

---

## Ant Design

- `Row` / `Col` per a tot el grid.
- `Typography.Title` / `Typography.Text` amb moderació — el text es gestiona
  per `.module.css`, no per `style` inline.
- Per estilitzar un `Typography.Title` des d'un `.module.css`, el selector ha de
  portar l'element davant (`h2.title`, `h3.title`): antd fixa la mida amb
  `h2.ant-typography` (0,1,1) i una classe sola hi perdria. Amb `Text` no cal.
- Les classes pròpies guanyen a les d'antd amb la mateixa especificitat: antd
  injecta els seus estils al principi del `<head>` (`prepend`), i el CSS de
  l'app hi va darrere. Per això no cal cap `!important`.
- Mai importis de rutes internes d'antd (`antd/es/**`) — regla forçada per
  ESLint. Importa sempre de `"antd"`.
- Mai barregis el grid d'antd amb flexbox/grid CSS cru per a la mateixa graella
  — tria'n un.

---

## Capes i frontera de mòduls

```
src/styles/          # font única dels valors (tokens.ts, tokens.css, antd-theme.ts)
src/ui/               # capa 1 — primitives, ZERO domini
src/components/        # capa 2 — blocs editorials de marketing
src/pages/<mòdul>/components/   # capa 3 — privats del mòdul
```

Regla de dependència: capa 3 → capa 2 → capa 1 → tokens. Mai al revés, mai
lateral entre mòduls (`pages/booksession` no pot importar de
`pages/weddings`, per exemple). Si dos mòduls necessiten el mateix component,
puja'l a `src/ui` o `src/components` — no el reimplementis ni l'importis
creuat. Regla forçada per ESLint (`no-restricted-imports`).

Vegeu `.claude/skills/shared-components.md` per als components ja disponibles
a `src/components` abans de crear-ne un de nou.
