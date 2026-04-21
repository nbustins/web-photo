import { Wedding, GuestWithWedding, GuestWithConfirmation, ConfirmationPayload } from '../../model/wedding.types';

export interface GuestServiceProvider {
  getWeddingBySlug(slug: string): Promise<Wedding | null>;
  getGuestBySlugAndCode(slug: string, code: string): Promise<GuestWithWedding | null>;
  saveConfirmation(payload: ConfirmationPayload): Promise<{ success: boolean; error?: string }>;
  getGuestsWithConfirmations(slug: string): Promise<GuestWithConfirmation[]>;
}
