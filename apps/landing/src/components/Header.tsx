import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const whatsappLink = "https://wa.me/5511926681180?text=Oi!%20Quero%20encomendar%20uma%20m%C3%BAsica%20personalizada.%20Por%20onde%20come%C3%A7o%3F";

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl bg-[#F4EEDC]/70 backdrop-blur-md border border-[var(--teal)]/10 rounded-full shadow-lg transition-all duration-300">
      <div className="px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img 
              src="/nova-logo-virahit.svg" 
              alt="ViraHit Logo" 
              width="120"
              height="40"
              className="h-8 sm:h-10 w-auto object-contain"
              fetchPriority="high"
              decoding="sync"
            />
          </Link>
        </div>
        <a 
          href="https://wa.me/5511926681180?text=Oi%2C%20preciso%20de%20ajuda" 
          className="text-[var(--teal)]/60 text-sm hover:text-[var(--teal)] transition-colors"
          aria-label="Suporte"
        >
          Suporte
        </a>
      </div>
    </header>
  );
}
