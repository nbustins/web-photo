import { getUser } from '../auth/auth.store';
import type {
  Wedding,
  GuestWithWedding,
  GuestWithConfirmation,
  ConfirmationPayload,
} from '../../model/wedding.types';
import type { GuestServiceProvider } from './types';
import { fetchPublicWedding } from './api/public-wedding.api';
import { fetchGuestInvite, postConfirmInvite } from './api/guest-invite.api';
import { fetchConfirmations } from './api/confirmations.api';

export class ApiGuestService implements GuestServiceProvider {
  getWeddingBySlug(slug: string): Promise<Wedding | null> {
    return fetchPublicWedding(slug);
  }

  getGuestBySlugAndCode(slug: string, code: string): Promise<GuestWithWedding | null> {
    return fetchGuestInvite(slug, code);
  }

  async saveConfirmation(payload: ConfirmationPayload): Promise<{ success: boolean; error?: string }> {
    if (!payload.slug || !payload.invite_code) {
      return { success: false, error: 'Falta slug o invite_code al payload' };
    }
    try {
      await postConfirmInvite(payload);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al guardar la confirmació',
      };
    }
  }

  getGuestsWithConfirmations(slug: string): Promise<GuestWithConfirmation[]> {
    const user = getUser();
    if (!user) throw new Error('No autenticat');
    if (user.weddingId == null) throw new Error(`Usuari sense boda assignada (${slug})`);
    return fetchConfirmations(user.weddingId);
  }
}
