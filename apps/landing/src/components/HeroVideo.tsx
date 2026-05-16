import React, { useEffect } from 'react';

declare global {
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
  useEffect(() => {
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
  }, []);

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[440px] mx-auto">
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
    </div>
  );
}
