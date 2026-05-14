import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music, Zap, Star, MessageCircle, HelpCircle } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Como funciona', href: '#como-funciona', icon: Zap        },
  { label: 'Vantagens',     href: '#vantagens',     icon: Star       },
  { label: 'Depoimentos',   href: '#depoimentos',   icon: MessageCircle },
  { label: 'FAQ',           href: '#faq',           icon: HelpCircle },
];

const WHATSAPP_URL =
  'https://wa.me/5511926681180?text=Oi!%20Quero%20encomendar%20uma%20m%C3%BAsica%20personalizada.%20Por%20onde%20come%C3%A7o%3F';

const QUIZ_URL = '/quiz';

export function Header() {
  const [open, setOpen]           = useState(false);
  // rounded controla o border-radius sem depender da transição de largura
  const [rounded, setRounded]     = useState(false);
  const navRef                    = useRef<HTMLDivElement>(null);

  // Ao abrir: arredonda imediatamente; ao fechar: espera o menu recolher (300ms)
  useEffect(() => {
    if (open) {
      setRounded(true);
    } else {
      const t = setTimeout(() => setRounded(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // Blur no fundo
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) main.style.filter = open ? 'blur(6px)' : '';
    return () => { if (main) main.style.filter = ''; };
  }, [open]);

  const handleNavClick = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  return (
    <>
      {/* Keyframes para shimmer e swing — injetados uma vez */}
      <style>{`
        @keyframes vh-shimmer {
          0%   { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(250%)  skewX(-20deg); }
        }
        @keyframes vh-swing {
          0%,100% { transform: rotate(0deg);   }
          25%     { transform: rotate(-12deg);  }
          75%     { transform: rotate(12deg);   }
        }
        .vh-btn-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: vh-shimmer 2.8s ease-in-out infinite;
          animation-delay: 1s;
          pointer-events: none;
        }
        .vh-btn-icon {
          animation: vh-swing 2.8s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>

      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div
          ref={navRef}
          className={`
            bg-[#F4EEDC]/80 backdrop-blur-md border border-[var(--teal)]/10 shadow-lg
            transition-[box-shadow,background-color,border-color] duration-300 ease-in-out
            ${rounded ? 'rounded-3xl' : 'rounded-full'}
          `}
        >

          {/* ── Row principal ── */}
          <div className="px-5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">

            {/* Logo */}
            <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
              <img
                src="/nova-logo-virahit.svg"
                alt="ViraHit"
                width="120" height="40"
                className="h-7 sm:h-9 w-auto object-contain"
                fetchPriority="high"
                decoding="sync"
              />
            </Link>

            {/* Direita */}
            <div className="flex items-center gap-2">

              {/* CTA — gold com shimmer + swing no ícone */}
              <a
                href={QUIZ_URL}
                className="
                  vh-btn-shimmer
                  relative overflow-hidden
                  flex items-center gap-2 px-4 sm:px-5 h-10 sm:h-11 rounded-full
                  bg-[var(--gold)] text-white
                  font-['Open_Sans'] font-extrabold text-[13px] sm:text-[14px] uppercase tracking-wide
                  shadow-[0_4px_14px_rgba(234,161,21,0.45)]
                  hover:bg-[#C99A3C] hover:shadow-[0_6px_20px_rgba(234,161,21,0.6)]
                  active:scale-95 transition-all duration-200 whitespace-nowrap
                "
              >
                <Music className="vh-btn-icon w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>Criar Música</span>
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={open}
                className="
                  w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center gap-[5px]
                  rounded-full bg-[var(--teal)]/8 hover:bg-[var(--teal)]/15
                  active:scale-95 transition-all duration-200 shrink-0
                "
              >
                <span className={`block w-5 h-[2px] bg-[var(--teal)] rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block w-5 h-[2px] bg-[var(--teal)] rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block w-5 h-[2px] bg-[var(--teal)] rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Menu expansível ── */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${open ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="border-t border-[var(--teal)]/10 mx-4" />

            {/* Links com ícone */}
            <nav className="flex flex-col px-3 py-3 gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className="
                    w-full text-left px-4 py-4 rounded-2xl
                    flex items-center gap-3
                    text-[var(--teal)] font-['Merriweather'] font-bold text-[18px] leading-snug
                    hover:bg-[var(--teal)]/5 active:bg-[var(--teal)]/10
                    transition-colors duration-150
                  "
                >
                  <Icon className="w-5 h-5 shrink-0 text-[var(--gold)]" strokeWidth={2} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="border-t border-[var(--teal)]/10 mx-4" />

            {/* WhatsApp */}
            <div className="px-4 py-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="
                  flex items-center gap-3 w-full px-4 py-4 rounded-2xl
                  bg-[#25D366]/20 border border-[#25D366]/30
                  hover:bg-[#25D366]/30
                  transition-colors active:scale-[0.98]
                "
              >
                <svg className="w-5 h-5 text-[#1aad54] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="font-['Merriweather'] font-bold text-[17px] text-[var(--teal)]">
                  Falar no WhatsApp
                </span>
              </a>
            </div>

            <div className="h-2" />
          </div>
        </div>
      </header>
    </>
  );
}
