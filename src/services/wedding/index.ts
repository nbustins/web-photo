import { GuestServiceProvider } from './types';
import { MockGuestService } from './mock.service';
import { SupabaseGuestService } from './supabase.service';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const guestService: GuestServiceProvider = useMock
  ? new MockGuestService()
  : new SupabaseGuestService();

export type { GuestServiceProvider } from './types';
