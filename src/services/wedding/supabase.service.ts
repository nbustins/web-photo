import { GuestServiceProvider } from './types';
import { getSupabaseClient } from '../supabase.client';
import { Wedding, GuestWithWedding, GuestWithConfirmation, ConfirmationPayload } from '../../model/wedding.types';

export class SupabaseGuestService implements GuestServiceProvider {
  async getWeddingBySlug(slug: string): Promise<Wedding | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Error fetching wedding:', error);
      return null;
    }

    return data as Wedding;
  }

  async getGuestBySlugAndCode(slug: string, code: string): Promise<GuestWithWedding | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (weddingError || !wedding) {
      console.error('Error fetching wedding:', weddingError);
      return null;
    }

    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('invite_code', code)
      .single();

    if (guestError || !guest) {
      console.error('Error fetching guest:', guestError);
      return null;
    }

    return { ...(guest as object), wedding: wedding as Wedding } as GuestWithWedding;
  }

  async saveConfirmation(payload: ConfirmationPayload): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Database not configured' };

    try {
      const { error: confirmationError } = await supabase
        .from('guest_confirmations')
        .upsert({
          guest_id: payload.guest_id,
          attending: payload.attending,
          companions_count: payload.companions_count,
          notes: payload.notes,
        } as object, { onConflict: 'guest_id' } as object);

      if (confirmationError) return { success: false, error: confirmationError.message };

      const { data: confirmation } = await supabase
        .from('guest_confirmations')
        .select('id')
        .eq('guest_id', payload.guest_id)
        .single();

      if (confirmation && payload.companion_names.length > 0) {
        await supabase
          .from('guest_companions')
          .delete()
          .eq('guest_confirmation_id', (confirmation as { id: string }).id);

        const { error: companionsError } = await supabase
          .from('guest_companions')
          .insert(payload.companion_names.map(name => ({
            guest_confirmation_id: (confirmation as { id: string }).id,
            name,
          })) as object[]);

        if (companionsError) return { success: false, error: companionsError.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async getGuestsWithConfirmations(slug: string, managerCode: string): Promise<GuestWithConfirmation[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .eq('manager_code', managerCode)
      .single();

    if (weddingError || !wedding) throw new Error('Codi de gestor incorrecte');

    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', wedding.id);

    if (guestsError) throw new Error(guestsError.message);

    const { data: confirmations, error: confirmationsError } = await supabase
      .from('guest_confirmations')
      .select('*')
      .in('guest_id', guests.map(g => g.id));

    if (confirmationsError) throw new Error(confirmationsError.message);

    const confirmationIds = confirmations.map(c => c.id);
    const { data: companions, error: companionsError } = confirmationIds.length > 0
      ? await supabase.from('guest_companions').select('*').in('guest_confirmation_id', confirmationIds)
      : { data: [], error: null };

    if (companionsError) throw new Error(companionsError.message);

    return guests.map(guest => {
      const guestConfirmation = confirmations.find(c => c.guest_id === guest.id);
      return {
        ...guest,
        confirmation: guestConfirmation,
        companions: companions.filter(c => c.guest_confirmation_id === guestConfirmation?.id),
      };
    });
  }
}
