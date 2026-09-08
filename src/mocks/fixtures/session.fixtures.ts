import type { SessionType } from '../../services/booking/booking.api';
import type { SessionGroup } from '../../services/booking/booking.admin.api';

/**
 * The production catalog, copied from the API's seed
 * (Modules/Sessions/Data/Seed/001_session_catalog.sql). Ids 1-10 are hardcoded by the
 * service pages, so they have to match.
 */
export const sessionGroupFixtures: SessionGroup[] = [
  { id: 1, name: 'Recent Nascut' },
  { id: 2, name: 'Embaràs' },
  { id: 3, name: 'Familiar' },
  { id: 4, name: 'Smash Cake' },
];

const GUIDE = 'Guia per anar preparats a la sessió';
const WARDROBE = 'Vestuari inclòs';
const GALLERY = 'Galeria Online';
const MAKEUP = 'Sessió de maquillatge i pentinat';

export const sessionTypeFixtures: SessionType[] = [
  {
    id: 1,
    sessionGroupId: 1,
    name: 'Bàsica',
    durationMinutes: 90,
    isActive: true,
    price: 220.0,
    adviceText: null,
    features: ['90 minuts de sessió', GUIDE, WARDROBE, 'Entrega de 15 fotos editades (galeria completa +60€)'],
  },
  {
    id: 2,
    sessionGroupId: 1,
    name: 'Domicili',
    durationMinutes: 90,
    isActive: true,
    // Stored without the leading asterisk — the pricing card paints it (API spec 007 QC10).
    adviceText: "A partir de 35 km des de l'estudi, pot haver-hi cost extra per desplaçament",
    price: 220.0,
    features: ['90 minuts de sessió', GUIDE, WARDROBE, 'Entrega de 15 fotos editades (galeria completa +60€)'],
  },
  {
    id: 3,
    sessionGroupId: 1,
    name: 'Completa',
    durationMinutes: 90,
    isActive: true,
    price: 280.0,
    adviceText: null,
    features: ['90 minuts de sessió', GUIDE, WARDROBE, 'Galeria completa', MAKEUP, '5 fotos impreses 18x13'],
  },
  {
    id: 4,
    sessionGroupId: 2,
    name: 'Bàsica',
    durationMinutes: 45,
    isActive: true,
    price: 210.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      WARDROBE,
      'Sessió familiar i individual',
      GALLERY,
      'Entrega de 15 fotos editades (galeria completa +60€)',
    ],
  },
  {
    id: 5,
    sessionGroupId: 2,
    name: 'Exterior',
    durationMinutes: 45,
    isActive: true,
    price: 235.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      WARDROBE,
      'Sessió familiar i individual',
      GALLERY,
      'Entrega de 20 fotos editades (galeria completa +60€)',
    ],
  },
  {
    id: 6,
    sessionGroupId: 2,
    name: 'Completa',
    durationMinutes: 45,
    isActive: true,
    price: 290.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      WARDROBE,
      'Sessió familiar i individual',
      GALLERY,
      'Galeria completa',
      MAKEUP,
      '5 fotos impreses 18x13',
    ],
  },
  {
    id: 7,
    sessionGroupId: 3,
    name: 'Estudi',
    durationMinutes: 45,
    isActive: true,
    price: 200.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      'Vestuari inclòs (un canvi de roba)',
      GALLERY,
      'Entrega de 20 fotos editades (galeria completa +60€)',
      '5 fotos impreses 10x15',
    ],
  },
  {
    id: 8,
    sessionGroupId: 3,
    name: 'Exterior',
    durationMinutes: 45,
    isActive: true,
    price: 220.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      'Vestuari inclòs (un canvi de roba)',
      GALLERY,
      'Entrega de 20 fotos editades (galeria completa +60€)',
    ],
  },
  {
    id: 9,
    sessionGroupId: 4,
    name: 'Estudi',
    durationMinutes: 45,
    isActive: true,
    price: 215.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      WARDROBE,
      'Sessió familiar',
      'Pastís de @enrollate_bk',
      GALLERY,
      'Entrega de 20 fotos editades (galeria completa +60€)',
      '5 fotos impreses 10x15',
    ],
  },
  {
    // The second Smash Cake card: same name, no wardrobe and no prints.
    id: 10,
    sessionGroupId: 4,
    name: 'Estudi',
    durationMinutes: 45,
    isActive: true,
    price: 215.0,
    adviceText: null,
    features: [
      '45 minuts de sessió',
      GUIDE,
      'Sessió familiar',
      'Pastís de @enrollate_bk',
      GALLERY,
      'Entrega de 20 fotos editades (galeria completa +60€)',
    ],
  },
];
