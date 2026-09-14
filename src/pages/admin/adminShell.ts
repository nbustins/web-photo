import { useOutletContext } from 'react-router-dom';

/** What the admin shell hands every section through <Outlet context>. */
export interface AdminShellContext {
  openMenu: () => void;
  /** Re-reads the pending-requests badge after a section changes a booking's status. */
  refreshPending: () => void;
}

export const useAdminShell = () => useOutletContext<AdminShellContext>();
