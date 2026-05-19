import React, { useState, useCallback, useRef } from 'react';

const MEDIA_ID = '9f2cf5bfpe';

export default function HeroVideo() {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (loaded) return;
    setLoaded(true);

    // Carrega Wistia scripts apenas quando o usuário clica PLAY
    const scripts = [
      { id: 'wistia-player-js', src: 'https://fast.wistia.com/player.js', type: '' },
      { id: `wistia-embed-${MEDIA_ID}`, src: `https://fast.wistia.com/embed/${MEDIA_ID}.js`, type: 'module' },
    ];
    scripts.forEach(({ id, src, type }) => {
      if (document.getElementById(id)) return;
      const s = document.createElement('script');
      s.id = id;
      s.src = src;
      s.async = true;
      if (type) s.type = type;
      document.head.appendChild(s);
    });
  }, [loaded]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[380px] sm:max-w-[440px] mx-auto cursor-pointer group"
      style={{ aspectRatio: '4/5', minHeight: '380px' }}
      onClick={handleClick}
      role="button"
      aria-label="Reproduzir vídeo"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      {/* Thumbnail estático — LCP rápido, zero JS */}
      <img
        src="/video-thumbnail.webp"
        alt="Vídeo ViraHit — ouça uma música personalizada"
        width="680"
        height="850"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover rounded-[1.25rem] shadow-[0_24px_60px_-12px_rgba(44,93,99,0.25)]"
        style={{ borderRadius: '1.25rem' }}
      />

      {/* Botão PLAY — UX clara de que é um vídeo */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform group-hover:scale-105">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--gold)] ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Wistia player — SÓ carrega DEPOIS do click */}
      {loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.25rem',
            overflow: 'hidden',
          }}
        >
          <wistia-player media-id={MEDIA_ID} aspect="0.8" />
        </div>
      )}
    </div>
  );
}