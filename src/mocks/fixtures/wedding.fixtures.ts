/** Wire-shape mirrors of the API's wedding DTOs (Modules/Wedding). */

export interface MockWeddingFeatures {
  hotelInfo: boolean;
  transportToHotel: boolean;
  songRequests: boolean;
  allergens: boolean;
}

export interface MockSongRequest {
  title: string;
  artist: string | null;
}

export interface MockInvitationGuest {
  id: number;
  name: string;
  isPredefined: boolean;
  attending: boolean | null;
  usesTransportToHotel: boolean | null;
  allergens: string[];
}

export interface MockInvitation {
  id: number;
  weddingId: number;
  label: string;
  email: string | null;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  songRequests: MockSongRequest[];
  createdAt: string;
  guests: MockInvitationGuest[];
}

export interface MockWedding {
  id: number;
  slug: string;
  title: string;
  eventDate: string | null;
  closingDate: string | null;
  createdAt: string;
  photos: string[];
  features: MockWeddingFeatures;
  hotelInfo: string | null;
}

/** Ported from the retired MockGuestService so the wedding pages keep the same demo data. */
export const NO_FEATURES: MockWeddingFeatures = {
  hotelInfo: false,
  transportToHotel: false,
  songRequests: false,
  allergens: false,
};

const HOTEL_INFO_HTML = `<h4>Hotel Mas de les Oliveres</h4>
<p>Hem reservat un bloc d'habitacions a <strong>Hotel Mas de les Oliveres</strong>, a cinc minuts del lloc de la celebració. Esmenteu el nom de la boda en fer la reserva per accedir a la tarifa especial.</p>
<ul>
  <li>Entrada a partir de les 15:00 h i sortida abans de les 12:00 h.</li>
  <li>Esmorzar inclòs.</li>
  <li>Aparcament gratuït per als convidats.</li>
</ul>
<p>Reserves: <a href="tel:+34972000000">972 00 00 00</a> o <a href="https://example.com/mas-de-les-oliveres">al web de l'hotel</a>.</p>`;

export const weddingFixtures: MockWedding[] = [
  {
    id: 1,
    slug: 'anna-joan',
    title: 'Anna & Joan',
    eventDate: '2026-09-15',
    closingDate: '2026-09-10T23:59:59.000Z',
    createdAt: '2026-01-10T09:00:00.000Z',
    photos: [
      'https://res.cloudinary.com/djxytedne/image/upload/v1777734451/joel_i_carla-5_egd7ni.jpg',
      'https://res.cloudinary.com/djxytedne/image/upload/v1777734451/joel_i_carla-13_xpncpa.jpg',
    ],
    features: { ...NO_FEATURES },
    hotelInfo: null,
  },
  {
    id: 2,
    slug: 'marta-pau',
    title: 'Marta & Pau',
    eventDate: '2027-06-12',
    closingDate: '2027-06-01T23:59:59.000Z',
    createdAt: '2026-09-20T09:00:00.000Z',
    photos: [],
    features: { hotelInfo: true, transportToHotel: true, songRequests: true, allergens: true },
    hotelInfo: HOTEL_INFO_HTML,
  },
];

export const invitationFixtures: MockInvitation[] = [
  {
    id: 1,
    weddingId: 1,
    label: 'Família Garcia',
    email: 'garcia@example.com',
    inviteCode: 'GARCIA01',
    maxAddedGuests: 0,
    notes: null,
    songRequests: [],
    createdAt: '2026-01-10T09:00:00.000Z',
    guests: [
      { id: 1, name: 'Maria Garcia', isPredefined: true, attending: null, usesTransportToHotel: null, allergens: [] },
      { id: 2, name: 'Pere Garcia', isPredefined: true, attending: null, usesTransportToHotel: null, allergens: [] },
      { id: 3, name: 'Joana Garcia', isPredefined: true, attending: null, usesTransportToHotel: null, allergens: [] },
    ],
  },
  {
    id: 2,
    weddingId: 1,
    label: 'Família López',
    email: 'lopez@example.com',
    inviteCode: 'LOPEZ002',
    maxAddedGuests: 0,
    notes: 'Al·lèrgia als fruits secs',
    songRequests: [],
    createdAt: '2026-01-10T09:00:00.000Z',
    guests: [
      { id: 4, name: 'Laia López', isPredefined: true, attending: true, usesTransportToHotel: null, allergens: [] },
      { id: 5, name: 'Jordi López', isPredefined: true, attending: true, usesTransportToHotel: null, allergens: [] },
      { id: 6, name: 'Noa López', isPredefined: true, attending: false, usesTransportToHotel: null, allergens: [] },
    ],
  },
  {
    id: 3,
    weddingId: 2,
    label: 'Família Soler',
    email: 'soler@example.com',
    inviteCode: 'SOLER003',
    maxAddedGuests: 1,
    notes: null,
    songRequests: [
      { title: 'Ho Tornaria a Fer', artist: 'Els Amics de les Arts' },
      { title: 'September', artist: 'Earth, Wind & Fire' },
      { title: 'Sweet Caroline', artist: null },
    ],
    createdAt: '2026-09-20T09:00:00.000Z',
    guests: [
      { id: 7, name: 'Núria Soler', isPredefined: true, attending: true, usesTransportToHotel: true, allergens: ['Gluten'] },
      { id: 8, name: 'Marc Soler', isPredefined: true, attending: false, usesTransportToHotel: null, allergens: [] },
      { id: 9, name: 'Acompanyant de Núria', isPredefined: false, attending: true, usesTransportToHotel: false, allergens: ['Lactosa', 'Marisc'] },
    ],
  },
];
