import type { Wedding, Invitation, ConfirmationRow, InvitationSongs, ConfirmInvitationPayload } from '../../model/wedding.types';

export interface GuestServiceProvider {
  getWeddingBySlug(slug: string): Promise<Wedding | null>;
  getWeddingPhotos(slug: string): Promise<string[]>;
  getInvitation(slug: string, code: string): Promise<Invitation | null>;
  saveConfirmation(payload: ConfirmInvitationPayload): Promise<{ success: boolean; invitation?: Invitation; error?: string }>;
  getConfirmations(slug: string): Promise<ConfirmationRow[]>;
  getInvitationSongs(slug: string): Promise<InvitationSongs[]>;
}
