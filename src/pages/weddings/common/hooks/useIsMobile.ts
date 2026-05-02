import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

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
