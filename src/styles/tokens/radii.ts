import { radius, spaceAlias } from '../tokens';

/** @deprecated Usa `radius` de `@styles/tokens`. Es manté per compatibilitat fins a F2/F4. */
export const radii = {
  sm: radius.xs,
  md: radius.sm,
  lg: radius.md,
} as const;

/** @deprecated Usa `spaceAlias.page` de `@styles/tokens`. */
export const pageBodyPadding = spaceAlias.page;
