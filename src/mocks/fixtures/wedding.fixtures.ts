/** Wire-shape mirrors of the API's wedding DTOs (Modules/Wedding). */

export interface MockWeddingFeatures {
  transportToHotel: boolean;
  songRequests: boolean;
  allergens: boolean;
}

export interface MockWeddingContent {
  hotelInfo: string | null;
  introductionText: string | null;
  weddingPlace: string | null;
  schedule: string | null;
  donations: string | null;
  contact: string | null;
  songRequestsPhrase: string | null;
  transportToHotelPhrase: string | null;
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
  content: MockWeddingContent;
}

/** Ported from the retired MockGuestService so the wedding pages keep the same demo data. */
export const NO_FEATURES: MockWeddingFeatures = {
  transportToHotel: false,
  songRequests: false,
  allergens: false,
};

const HOTEL_INFO_HTML = `
<p>Recomanacions a prop de Mas el Martí:</p>
<ul>
  <li>Hostal de la Glòria (Viladrau)</li>
  <li>Hotel Xalet la Coromina (Viladrau)</li>
</ul>`;

const GUEST_CONTENT: MockWeddingContent = {
  hotelInfo: null,
  introductionText: '<p>Tot va començar amb un somriure, va continuar amb un petó i ara es converteix amb un per sempre.</p>',
  weddingPlace: '<p><strong>Mas el Martí (Viladrau)</strong></p>',
  schedule: `
  <p><strong>Benvinguda</strong> 12:30h, Un brindis per l’amor, l’amistat i les grans històries.</p>
  <p><strong>Cerimònia</strong> 13:00h, Un ‘Sí vull’ per una vida junts.</p>
  `,
  donations: '<p>La vostra presència és el nostre millor regal, si voleu tenir un detall amb nosaltres i ajudar-nos a fer realitat el casament dels nostres somnis, ho podeu fer per aquí:</p><p><strong>ES00 MOCK 0000 0000 0000 0000</strong> (compte fictici per a demostració).</p>',
  contact: '<p>Si tens qualsevol dubte pots escriure’ns als següents contactes:</p><p><a href="mailto:casament@example.invalid">casament@example.invalid</a></p>',
  songRequestsPhrase: '<p>Cada cançó és un record compartit. Tria la més especial per a tu i ballem-la junts.</p>',
  transportToHotelPhrase: '<p>Volem que només us preocupeu de disfrutar. Per això, hi haurà servei d’autobús gratuït disponible per realitzar el transport de Viladrau ⇆ Mas el Martí.</p>',
};

export const weddingFixtures: MockWedding[] = [
  {
    id: 1,
    slug: 'anna-joan',
    title: 'Anna & Joan',
    eventDate: '2026-09-15',
    closingDate: '2030-09-10T23:59:59.000Z',
    createdAt: '2026-01-10T09:00:00.000Z',
    photos: [
      'https://res.cloudinary.com/djxytedne/image/upload/v1777734451/joel_i_carla-5_egd7ni.jpg',
      'https://res.cloudinary.com/djxytedne/image/upload/v1777734451/joel_i_carla-13_xpncpa.jpg',
    ],
    features: { ...NO_FEATURES },
    content: GUEST_CONTENT,
  },
  {
    id: 2,
    slug: 'marta-joan',
    title: 'Marta & Joan',
    eventDate: '2027-06-12',
    closingDate: '2030-06-01T23:59:59.000Z',
    createdAt: '2026-09-20T09:00:00.000Z',
    photos: [],
    features: { transportToHotel: true, songRequests: true, allergens: true },
    content: { ...GUEST_CONTENT, hotelInfo: HOTEL_INFO_HTML },
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
    notes: 'Arribarem una mica tard a la cerimònia.',
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
  {
    id: 4,
    weddingId: 2,
    label: 'Família Vidal',
    email: 'vidal@example.com',
    inviteCode: 'VIDAL004',
    maxAddedGuests: 0,
    notes: null,
    songRequests: [
      { title: 'Ho Tornaria a Fer', artist: 'Els Amics de les Arts' },
      { title: 'Boig per tu', artist: 'Sau' },
    ],
    createdAt: '2026-09-20T09:00:00.000Z',
    guests: [
      { id: 10, name: 'Clara Vidal', isPredefined: true, attending: true, usesTransportToHotel: true, allergens: [] },
      { id: 11, name: 'Oriol Vidal', isPredefined: true, attending: true, usesTransportToHotel: true, allergens: ['Fruits secs'] },
      { id: 12, name: 'Bru Vidal', isPredefined: true, attending: false, usesTransportToHotel: null, allergens: [] },
    ],
  },
  {
    id: 5,
    weddingId: 2,
    label: 'Amics de la uni',
    email: null,
    inviteCode: 'UNI00005',
    maxAddedGuests: 0,
    notes: null,
    songRequests: [
      { title: 'September', artist: 'Earth, Wind & Fire' },
      { title: 'Mr. Brightside', artist: 'The Killers' },
      { title: 'Mediterráneo', artist: 'Joan Manuel Serrat' },
    ],
    createdAt: '2026-09-20T09:00:00.000Z',
    guests: [
      { id: 13, name: 'Gemma Puig', isPredefined: true, attending: true, usesTransportToHotel: false, allergens: [] },
    ],
  },
  {
    id: 6,
    weddingId: 2,
    label: 'Família Roca',
    email: 'roca@example.com',
    inviteCode: 'ROCA0006',
    maxAddedGuests: 0,
    notes: null,
    songRequests: [],
    createdAt: '2026-09-20T09:00:00.000Z',
    guests: [
      { id: 14, name: 'Pilar Roca', isPredefined: true, attending: null, usesTransportToHotel: null, allergens: [] },
      { id: 15, name: 'Josep Roca', isPredefined: true, attending: null, usesTransportToHotel: null, allergens: [] },
    ],
  },
];
