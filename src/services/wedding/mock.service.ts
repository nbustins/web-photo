import type { GuestServiceProvider } from './types';
import type { Wedding, Invitation, ConfirmationRow, ConfirmInvitationPayload } from '../../model/wedding.types';

const mockWedding: Wedding = {
  id: 'wedding-1',
  slug: 'anna-joan',
  title: 'Anna & Joan',
  subtitle: 'Confirma la teva assistència',
  hero_image: 'weddings/anna-joan/hero.jpg',
  background_image: 'weddings/anna-joan/bg.jpg',
  event_date: '2026-09-15',
  closing_date: '2026-09-10',
  manager_code: 'MANAGER2026',
};

const mockInvitations: Invitation[] = [
  {
    id: 1,
    label: 'Família Garcia',
    inviteCode: 'GARCIA01',
    maxAddedGuests: 0,
    weddingTitle: 'Anna & Joan',
    eventDate: '2026-09-15',
    notes: null,
    slug: 'anna-joan',
    guests: [
      { id: 1, name: 'Maria Garcia', isPredefined: true, attending: null },
      { id: 2, name: 'Pere Garcia', isPredefined: true, attending: null },
      { id: 3, name: 'Joana Garcia', isPredefined: true, attending: null },
    ],
  },
  {
    id: 2,
    label: 'Família López',
    inviteCode: 'LOPEZ002',
    maxAddedGuests: 0,
    weddingTitle: 'Anna & Joan',
    eventDate: '2026-09-15',
    notes: 'Al·lèrgia als fruits secs',
    slug: 'anna-joan',
    guests: [
      { id: 4, name: 'Laia López', isPredefined: true, attending: true },
      { id: 5, name: 'Jordi López', isPredefined: true, attending: true },
      { id: 6, name: 'Noa López', isPredefined: true, attending: false },
    ],
  },
];

const invitationStore = new Map<number, Invitation>(
  mockInvitations.map(i => [i.id, { ...i, guests: i.guests.map(g => ({ ...g })) }])
);

export class MockGuestService implements GuestServiceProvider {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getWeddingBySlug(slug: string): Promise<Wedding | null> {
    await this.delay(300);
    return slug === mockWedding.slug ? mockWedding : null;
  }

  async getInvitation(slug: string, code: string): Promise<Invitation | null> {
    await this.delay(300);
    const inv = [...invitationStore.values()].find(i => i.slug === slug && i.inviteCode === code);
    return inv ?? null;
  }

  async saveConfirmation(payload: ConfirmInvitationPayload): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
    await this.delay(500);
    const inv = [...invitationStore.values()].find(
      i => i.slug === payload.slug && i.inviteCode === payload.inviteCode
    );
    if (!inv) return { success: false, error: 'Invitació no trobada' };

    const updated: Invitation = {
      ...inv,
      notes: payload.notes,
      guests: payload.guests.map(g => ({
        id: g.id,
        name: g.name,
        isPredefined: inv.guests.find(ig => ig.id === g.id)?.isPredefined ?? false,
        attending: g.attending,
      })),
    };
    invitationStore.set(updated.id, updated);
    return { success: true, invitation: updated };
  }

  async getConfirmations(slug: string): Promise<ConfirmationRow[]> {
    await this.delay(400);
    const rows: ConfirmationRow[] = [];
    for (const inv of invitationStore.values()) {
      if (inv.slug !== slug) continue;
      for (const g of inv.guests) {
        rows.push({
          invitationId: inv.id,
          label: inv.label,
          email: null,
          inviteCode: inv.inviteCode,
          maxAddedGuests: inv.maxAddedGuests,
          notes: inv.notes,
          guestId: g.id,
          guestName: g.name,
          isPredefined: g.isPredefined,
          guestAttending: g.attending,
        });
      }
    }
    return rows;
  }
}
