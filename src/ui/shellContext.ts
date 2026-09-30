import { useOutletContext } from 'react-router-dom';

/** What AdminShell hands every section through <Outlet context>, merged with the consumer's own. */
export interface ShellContext {
  openMenu: () => void;
}

export const useShell = <T extends object = object>() => useOutletContext<ShellContext & T>();
