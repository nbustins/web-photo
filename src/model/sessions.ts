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
  /** Ruta dins de public/, sense barra inicial (imageUrl ja hi posa el base). */
  cover: string;
  /** false mentre la sessió no s'ha d'oferir al menú del header. */
  inMenu: boolean;
}

export const SESSIONS: readonly SessionLink[] = [
  {
    key: AppRoutes.pregnant,
    label: "Embaràs",
    caption: "Recorda-ho per sempre",
    cover: "https://res.cloudinary.com/djxytedne/image/upload/v1789070741/pregnancy_g6yz3d.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.newBorn,
    label: "Recent Nascut",
    caption: "Els seus primers dies",
    cover: "https://res.cloudinary.com/djxytedne/image/upload/v1789070740/newborn_x8aa9z.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.familiar,
    label: "Familiar",
    caption: "iu una experiència en família",
    cover: "https://res.cloudinary.com/djxytedne/image/upload/v1789070741/familiar_jpxpmu.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.smashCake,
    label: "Smash Cake",
    caption: "El seu primer aniversari",
    cover: "https://res.cloudinary.com/djxytedne/image/upload/v1789070741/smashcake_ozgkqf.jpg",
    inMenu: true,
  },
  {
    key: AppRoutes.christmas,
    label: "Nadal",
    caption: "Un món ple de màgia",
    //TODO
    cover: "familiar/2.jpg",
    inMenu: true,
  },
];
