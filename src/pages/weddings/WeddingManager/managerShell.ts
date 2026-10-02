import { useShell } from '@ui/shellContext';
import type { ConfirmationRow, InvitationSongs, WeddingFeatures } from '../../../model/wedding.types';

/** What the manager layout hands every section through the shell's <Outlet context>. */
export interface ManagerShellContext {
  weddingTitle: string;
  rows: ConfirmationRow[];
  features: WeddingFeatures;
  /** Empty unless features.songRequests is on. */
  invitationSongs: InvitationSongs[];
}

export const useManagerShell = () => useShell<ManagerShellContext>();
