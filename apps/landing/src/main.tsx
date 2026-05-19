import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ViraHit.AI — Performance Optimized
// @vercel/analytics REMOVED: injects Sentry (24.5KB) which kills TBT.
// GA4 tracks everything we need. Re-enable only if Vercel Web Analytics is critical.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
