import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

/**
 * Must resolve before the first render, or the requests fired by the initial mount escape
 * unintercepted. Only ever imported from the VITE_ENABLE_MSW branch in main.tsx, so `msw`
 * stays out of the production bundle.
 */
export function startMockWorker() {
  return worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
