import React, { useState, useRef } from 'react';
import { Pause, Play, CheckCheck, Star } from 'lucide-react';

interface WhatsAppTestimonialProps {
  userName: string;
  userLocation: string;
  userText: string;
  songAudioSrc: string;
  reviewText: string;
  rating?: number;
  avatarLetters: string;
  avatarImgSrc?: string;
  timeSent: string;
  timeReceived: string;
}

export default function WhatsAppTestimonial({
  userName,
  userLocation,
  userText,
  songAudioSrc,
  reviewText,
  rating = 5,
  avatarLetters,
  avatarImgSrc,
  timeSent,
  timeReceived
}: WhatsAppTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // If it's paused and we want to play, set loading to true until it actually plays
        setIsLoading(true);
        audioRef.current.play().catch(() => {
          setIsLoading(false);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[var(--teal)]/10 flex flex-col h-full break-inside-avoid">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 text-white">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden">
          <img src="/avatar-virahit.jpg" alt="ViraHit" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
        <div>
          <p className="font-bold text-sm">ViraHit</p>
          <p className="text-[10px] opacity-80">Conta comercial oficial</p>
        </div>
      </div>

      {/* WhatsApp Chat Area */}
      <div 
        className="bg-[#E5DDD5] p-4 flex flex-col gap-4 relative" 
        style={{ 
          backgroundImage: 'radial-gradient(#d1c9c0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#E5DDD5'
        }}
      >
        
        {/* Bot Message (Left) */}
        <div className="self-start max-w-[85%] bg-white rounded-lg rounded-tl-none p-3 shadow-sm relative pb-6 mt-2">
          <p className="text-sm text-gray-800 mb-3 font-medium">Aqui está a sua música! 🎵✨</p>
          
          {/* Custom Audio Player */}
          <div className="bg-[#F2F2F2] rounded-full p-2 flex items-center gap-3 mb-1">
            <button 
              onClick={togglePlay} 
              className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>
            <div className="flex-grow h-1.5 bg-gray-300 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-[#25D366] transition-all duration-100" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-mono shrink-0">
              <CheckCheck className="w-4 h-4 inline-block align-middle mr-1 text-[#34B7F1]" />
            </span>
          </div>
          <audio 
            ref={audioRef} 
            src={songAudioSrc} 
            preload="none"
            onPlay={(e) => {
              // Pausa todos os outros áudios da página quando este começa a tocar
              document.querySelectorAll('audio').forEach((audioEl) => {
                if (audioEl !== e.target) {
                  audioEl.pause();
                }
              });
            }}
            onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
            onWaiting={() => setIsLoading(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => { setIsPlaying(false); setProgress(0); }} 
            onTimeUpdate={handleTimeUpdate}
            className="hidden" 
          />
          
          <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">{timeReceived}</span>
        </div>
      </div>

      {/* Review Area */}
      <div className="p-6 bg-white border-t border-gray-100 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex gap-1 text-[var(--gold)] mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current text-lg" />
            ))}
          </div>
          <p className="text-[var(--teal)] italic text-lg leading-relaxed mb-6">"{reviewText}"</p>
        </div>
        <div className="flex items-center gap-4 border-t border-[var(--teal)]/10 pt-4 mt-auto">
          <div className="w-12 h-12 rounded-full bg-[var(--teal)] flex items-center justify-center font-bold text-[var(--cream)] text-lg shadow-inner overflow-hidden">
            {avatarImgSrc ? (
              <img src={avatarImgSrc} alt={userName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              avatarLetters
            )}
          </div>
          <div>
            <p className="heading-font text-[var(--teal)] text-sm">{userName}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{userLocation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
