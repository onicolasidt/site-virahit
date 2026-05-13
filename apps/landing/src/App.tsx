import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4EEDC]">
    <img
      src="/nova-logo-virahit.svg"
      alt="ViraHit"
      width="120"
      height="40"
      className="h-10 w-auto object-contain animate-pulse"
    />
  </div>
);

// Pages
const Home = lazy(() => import('./pages/Home'));
const TermosDeUso = lazy(() => import('./pages/TermosDeUso'));
const Privacidade = lazy(() => import('./pages/Privacidade'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Suspense fallback={<Loader />}><Home /></Suspense>} />
        <Route path="/termos" element={<Suspense fallback={<Loader />}><TermosDeUso /></Suspense>} />
        <Route path="/privacidade" element={<Suspense fallback={<Loader />}><Privacidade /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}
