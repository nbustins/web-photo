import { GuestServiceProvider } from './guestService.types';
import { Wedding, GuestWithWedding, ConfirmationPayload } from '../model/wedding.types';

const mockWedding: Wedding = {
  id: 'wedding-1',
  slug: 'anna-joan',
  title: 'Anna & Joan',
  event_date: '2026-09-15',
  closing_date: '2026-09-10',
};

const mockGuests: Array<GuestWithWedding> = [
  {
    id: 'guest-1',
    wedding_id: 'wedding-1',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    invite_code: 'MARIA2025',
    max_companions: 2,
    wedding: mockWedding,
  },
  {
    id: 'guest-2',
    wedding_id: 'wedding-1',
    name: 'Pere López',
    email: 'pere@example.com',
    invite_code: 'PERE2025',
    max_companions: 1,
    wedding: mockWedding,
  },
  {
    id: 'guest-3',
    wedding_id: 'wedding-1',
    name: 'Laia Puig',
    email: 'laia@example.com',
    invite_code: 'LAIA2025',
    max_companions: 3,
    wedding: mockWedding,
  },
];

const confirmationsStore = new Map<string, {
  attending: boolean;
  companions_count: number;
  companion_names: string[];
  notes: string;
}>();

export class MockGuestService implements GuestServiceProvider {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getWeddingBySlug(slug: string): Promise<Wedding | null> {
    await this.delay(300);
    console.log('[MockGuestService] getWeddingBySlug:', slug);
    
    if (slug === mockWedding.slug) {
      return mockWedding;
    }
    return null;
  }

  async getGuestBySlugAndCode(slug: string, code: string): Promise<GuestWithWedding | null> {
    await this.delay(300);
    console.log('[MockGuestService] getGuestBySlugAndCode:', slug, code);

    const wedding = await this.getWeddingBySlug(slug);
    if (!wedding) {
      return null;
    }

    const guest = mockGuests.find(
      g => g.wedding_id === wedding.id && g.invite_code === code
    );

    return guest || null;
  }

  async saveConfirmation(payload: ConfirmationPayload): Promise<{ success: boolean; error?: string }> {
    await this.delay(500);
    console.log('[MockGuestService] saveConfirmation:', payload);

    confirmationsStore.set(payload.guest_id, {
      attending: payload.attending,
      companions_count: payload.companions_count,
      companion_names: payload.companion_names,
      notes: payload.notes,
    });

    return { success: true };
  }
}
