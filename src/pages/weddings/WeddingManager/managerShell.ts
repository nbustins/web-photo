import { useShell } from '@ui/shellContext';
import type { ConfirmationRow } from '../../../model/wedding.types';

/** What the manager layout hands every section through the shell's <Outlet context>. */
export interface ManagerShellContext {
  weddingTitle: string;
  rows: ConfirmationRow[];
}

export const useManagerShell = () => useShell<ManagerShellContext>();
