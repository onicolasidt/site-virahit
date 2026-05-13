import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PremiumPlayerProps {
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc?: string;
  duration?: string;
}

export default function PremiumPlayer({ title, artist, audioSrc, coverSrc, duration = "03:15" }: PremiumPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
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
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  return (
    <div className="premium-player shrink-0 w-[300px] md:w-[360px] snap-center !m-0">
      <div className="player-artwork relative">
        <div className="artwork-glow"></div>
        {coverSrc ? (
          <img src={coverSrc} alt={title} className="w-full h-full object-cover rounded-[20px] relative z-10" loading="lazy" />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 3 }}>
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </div>
      
      <div className="player-info">
        <div className="player-title truncate">{title}</div>
        <div className="player-artist truncate">{artist}</div>
      </div>

      <div className="player-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="player-times">
        <span>{currentTime}</span>
        <span>{duration}</span>
      </div>

      <div className="player-controls">
        <button className="control-btn" aria-label="Voltar">
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button className="control-btn play-btn" aria-label="Tocar" onClick={togglePlay}>
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
        
        <button className="control-btn" aria-label="Avançar">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <audio 
        ref={audioRef} 
        src={audioSrc} 
        preload="none"
        onPlay={(e) => {
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
    </div>
  );
}
