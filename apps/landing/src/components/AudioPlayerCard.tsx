import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerCardProps {
  style: string;
  framing: string;
  audioSrc: string;
  accentColor?: string;
}

// Registro global para garantir que só um player toca por vez
let globalPauseAll: (() => void)[] = [];

export default function AudioPlayerCard({
  style,
  framing,
  audioSrc,
  accentColor = 'var(--gold)',
}: AudioPlayerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number): string => {
    if (!isFinite(secs) || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pauseThis = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pausa todos os outros áudios da página
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });
      setIsLoading(true);
      audioRef.current.play().catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    const pct = dur ? (ct / dur) * 100 : 0;
    setProgress(pct);
    setCurrentTime(formatTime(ct));
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(formatTime(audioRef.current.duration));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  return (
    <div
      className="w-full mx-auto bg-white rounded-2xl overflow-hidden"
      style={{
        maxWidth: '560px',
        boxShadow: '0 8px 32px rgba(44, 93, 99, 0.06)',
        padding: '24px',
      }}
    >
      {/* Rótulo do estilo */}
      <span
        className="block text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        style={{ color: accentColor }}
      >
        {style}
      </span>

      {/* Framing */}
      <p
        className="text-base leading-relaxed mb-5"
        style={{
          fontFamily: 'Merriweather, Georgia, serif',
          fontStyle: 'italic',
          color: 'var(--teal-light)',
        }}
      >
        "{framing}"
      </p>

      {/* Divisória */}
      <div
        className="mb-5"
        style={{ borderTop: '1px solid rgba(44, 93, 99, 0.08)' }}
      />

      {/* Player: botão + barra + tempo */}
      <div className="flex items-center gap-4">
        {/* Botão play/pause */}
        <button
          onClick={handlePlay}
          aria-label={isPlaying ? 'Pausar' : 'Tocar'}
          className="shrink-0 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            background: accentColor,
            boxShadow: `0 4px 14px rgba(234, 161, 21, 0.35)`,
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-current" />
          ) : (
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          )}
        </button>

        {/* Barra de progresso */}
        <div
          className="flex-grow h-2 rounded-full cursor-pointer relative overflow-hidden"
          style={{ background: '#F4EEDC' }}
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: accentColor }}
          />
        </div>

        {/* Tempo */}
        <span
          className="shrink-0 text-sm font-mono"
          style={{ color: 'var(--teal-light)', minWidth: '72px', textAlign: 'right' }}
        >
          {currentTime} / {duration}
        </span>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="none"
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
        onWaiting={() => setIsLoading(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setProgress(0); setCurrentTime('0:00'); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
    </div>
  );
}
