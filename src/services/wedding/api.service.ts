import type { Wedding, Invitation, ConfirmationRow, ConfirmInvitationPayload } from '../../model/wedding.types';
import type { GuestServiceProvider } from './types';
import { fetchPublicWedding, fetchAuthWeddingBySlug } from './api/public-wedding.api';
import { fetchGuestInvite, postConfirmInvite } from './api/guest-invite.api';
import { fetchConfirmations } from './api/confirmations.api';

export class ApiGuestService implements GuestServiceProvider {
  getWeddingBySlug(slug: string): Promise<Wedding | null> {
    return fetchPublicWedding(slug);
  }

  getInvitation(slug: string, code: string): Promise<Invitation | null> {
    return fetchGuestInvite(slug, code);
  }

  async saveConfirmation(payload: ConfirmInvitationPayload): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
    if (!payload.slug || !payload.inviteCode) {
      return { success: false, error: 'Falta slug o inviteCode al payload' };
    }
    try {
      const invitation = await postConfirmInvite(payload);
      return { success: true, invitation };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al guardar la confirmació',
      };
    }
  }

  async getConfirmations(slug: string): Promise<ConfirmationRow[]> {
    const resolved = await fetchAuthWeddingBySlug(slug);
    if (!resolved) throw new Error('Boda no trobada');
    return fetchConfirmations(resolved.id);
  }
}
