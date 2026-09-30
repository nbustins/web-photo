import { useShell } from '@ui/shellContext';

/** What the admin panel hands every section through the shell's <Outlet context>. */
export interface AdminShellContext {
  /** Re-reads the pending-requests badge after a section changes a booking's status. */
  refreshPending: () => void;
}

export const useAdminShell = () => useShell<AdminShellContext>();
