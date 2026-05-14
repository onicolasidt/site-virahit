import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './App.tsx';
import './index.css';

// Vercel Analytics (pageviews + funil)
inject();

// ViraHit.AI - Performance Optimized
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
