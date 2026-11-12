/** The API never returns a password or hash, so the mock does not store one either. */
export interface MockWeddingManager {
  id: number;
  email: string;
  weddingId: number;
  createdAt: string;
}

/** Two managers on the first wedding, none on the second (the empty state is a valid state). */
export const weddingManagerFixtures: MockWeddingManager[] = [
  {
    id: 1,
    email: 'gestor.anna@example.com',
    weddingId: 1,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 2,
    email: 'familia.joan@example.com',
    weddingId: 1,
    createdAt: '2026-02-03T17:30:00.000Z',
  },
];
