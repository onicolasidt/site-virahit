import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wistia-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'media-id'?: string;
          aspect?: string;
        },
        HTMLElement
      >;
    }
  }
}

const MEDIA_ID = '9f2cf5bfpe';

export default function HeroVideo() {
  const [showWistia, setShowWistia] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Carrega scripts do Wistia apenas quando o usuário clica
  useEffect(() => {
    if (!showWistia) return;

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
  }, [showWistia]);

  const handlePlay = () => {
    setShowWistia(true);
  };

  return (
    <div
      className="relative w-full max-w-[380px] sm:max-w-[440px] mx-auto"
      style={{ aspectRatio: '4 / 5', minHeight: '380px' }}
    >
      {!showWistia ? (
        <>
          {/* Vídeo leve de 15s — autoplay, muted, loop */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster="/hero-poster.jpg"
            className="w-full h-full object-cover rounded-[1.25rem]"
            style={{
              boxShadow: '0 24px 60px -12px rgba(44, 93, 99, 0.25)',
            }}
          >
            <source src="/hero-video-loop.mp4" type="video/mp4" />
          </video>

          {/* Overlay de clique */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-[1.25rem] cursor-pointer group"
            style={{
              background: 'linear-gradient(to top, rgba(44,93,99,0.55) 0%, rgba(44,93,99,0.15) 50%, transparent 100%)',
            }}
            aria-label="Assistir ao vídeo completo"
          >
            {/* Ícone de play */}
            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
              <Play className="w-7 h-7 text-[var(--teal)] ml-1" fill="currentColor" />
            </div>

            {/* Balão de texto */}
            <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
              Toque para assistir ao vídeo completo
            </span>
          </button>
        </>
      ) : (
        <>
          <style>{`
            wistia-player[media-id='${MEDIA_ID}']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${MEDIA_ID}/swatch');
              display: block;
              filter: blur(5px);
              padding-top: 125.0%;
            }
            wistia-player[media-id='${MEDIA_ID}'] {
              display: block;
              width: 100%;
              border-radius: 1.25rem;
              overflow: hidden;
              box-shadow: 0 24px 60px -12px rgba(44, 93, 99, 0.25);
            }
          `}</style>
          <wistia-player media-id={MEDIA_ID} aspect="0.8" />
        </>
      )}
    </div>
  );
}
