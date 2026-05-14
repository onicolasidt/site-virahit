import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wistia-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'media-id'?: string;
          aspect?: string;
          muted?: string;
          autoplay?: string;
          'playbar-control'?: string;
          'big-play-button'?: string;
          'end-video-behavior'?: string;
          'volume-control'?: string;
        },
        HTMLElement
      >;
    }
  }
}

const MEDIA_ID = '9f2cf5bfpe';

export default function HeroVideo() {
  const [muted, setMuted] = useState(true);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const playerRef = useRef<HTMLElement | null>(null);

  // Injeta os scripts do Wistia uma vez (async, não bloqueia render)
  useEffect(() => {
    const ids = [
      'wistia-player-js',
      `wistia-embed-${MEDIA_ID}`,
    ];
    const urls = [
      'https://fast.wistia.com/player.js',
      `https://fast.wistia.com/embed/${MEDIA_ID}.js`,
    ];

    let loaded = 0;
    urls.forEach((src, i) => {
      if (document.getElementById(ids[i])) {
        loaded++;
        if (loaded === urls.length) setScriptsLoaded(true);
        return;
      }
      const s = document.createElement('script');
      s.id = ids[i];
      s.src = src;
      s.async = true;
      if (i === 1) s.type = 'module';
      s.onload = () => {
        loaded++;
        if (loaded === urls.length) setScriptsLoaded(true);
      };
      document.head.appendChild(s);
    });
  }, []);

  // Sincroniza muted no elemento nativo após scripts carregarem
  useEffect(() => {
    if (!scriptsLoaded) return;
    const el = document.querySelector(`wistia-player[media-id="${MEDIA_ID}"]`) as any;
    if (!el) return;
    playerRef.current = el;

    const apply = () => {
      if (typeof el.mute === 'function') {
        muted ? el.mute() : el.unmute();
      } else {
        // fallback via atributo
        if (muted) el.setAttribute('muted', '');
        else el.removeAttribute('muted');
      }
    };

    // Aguarda o player estar pronto
    if (typeof el.ready === 'function') {
      el.ready().then(apply).catch(apply);
    } else {
      apply();
    }
  }, [muted, scriptsLoaded]);

  const toggleMute = () => setMuted(m => !m);

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto flex flex-col items-center">
      {/* Glow de fundo igual ao PhoneMockupCSS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[var(--gold)]/20 blur-[80px] rounded-full z-0 pointer-events-none animate-pulse-slow" />

      {/* Container do player com moldura tipo celular */}
      <div className="relative z-10 w-full rounded-[2.8rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(217,138,44,0.3),0_0_0_1px_rgba(255,255,255,0.15),inset_0_0_0_2px_rgba(217,138,44,0.15)] bg-[#1c1c1e]">
        {/* Swatch de blur enquanto o player carrega (igual ao CSS do Wistia) */}
        <style>{`
          wistia-player[media-id='${MEDIA_ID}']:not(:defined) {
            background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${MEDIA_ID}/swatch');
            display: block;
            filter: blur(5px);
            padding-top: 125.0%;
          }
          wistia-player[media-id='${MEDIA_ID}'] {
            border-radius: 2.4rem;
            overflow: hidden;
            display: block;
            width: 100%;
          }
        `}</style>

        <wistia-player
          media-id={MEDIA_ID}
          aspect="0.8"
          autoplay="true"
          muted={muted ? 'true' : undefined}
          end-video-behavior="loop"
          playbar-control="none"
          big-play-button="false"
          volume-control="none"
        />
      </div>

      {/* Botão mute/unmute flutuante */}
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        className="mt-3 flex items-center gap-2 bg-[var(--teal)]/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-[var(--gold)]/30 hover:bg-[var(--teal)] transition-colors active:scale-95"
      >
        {muted ? (
          <>
            <VolumeX className="w-4 h-4 text-[var(--gold)]" />
            Toque para ouvir
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-[var(--gold)]" />
            Com som
          </>
        )}
      </button>
    </div>
  );
}
