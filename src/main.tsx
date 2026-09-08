import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import App from './App.tsx'

/**
 * `npm run dev:mock` starts the UI against MSW instead of the API, for designing pages
 * without a backend. The dynamic import inside the env guard keeps msw out of the
 * production bundle, and awaiting it means no request escapes the worker on first mount.
 */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return
  const { startMockWorker } = await import('./mocks/browser')
  await startMockWorker()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App/>
      </StrictMode>,
  )
})
