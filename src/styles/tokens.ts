/**
 * Autoria única dels valors del sistema de disseny.
 * tokens.css duplica aquests valors com a custom properties `--lt-*`
 * (mantingut a mà; tools/check-tokens.sh vigila que els noms no divergeixin).
 * antd-theme.ts referencia els noms d'aquí via var(--lt-*).
 */

export const primitives = {
  olive700: '#5C5440',
  olive600: '#6A6450',
  olive500: '#7C7458',
  olive300: '#A09880',
  sand500: 'rgb(174,142,116)',
  ink900: '#231F20',
  ink700: '#3D3228',
  ink500: '#4A4539',
  grey600: '#5A5A5A',
  grey500: '#6A6A6A',
  warm400: '#6E675A',
  paper100: '#FFFDF7',
  paper200: '#F6F4F0',
  paper300: '#F5F0EA',
  cream100: '#FFF9E5',
  success500: '#5E8A4E',
  danger500: '#B06A3A',
} as const;

export const semantic = {
  colorBrand: primitives.olive500,
  colorBrandStrong: primitives.olive700,
  colorAccent: primitives.sand500,
  colorSurfacePage: primitives.paper200,
  colorSurfaceCard: 'rgba(255,255,255,0.9)',
  colorSurfaceInverse: primitives.ink900,
  colorTextPrimary: primitives.ink500,
  colorTextSecondary: primitives.grey500,
  colorTextMuted: primitives.warm400,
  colorTextBrand: primitives.olive600,
  colorTextOnBrand: '#FFFFFF',
  colorBorderSubtle: 'rgba(124,116,88,0.25)',
  colorStatusSuccess: primitives.success500,
  colorStatusDanger: primitives.danger500,
  colorFocusRing: primitives.olive700,
} as const;

export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const spaceAlias = {
  page: space[6],
  gutter: space[6],
  section: space[12],
  stack: space[4],
} as const;

export const radius = {
  xs: '0.1rem',
  sm: '0.3rem',
  md: '0.5rem',
  lg: '12px',
  sheet: '24px',
  pill: '999px',
} as const;

export const shadow = {
  sm: '0 2px 8px rgba(0,0,0,.08)',
  md: '0 2px 12px rgba(124,116,88,.08)',
  lg: '0 10px 28px rgba(0,0,0,.12)',
  sheet: '0 10px 40px rgba(124,116,88,.12)',
} as const;

export const container = {
  form: '520px',
  text: '820px',
  page: '1200px',
  wide: '1500px',
} as const;

export const motion = {
  durationFast: '150ms',
  durationBase: '300ms',
  durationSlow: '800ms',
  easeOut: 'cubic-bezier(.22,1,.36,1)',
} as const;

export const font = {
  display: "'Italiana', Georgia, 'Times New Roman', serif",
  body: "'Raleway', system-ui, -apple-system, sans-serif",
  editorial: "'Playfair Display', Georgia, serif",
  handwritten: "'Indie Flower', 'Segoe Script', cursive",
  signature: "'Borel', 'Brush Script MT', cursive",
} as const;

/** 31 clamp() històrics mapejats a 7 passos (analysis.md §5.3). */
export const textScale = {
  hero: 'clamp(3rem, 6vw, 6rem)',
  display: 'clamp(2rem, 5vw, 2.8rem)',
  title: 'clamp(1.6rem, 3vw, 3rem)',
  heading: 'clamp(1.4rem, 3vw, 1.8rem)',
  subheading: 'clamp(1.05rem, 2.2vw, 1.3rem)',
  body: 'clamp(0.9rem, 1.4vw, 1.05rem)',
  caption: 'clamp(0.85rem, 1.3vw, 0.9rem)',
} as const;

/** Breakpoints d'antd (eix F1) — font única per a CSS i per a Grid/useBreakpoint. */
export const breakpoint = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;
