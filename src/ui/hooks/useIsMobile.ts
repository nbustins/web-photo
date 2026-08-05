import { useEffect, useState } from 'react';
import { breakpoint } from '@styles/tokens';

const MOBILE_BREAKPOINT = `(max-width: ${breakpoint.md}px)`;

/** Única font de veritat per a "és mòbil?" (analysis.md eix F). No usar matchMedia/innerWidth directament fora d'aquest hook. */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_BREAKPOINT).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const update = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
};
