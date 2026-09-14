/** Wire-shape mirrors of the API's wedding DTOs (Modules/Wedding). */

export interface MockInvitationGuest {
  id: number;
  name: string;
  isPredefined: boolean;
  attending: boolean | null;
}

export interface MockInvitation {
  id: number;
  weddingId: number;
  label: string;
  email: string | null;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
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
}

/** Ported from the retired MockGuestService so the wedding pages keep the same demo data. */
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
    createdAt: '2026-01-10T09:00:00.000Z',
    guests: [
      { id: 1, name: 'Maria Garcia', isPredefined: true, attending: null },
      { id: 2, name: 'Pere Garcia', isPredefined: true, attending: null },
      { id: 3, name: 'Joana Garcia', isPredefined: true, attending: null },
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
    createdAt: '2026-01-10T09:00:00.000Z',
    guests: [
      { id: 4, name: 'Laia López', isPredefined: true, attending: true },
      { id: 5, name: 'Jordi López', isPredefined: true, attending: true },
      { id: 6, name: 'Noa López', isPredefined: true, attending: false },
    ],
  },
];
