import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, MessageCircle, Signal, Wifi, BatteryMedium, ChevronLeft, 
  CheckCheck, Play, Heart, Mic
} from 'lucide-react';

export default function PhoneMockupCSS() {
  const [chatStep, setChatStep] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Fixed Time State
  const currentTime = '08:14';
  const futureTime = '19:30';

  useEffect(() => {
    // Sequence for the chat animation loop
    const sequence = [
      1500, // 0: idle -> wait 1.5s
      2000, // 1: typing1 -> wait 2s
      2000, // 2: msg1 -> wait 2s
      3000, // 3: recording -> wait 3s
      2000, // 4: audio -> wait 2s
      2000, // 5: typing2 -> wait 2s
      3000, // 6: msg2 -> wait 3s
      2000, // 7: reaction -> wait 2s
      5000, // 8: hold before reset
    ];

    let timeout: NodeJS.Timeout;
    let currentStep = 0;

    const nextStep = () => {
      if (currentStep >= sequence.length - 1) {
        // Stop the loop when reaching the end
        return;
      }
      
      currentStep = currentStep + 1;
      setChatStep(currentStep);
      
      timeout = setTimeout(nextStep, sequence[currentStep]);
    };

    timeout = setTimeout(nextStep, sequence[0]);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Evita cálculo de scroll no carregamento inicial (chatStep === 0)
    if (chatContainerRef.current && chatStep > 0) {
      // requestAnimationFrame joga o cálculo para depois que a tela for pintada
      // eliminando o Forced Synchronous Layout (Reflow de 86ms)
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [chatStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + 2; // 2% every 100ms = 5 seconds total for demo
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioProgress >= 100) setAudioProgress(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto flex justify-center" style={{ contain: 'layout' }}>
      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-badge-1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes float-badge-2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes pop-in-msg {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pop-in-heart {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-levitate { animation: levitate 6s ease-in-out infinite; }
        .animate-badge-1 { animation: float-badge-1 4s ease-in-out infinite 1s; }
        .animate-badge-2 { animation: float-badge-2 5s ease-in-out infinite 2s; }
        .animate-dot-1 { animation: blink-dot 1.5s infinite 0s; }
        .animate-dot-2 { animation: blink-dot 1.5s infinite 0.2s; }
        .animate-dot-3 { animation: blink-dot 1.5s infinite 0.4s; }
        .animate-pop-msg { 
          animation: pop-in-msg 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
          transform-origin: top left;
        }
        .animate-pop-heart { 
          animation: pop-in-heart 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
          transform-origin: center;
        }
      `}</style>

      {/* The Divine Glow (Poça de Luz) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[var(--gold)]/20 blur-[80px] rounded-full z-0 pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10 w-full animate-levitate">
        {/* Floating Badges - Glassmorphism */}
        <div className="absolute top-16 -left-8 sm:-left-12 bg-[var(--teal)]/90 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold shadow-lg z-30 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap border border-[var(--gold)]/30 animate-badge-1">
          <Music className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--gold)]" />
          Voz Profissional
        </div>

        <div className="absolute bottom-32 -right-8 sm:-right-12 bg-[var(--teal)]/90 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold shadow-lg z-30 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap border border-[var(--gold)]/30 animate-badge-2">
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--gold)]" />
          Feito no WhatsApp
        </div>

        {/* Phone Hardware Frame */}
        <div className="relative aspect-[9/19.5] w-full rounded-[3rem] p-[6px] sm:p-[8px] bg-[#1c1c1e] shadow-[0_20px_40px_-10px_rgba(217,138,44,0.3),0_0_0_1px_rgba(255,255,255,0.15),inset_0_0_0_2px_rgba(217,138,44,0.15)] overflow-visible z-10 flex flex-col text-left">
        
        {/* Hardware Buttons */}
        <div className="absolute top-24 -left-[2px] w-[3px] h-8 bg-[#2c2c2e] rounded-l-md"></div>
        <div className="absolute top-36 -left-[2px] w-[3px] h-12 bg-[#2c2c2e] rounded-l-md"></div>
        <div className="absolute top-52 -left-[2px] w-[3px] h-12 bg-[#2c2c2e] rounded-l-md"></div>
        <div className="absolute top-40 -right-[2px] w-[3px] h-16 bg-[#2c2c2e] rounded-r-md"></div>

        {/* Screen */}
        <div className="relative flex-1 bg-[#F4EEDC] flex flex-col overflow-hidden rounded-[2.6rem] shadow-[inset_0_0_0_4px_#121212]">
          
          {/* Status Bar - Minimalist */}
          <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-between px-7 z-40 text-[#121212]/50 text-[12px] font-medium pt-2">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 opacity-60">
              <Signal className="w-3.5 h-3.5 fill-current" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-5 h-5 fill-current" />
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-[#121212] rounded-full z-50 flex items-center justify-end px-2.5">
            <div className="w-3 h-3 rounded-full bg-[#1a1a1a] shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]"></div>
          </div>

          {/* WhatsApp Background Pattern - Extremely subtle */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

          {/* Header - Clean */}
          <div className="bg-white/90 backdrop-blur-md text-[#121212] px-3 pb-2 pt-12 flex items-center gap-2 border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-20 relative">
            <div className="flex items-center text-[#007AFF] shrink-0 opacity-80">
              <ChevronLeft className="w-6 h-6 -ml-1" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center -ml-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-white/50 mb-0.5 shadow-sm">
                <img src="/avatar-virahit.jpg" alt="ViraHit" className="w-full h-full object-cover" fetchPriority="high" decoding="sync" />
              </div>
              <div className="font-semibold text-[13px] text-gray-800 truncate leading-none">ViraHit</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">
                {chatStep === 1 || chatStep === 5 ? (
                  <span className="text-[#007AFF] flex items-center justify-center">
                    digitando
                    <span className="animate-dot-1">.</span>
                    <span className="animate-dot-2">.</span>
                    <span className="animate-dot-3">.</span>
                  </span>
                ) : chatStep === 3 ? (
                  <span className="text-[#007AFF] flex items-center justify-center">
                    gravando áudio
                    <span className="animate-dot-1">.</span>
                    <span className="animate-dot-2">.</span>
                    <span className="animate-dot-3">.</span>
                  </span>
                ) : (
                  'online'
                )}
              </div>
            </div>
            <div className="w-6 shrink-0"></div> {/* Spacer for balance */}
          </div>

          {/* Chat Area */}
          <div ref={chatContainerRef} className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto z-10 scroll-smooth pb-8 font-sans">
            {/* Date Badge */}
            <div className="flex justify-center mb-2 mt-1">
              <span className="bg-white/60 text-gray-500 text-[10px] uppercase tracking-wider font-medium px-3 py-1 rounded-full shadow-sm border border-white/40">Hoje</span>
            </div>

            {/* Sent Message (User Audio) */}
            <div className="self-end bg-[#E1F7CB] text-gray-800 p-2 rounded-2xl rounded-tr-sm max-w-[85%] w-[200px] shadow-sm relative mt-2">
              <div className="flex items-center gap-2.5">
                {/* Play Button */}
                <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-gray-600 ml-0.5 fill-current" />
                </div>
                <div className="flex-1">
                  {/* Fake Waveform */}
                  <div className="flex items-center gap-[2px] h-5">
                    {[20, 40, 30, 60, 80, 50, 30, 70, 90, 40, 20, 50, 70, 30, 40, 60, 80, 100, 70, 40].map((h, i) => (
                      <div key={i} className="w-[3px] rounded-full bg-gray-400/50" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">1:02</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-1 -mt-2 pr-1">
                <span className="text-[10px] text-gray-500 font-medium">{currentTime}</span>
                <CheckCheck className="w-4 h-4 text-[#34B7F1]" />
              </div>
            </div>

            {/* Received Message 1 (ViraHit Text) */}
            {chatStep >= 2 && (
              <div className="self-start bg-white text-gray-800 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] text-[14px] shadow-sm relative mt-1 border border-gray-100/50 animate-pop-msg">
                <p className="leading-snug pr-1">Que história linda! ✨ Vou compor uma música emocionante com todos esses detalhes. Só um instante...</p>
                <div className="flex justify-end items-center gap-1 mt-1.5 -mb-1">
                  <span className="text-[10px] text-gray-400 font-medium">{currentTime}</span>
                </div>
              </div>
            )}

            {/* Received Message 2 (ViraHit Audio) */}
            {chatStep >= 4 && (
              <div className="self-start bg-white text-gray-800 p-2 rounded-2xl rounded-tl-sm max-w-[90%] w-[240px] shadow-sm relative mt-1 border border-gray-100/50 animate-pop-msg">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    <img src="/avatar-virahit.jpg" alt="ViraHit" className="w-full h-full object-cover" fetchPriority="high" decoding="sync" />
                  </div>
                  {/* Play Button */}
                  <button 
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
                  >
                    {isPlaying ? (
                      <div className="w-3 h-3 bg-white rounded-sm" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5 fill-current" />
                    )}
                  </button>
                  <div className="flex-1">
                    {/* Fake Waveform */}
                    <div className="flex items-center gap-[2px] h-6 cursor-pointer" onClick={togglePlay}>
                      {[30, 50, 40, 80, 100, 60, 40, 70, 90, 50, 30, 60, 80, 40, 50, 30, 40, 60, 80, 100, 70, 50, 40, 60].map((h, i, arr) => {
                        const isActive = (i / arr.length) * 100 <= audioProgress;
                        return (
                          <div key={i} className={`w-[3px] rounded-full transition-colors duration-200 ${isActive ? 'bg-[#007AFF]' : 'bg-gray-200'}`} style={{ height: `${h}%` }}></div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {audioProgress > 0 ? `0:${Math.floor((audioProgress / 100) * 59).toString().padStart(2, '0')}` : '4:17'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-1 -mt-2 pr-1">
                  <span className="text-[10px] text-gray-400 font-medium">{futureTime}</span>
                </div>

                {/* Heart Reaction */}
                {chatStep >= 7 && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100 z-10 animate-pop-heart">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </div>
                )}
              </div>
            )}

            {/* Received Message 3 (ViraHit Text) */}
            {chatStep >= 6 && (
              <div className="self-start bg-white text-gray-800 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] text-[14px] shadow-sm relative mt-1 border border-gray-100/50 animate-pop-msg">
                <p className="leading-snug pr-1">Aqui está! Espero que ela se emocione. ✨</p>
                <div className="flex justify-end items-center gap-1 mt-1.5 -mb-1">
                  <span className="text-[10px] text-gray-400 font-medium">{futureTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar - Minimalist */}
          <div className="bg-white/80 backdrop-blur-md px-3 py-3 flex items-center gap-3 z-20 pb-6 border-t border-gray-100">
            <div className="flex-1 bg-gray-100/80 rounded-full px-4 py-2 flex items-center border border-gray-200/50">
              <span className="text-gray-400 text-[14px] flex-1 font-sans">Mensagem</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0 shadow-md">
              <Mic className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
