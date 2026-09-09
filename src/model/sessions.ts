import { AppRoutes } from "./routes.model";

/**
 * Font única de la llista de sessions: la fa servir el submenú SESSIONS del
 * header i la tira de la pàgina principal. Abans estava duplicada.
 */
export interface SessionLink {
  /** Ruta de destí; també és la clau del Menu d'antd. */
  key: AppRoutes;
  label: string;
  /** Frase curta sota el nom a la tira de la home. */
  caption: string;
  /** Ruta dins de public/, sense barra inicial (getPublicPath ja hi posa el base). */
  cover: string;
  /** false mentre la sessió no s'ha d'oferir al menú del header. */
  inMenu: boolean;
}

export const SESSIONS: readonly SessionLink[] = [
  {
    key: AppRoutes.pregnant,
    label: "Embaràs",
    caption: "setmana 28 a 34",
    cover: "pregnancy/3.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.newBorn,
    label: "Recent Nascut",
    caption: "els primers 15 dies",
    cover: "newborn/14.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.familiar,
    label: "Familiar",
    caption: "a casa o a l'exterior",
    cover: "familiar/4.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.smashCake,
    label: "Smash Cake",
    caption: "el primer aniversari",
    cover: "smashcake/4.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.christmas,
    label: "Nadal",
    caption: "sessions de temporada",
    // ponytail: no hi ha public/christmas/ encara; foto manllevada de familiar,
    // igual que fa christmas.page.tsx. Canviar quan arribin les fotos finals.
    cover: "familiar/2.jpg",
    // inMenu queda a false fins que les fotos de Nadal siguin definitives.
    inMenu: false,
  },
];
