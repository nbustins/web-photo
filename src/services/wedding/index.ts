import { GuestServiceProvider } from './types';
import { MockGuestService } from './mock.service';
import { ApiGuestService } from './api.service';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const guestService: GuestServiceProvider = useMock
  ? new MockGuestService()
  : new ApiGuestService();

export type { GuestServiceProvider } from './types';
