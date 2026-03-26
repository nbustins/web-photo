import { GuestServiceProvider } from './guestService.types';
import { MockGuestService } from './guestService.mock';
import { SupabaseGuestService } from './guestService.supabase';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const guestService: GuestServiceProvider = useMock
  ? new MockGuestService()
  : new SupabaseGuestService();
