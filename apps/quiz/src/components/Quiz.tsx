import React, { useState, useEffect, useRef } from 'react';
import { AUDIO_EXEMPLOS_QUIZ } from '../lib/audioExemplos';

type Vinculo = 'Mãe' | 'Pai' | 'Parceiro/a' | 'Filho/a' | 'Amigo/a' | 'Irmão/a' | 'Avó/Avô' | 'Outro';

interface QuizData {
  vinculo: Vinculo | null;
  vinculoOutro: string;
  nome: string;
  genero: 'F' | 'M' | null;
  estilo: string | null;
  voz: 'Feminina' | 'Masculina' | null;
  campoA: string;
  campoB: string;
  campoC: string[];
  campoCOutro: string;
  audioNome: number[];
  audioCampoA: number[];
  audioCampoB: number[];
  audioCampoCOutro: number[];
}

const initialData: QuizData = {
  vinculo: null,
  vinculoOutro: '',
  nome: '',
  genero: null,
  estilo: null,
  voz: null,
  campoA: '',
  campoB: '',
  campoC: [],
  campoCOutro: '',
  audioNome: [],
  audioCampoA: [],
  audioCampoB: [],
  audioCampoCOutro: [],
};

export function resolverGenero(texto: string, genero: 'F' | 'M' | null, nome: string): string {
  if (!texto) return '';
  const g = genero === 'M' ? 'M' : 'F'; // Default to F for rendering if not set
  const nomeFormatado = nome ? nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase() : '';
  const tokens: Record<string, string> = {
    '[NOME]': nomeFormatado || '',
    '[A_O]': g === 'F' ? 'a' : 'o',
    '[A_O_CAPS]': g === 'F' ? 'A' : 'O',
    '[DA_DO]': g === 'F' ? 'da' : 'do',
    '[DA_DO_CAPS]': g === 'F' ? 'Da' : 'Do',
    '[ELA_ELE]': g === 'F' ? 'ela' : 'ele',
    '[ELA_ELE_CAPS]': g === 'F' ? 'Ela' : 'Ele',
    '[DELA_DELE]': g === 'F' ? 'dela' : 'dele',
    '[DELA_DELE_CAPS]': g === 'F' ? 'Dela' : 'Dele',
    '[A_O_PRON]': g === 'F' ? 'a' : 'o',
    '[A_O_PRON_CAPS]': g === 'F' ? 'A' : 'O',
    '[AMADA_AMADO]': g === 'F' ? 'amada' : 'amado',
    '[AMADA_AMADO_CAPS]': g === 'F' ? 'Amada' : 'Amado',
  };

  return Object.entries(tokens).reduce(
    (str, [token, valor]) => str.replaceAll(token, valor),
    texto
  );
}

const VINCULOS = [
  { emoji: '❤️', label: 'Parceiro/a', proof: 'Mais de 900 casais eternizaram a história deles.' },
  { emoji: '🤱', label: 'Mãe', proof: 'Mais de 1.200 mães já ganharam uma música só delas.' },
  { emoji: '👨‍👧', label: 'Pai', proof: 'Mais de 600 pais receberam a música que mereciam.' },
  { emoji: '👶', label: 'Filho/a', proof: 'Mais de 500 famílias criaram a música do filho delas.' },
  { emoji: '🤝', label: 'Amigo/a', proof: 'Centenas de amizades viraram música. A próxima é a de vocês.' },
  { emoji: '👫', label: 'Irmão/a', proof: 'Irmãos que nunca souberam como agradecer — agora sabem.' },
  { emoji: '👵🏽', label: 'Avó/Avô', proof: 'A emoção de uma vida inteira em forma de música.' },
  { emoji: '✨', label: 'Outro', proof: 'Mais de 3.000 músicas entregues. A próxima é pra pessoa certa.' },
] as const;

const ESTILOS = [
  { emoji: '🤠', label: 'Sertanejo' },
  { emoji: '🙏', label: 'Gospel' },
  { emoji: '🪗', label: 'Forró' },
  { emoji: '🥁', label: 'Pagode' },
  { emoji: '🎶', label: 'Samba' },
  { emoji: '🎸', label: 'MPB' },
  { emoji: '💔', label: 'Arrocha' },
  { emoji: '🤘', label: 'Rock Brasileiro' },
];

const INTENCOES = [
  'Que [ELA_ELE] chore de emoção',
  'Que [ELA_ELE] se sinta [AMADA_AMADO] de verdade',
  'Que [ELA_ELE] saiba o quanto eu [A_O_PRON] admiro',
  'Que a gente nunca esqueça esse momento',
  'Que [ELA_ELE] veja o sacrifício [DELA_DELE] reconhecido',
];

interface QuizProps {
  onFinishQuiz: () => void;
  initialStep?: number;
}

export function Quiz({ onFinishQuiz, initialStep = 1 }: QuizProps) {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<QuizData>(initialData);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [isRecordingFor, setIsRecordingFor] = useState<keyof QuizData | null>(null);
  const [playingStyle, setPlayingStyle] = useState<string | null>(null);
  const [loadingStyle, setLoadingStyle] = useState<string | null>(null);
  const [rascunhoId, setRascunhoId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nomeInputRef = useRef<HTMLInputElement | null>(null);
  const continuar1Ref = useRef<HTMLButtonElement | null>(null);
  const vozSectionRef = useRef<HTMLDivElement | null>(null);
  const continuar2Ref = useRef<HTMLButtonElement | null>(null);

  // Gravação real com MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  // Mapa de audioId -> URL blob para reprodução
  const audioBlobsRef = useRef<Map<number, string>>(new Map());
  // Mapa de audioId -> audioId do servidor (para referência)
  const serverAudioIdsRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    // Restaurar blobs do localStorage ao montar (caso usuario tenha recarregado)
    try {
      const stored = JSON.parse(localStorage.getItem('virahit_audio_blobs') || '{}');
      Object.entries(stored).forEach(([id, base64]) => {
        if (!audioBlobsRef.current.has(Number(id))) {
          fetch(base64 as string)
            .then(r => r.blob())
            .then(blob => {
              audioBlobsRef.current.set(Number(id), URL.createObjectURL(blob));
            });
        }
      });
    } catch (e) {}
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handlePlayEstilo = (estiloLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (playingStyle === estiloLabel) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingStyle(null);
      return;
    }

    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingStyle(null);

    const url = AUDIO_EXEMPLOS_QUIZ[estiloLabel];
    if (!url || url.includes('[URL_FIREBASE_STORAGE]')) {
      setLoadingStyle(estiloLabel);
      setTimeout(() => {
        setLoadingStyle(null);
        setPlayingStyle(estiloLabel);
        setTimeout(() => setPlayingStyle(p => p === estiloLabel ? null : p), 15000);
      }, 800);
      return;
    }

    setLoadingStyle(estiloLabel);
    const audio = new Audio(url);
    audio.oncanplay = () => {
      setLoadingStyle(null);
      setPlayingStyle(estiloLabel);
      audio.play();
    };
    audio.onended = () => {
      setPlayingStyle(null);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setLoadingStyle(null);
      setPlayingStyle(null);
    };
    audioRef.current = audio;
  };

  // Scroll to top on step change or mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Load from local storage (fallback para rascunho antigo)
  useEffect(() => {
    // Tentar recuperar rascunhoId do localStorage
    const savedRascunhoId = localStorage.getItem('virahit_rascunho_id');
    if (savedRascunhoId) {
      setRascunhoId(savedRascunhoId);
      // Buscar dados do servidor
      fetch(`/api/rascunho/${savedRascunhoId}`)
        .then(r => r.json())
        .then(res => {
          if (res.success && res.data) {
            setData({
              ...res.data,
              audioNome: Array.isArray(res.data.audioNome) ? res.data.audioNome : [],
              audioCampoA: Array.isArray(res.data.audioCampoA) ? res.data.audioCampoA : [],
              audioCampoB: Array.isArray(res.data.audioCampoB) ? res.data.audioCampoB : [],
              audioCampoCOutro: Array.isArray(res.data.audioCampoCOutro) ? res.data.audioCampoCOutro : [],
            });
            const savedStep = res.data.step;
            if (savedStep && ['2', '3'].includes(String(savedStep))) {
              setStep(Number(savedStep));
            }
            setTimeout(() => {
              setShowDraftToast(true);
              setTimeout(() => setShowDraftToast(false), 4000);
            }, 800);
          }
        })
        .catch(() => {});
      return;
    }

    // Fallback: carregar do localStorage antigo (migracao)
    const saved = localStorage.getItem('virahit_quiz_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({
          ...parsed,
          audioNome: Array.isArray(parsed.audioNome) ? parsed.audioNome : [],
          audioCampoA: Array.isArray(parsed.audioCampoA) ? parsed.audioCampoA : [],
          audioCampoB: Array.isArray(parsed.audioCampoB) ? parsed.audioCampoB : [],
          audioCampoCOutro: Array.isArray(parsed.audioCampoCOutro) ? parsed.audioCampoCOutro : [],
        });
        const savedStep = localStorage.getItem('virahit_quiz_step');
        if (savedStep && ['2', '3'].includes(savedStep)) {
          setStep(Number(savedStep));
        }
        setTimeout(() => {
          setShowDraftToast(true);
          setTimeout(() => setShowDraftToast(false), 4000);
        }, 800);
      } catch (e) {
        console.error("Failed to parse draft");
      }
    }
  }, []);

  // Salvar rascunho no servidor a cada mudança (debounce 3s)
  const rascunhoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (rascunhoTimeoutRef.current) clearTimeout(rascunhoTimeoutRef.current);
    rascunhoTimeoutRef.current = setTimeout(() => {
      salvarRascunho();
    }, 3000);
    return () => {
      if (rascunhoTimeoutRef.current) clearTimeout(rascunhoTimeoutRef.current);
    };
  }, [data, step]);

  const salvarRascunho = async () => {
    try {
      const payload = {
        rascunhoId,
        step,
        data: {
          ...data,
          audioBlobs: undefined, // nunca enviar audioBlobs pro rascunho
        },
      };
      const res = await fetch('/api/salvar-rascunho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.rascunhoId) {
        setRascunhoId(result.rascunhoId);
        localStorage.setItem('virahit_rascunho_id', result.rascunhoId);
      }
    } catch (e) {
      console.error('Erro ao salvar rascunho:', e);
    }
  };

  const autoSaveNow = (newData: QuizData) => {
    setData(newData);
    // Dispara salvar rascunho imediatamente (sem debounce)
    salvarRascunho();
  };

  const handleClearDraft = () => {
    localStorage.removeItem('virahit_rascunho_id');
    localStorage.removeItem('virahit_quiz_draft');
    localStorage.removeItem('virahit_quiz_step');
    localStorage.removeItem('virahit_audio_blobs');
    setData(initialData);
    setStep(1);
    setRascunhoId(null);
    setShowDraftToast(false);
  };

  const selectedVinculoObj = VINCULOS.find(v => v.label === data.vinculo);
  const proofText = selectedVinculoObj?.proof || null;
  const isNameValid = data.nome.trim().length >= 2;

  const simulateRecording = async (field: 'audioNome' | 'audioCampoA' | 'audioCampoB' | 'audioCampoCOutro') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const id = Date.now();
        audioBlobsRef.current.set(id, url);
        stream.getTracks().forEach(t => t.stop());

        // Upload imediato para o servidor (nunca mais localStorage para áudios)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          (async () => {
            try {
              const uploadRes = await fetch('/api/upload-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  base64,
                  campo: field,
                  rascunhoId: rascunhoId || undefined,
                }),
              });
              const uploadResult = await uploadRes.json();
              if (uploadResult.success && uploadResult.audioId) {
                serverAudioIdsRef.current.set(id, uploadResult.audioId);
                // Salva a referência no rascunho
                salvarRascunho();
              }
            } catch (e) {
              console.error('Erro ao fazer upload do áudio:', e);
              // Se falhar o upload, ainda tem o blob em memória para reprodução
            }
          })();
        };
        reader.readAsDataURL(blob);

        autoSaveNow({ ...data, [field]: [...data[field], id] });
        setIsRecordingFor(null);
      };
      mr.start();
      setIsRecordingFor(field);
    } catch (err) {
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const stopRecording = (_field: 'audioNome' | 'audioCampoA' | 'audioCampoB' | 'audioCampoCOutro') => {
    mediaRecorderRef.current?.stop();
  };

  const playAudio = (audioId: number) => {
    const url = audioBlobsRef.current.get(audioId);
    if (!url) return;
    audioRef.current?.pause();
    const a = new Audio(url);
    a.play();
    audioRef.current = a;
  };

  const removeAudio = (field: 'audioNome' | 'audioCampoA' | 'audioCampoB' | 'audioCampoCOutro', idToRemove: number) => {
    autoSaveNow({ ...data, [field]: data[field].filter((id: number) => id !== idToRemove) });
  };

  const renderProgressBar = () => {
    const percentage = step === 1 ? 33 : step === 2 ? 66 : 100;
    return (
      <div className="absolute bottom-0 left-0 w-full bg-[var(--teal)]/10 h-1.5">
        <div className="bg-[var(--gold)] h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-32">
      <header className="sticky top-0 z-50 bg-[var(--cream)]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-[var(--teal)]/10">
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--teal)]/5 text-[var(--teal)] transition-transform active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <img src="/quiz/logo-virahit.svg" alt="ViraHit.ai" className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleClearDraft} className="text-[var(--teal-light)] flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity" title="Começar do zero">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">refresh</span>
            <span className="hidden sm:inline">Começar do zero</span>
          </button>
        </div>
        {renderProgressBar()}
      </header>

      {showDraftToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-[var(--teal)] text-[var(--cream)] px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-sm text-[var(--gold)]">check_circle</span>
          <span className="text-xs font-bold tracking-wide">Continuando de onde você parou</span>
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 pt-12 sm:pt-16">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl sm:text-4xl text-[var(--teal)] mb-8">Para quem vai essa música?</h1>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {VINCULOS.map(v => (
                <button
                  key={v.label}
                  onClick={() => {
                    autoSaveNow({ ...data, vinculo: v.label as Vinculo });
                    // Auto-scroll para o campo nome após selecionar destinatário
                    setTimeout(() => {
                      nomeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      nomeInputRef.current?.focus();
                    }, 200);
                  }}
                  className={`p-4 rounded-sm border-2 text-left transition-all ${data.vinculo === v.label ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30'}`}
                >
                  <span className="text-2xl block mb-2">{v.emoji}</span>
                  <span className="heading-font text-base text-[var(--teal)]">{v.label}</span>
                </button>
              ))}
            </div>

            {data.vinculo === 'Outro' && (
              <div className="mb-8 animate-in fade-in duration-300">
                <label className="block heading-font text-lg text-[var(--teal)] mb-3">
                  Para quem é a música?
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={data.vinculoOutro}
                  onChange={(e) => setData({ ...data, vinculoOutro: e.target.value })}
                  placeholder="Ex: Minha tia, equipe..."
                  className="w-full outline-none bg-white border border-[var(--teal)]/20 p-4 rounded-sm text-[var(--teal)] focus:border-transparent focus:ring-2 focus:ring-[var(--gold)] transition-all"
                />
              </div>
            )}

            <div className="mb-12">
              <label className="block heading-font text-lg text-[var(--teal)] mb-3">
                Qual é o nome da pessoa?
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={50}
                  ref={nomeInputRef}
                  value={data.nome}
                  onChange={(e) => setData({ ...data, nome: e.target.value })}
                  placeholder="Nome (Ex: João)"
                  className="w-full outline-none bg-white border border-[var(--teal)]/20 p-4 rounded-sm text-[var(--teal)] focus:border-transparent focus:ring-2 focus:ring-[var(--gold)] transition-all"
                />
              </div>
              <p className="text-sm sm:text-base text-[var(--teal-light)] mt-2">O nome vai aparecer na letra da música.</p>
              
              {data.nome.length >= 2 && (
                <div className="mt-4 animate-in fade-in duration-200">
                  <span className="text-base font-medium text-[var(--teal)]/80 mb-2 block">{data.nome} é:</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        autoSaveNow({ ...data, genero: 'F' });
                        setTimeout(() => continuar1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
                      }}
                      className={`px-8 py-3 rounded-sm border-2 text-center font-bold text-lg transition-all ${
                        data.genero === 'F' ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--teal)] shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30 text-[var(--teal)]'
                      }`}
                    >
                      Ela
                    </button>
                    <button
                      onClick={() => {
                        autoSaveNow({ ...data, genero: 'M' });
                        setTimeout(() => continuar1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
                      }}
                      className={`px-8 py-3 rounded-sm border-2 text-center font-bold text-lg transition-all ${
                        data.genero === 'M' ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--teal)] shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30 text-[var(--teal)]'
                      }`}
                    >
                      Ele
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              ref={continuar1Ref}
              disabled={!data.vinculo || (data.vinculo === 'Outro' && !data.vinculoOutro?.trim()) || !isNameValid || data.genero === null}
              onClick={() => {
                setStep(2);
              }}
              className="group w-full py-5 bg-[var(--gold)] text-white heading-font text-xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95"
            >
              Continuar <span className="material-symbols-outlined animate-slide-right text-[22px]">arrow_forward</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[var(--teal)]/40">
              <span className="material-symbols-outlined" style={{ fontSize: '13.5px' }}>lock</span>
              <span className="text-[13px] font-medium tracking-wide">Suas informações são privadas</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl sm:text-4xl text-[var(--teal)] mb-8">
              {resolverGenero('Qual o estilo musical [DA_DO] [NOME]?', data.genero, data.nome)}
            </h1>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {ESTILOS.map(estilo => (
                <div
                  key={estilo.label}
                  onClick={() => {
                    autoSaveNow({ ...data, estilo: estilo.label });
                    // Auto-scroll para a seção de voz após selecionar estilo
                    setTimeout(() => vozSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
                  }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-sm border-2 transition-all cursor-pointer ${data.estilo === estilo.label ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30'}`}
                >
                  <span className="text-3xl mb-2">{estilo.emoji}</span>
                  <span className="heading-font text-base text-[var(--teal)] text-center">{estilo.label}</span>
                  <div className="absolute top-2 right-2 h-6 flex items-center justify-center">
                    {loadingStyle === estilo.label ? (
                      <span className="material-symbols-outlined text-[var(--teal-light)] text-lg animate-spin" title="Carregando...">progress_activity</span>
                    ) : playingStyle === estilo.label ? (
                      <button 
                        onClick={(e) => handlePlayEstilo(estilo.label, e)}
                        className="text-[var(--teal)] opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="Parar reprodução"
                      >
                         <span className="material-symbols-outlined text-lg animate-pulse" title="Reproduzindo...">stop_circle</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handlePlayEstilo(estilo.label, e)}
                        className="text-[var(--teal-light)] opacity-40 hover:opacity-100 transition-opacity"
                        title="Ouvir exemplo"
                      >
                        <span className="material-symbols-outlined text-lg">play_circle</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-base text-[var(--teal-light)] italic mb-10">Não tem certeza? Ouça os exemplos antes de escolher.</p>

            <div ref={vozSectionRef} className="mb-12">
              <label className="block heading-font text-xl text-[var(--teal)] mb-5">E a voz?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    autoSaveNow({ ...data, voz: 'Feminina' });
                    setTimeout(() => continuar2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
                  }}
                  className={`py-4 flex items-center justify-center gap-2 rounded-sm border-2 transition-all ${data.voz === 'Feminina' ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30'}`}
                >
                  🎤 <span className="heading-font text-lg text-[var(--teal)]">Feminina</span>
                </button>
                <button
                  onClick={() => {
                    autoSaveNow({ ...data, voz: 'Masculina' });
                    setTimeout(() => continuar2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
                  }}
                  className={`py-4 flex items-center justify-center gap-2 rounded-sm border-2 transition-all ${data.voz === 'Masculina' ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-sm' : 'border-[var(--teal)]/10 bg-white/50 hover:border-[var(--gold)]/30'}`}
                >
                  🎤 <span className="heading-font text-lg text-[var(--teal)]">Masculina</span>
                </button>
              </div>
            </div>

            <button
              ref={continuar2Ref}
              disabled={!data.estilo || !data.voz}
              onClick={() => {
                setStep(3);
              }}
              className="group w-full py-5 bg-[var(--gold)] text-white heading-font text-xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95"
            >
              Continuar <span className="material-symbols-outlined animate-slide-right text-[22px]">arrow_forward</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[var(--teal)]/40">
              <span className="material-symbols-outlined" style={{ fontSize: '13.5px' }}>lock</span>
              <span className="text-[13px] font-medium tracking-wide">Suas informações são privadas</span>
            </div>
            {data.estilo && !data.voz && (
              <p className="text-center text-base text-[var(--teal)] mt-3">Só falta escolher a voz</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl sm:text-4xl text-[var(--teal)] mb-3">
              A história da música
            </h1>
            <p className="text-base sm:text-lg text-[var(--teal-light)] italic mb-10">
              Pode falar ou escrever. Quanto mais detalhes, melhor vai ficar.
            </p>

            {/* Campo A */}
            <div className="bg-white/60 p-6 rounded-sm border border-[var(--teal)]/10 mb-10 shadow-sm relative">
              <label className="block heading-font text-base text-[var(--teal)] mb-3 leading-relaxed">
                {resolverGenero('Quem é [A_O] [NOME] pra você? Conta a história [DELA_DELE].', data.genero, data.nome)}
              </label>
              
              <textarea
                id="campoA"
                value={data.campoA}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setData({ ...data, campoA: e.target.value });
                }}
                maxLength={1000}
                rows={5}
                placeholder="Escreve como se fosse contar pra um amigo..."
                className="w-full outline-none bg-white border border-[var(--teal)]/20 p-3 rounded-sm text-[var(--teal)] focus:border-transparent focus:ring-2 focus:ring-[var(--gold)] transition-all resize-none overflow-hidden mb-2 placeholder:italic placeholder:text-[15px] placeholder:text-[var(--teal-light)]/40 placeholder:leading-relaxed text-base"
              />

              <div className="flex flex-col gap-2 mb-3">
                {data.audioCampoA.map((audioId, idx) => (
                  <div key={audioId} className="flex items-center gap-3 bg-[var(--teal)]/5 p-3 rounded-sm border border-[var(--teal)]/10 animate-in fade-in">
                    <button onClick={() => playAudio(audioId)} className="w-8 h-8 rounded-full bg-[var(--gold)] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95">
                      <span className="material-symbols-outlined text-sm pt-[2px] pr-[1px]">play_arrow</span>
                    </button>
                    <div className="flex-1">
                      <div className="relative w-full h-3 flex items-center cursor-pointer">
                        <div className="absolute w-full h-1 bg-[var(--teal)]/20 rounded-full"></div>
                        <div className="absolute w-0 h-1 bg-[var(--teal)] rounded-full"></div>
                        <div className="absolute left-0 w-3 h-3 bg-[var(--teal)] rounded-full -ml-1.5 shadow"></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--teal)]">Áudio salvo</span>
                    <button onClick={() => removeAudio('audioCampoA', audioId)} className="text-red-500 hover:text-red-700 ml-1 transition-transform active:scale-95" title="Excluir gravação">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {isRecordingFor === 'audioCampoA' ? (
                  <div className="flex-1 flex items-center gap-3 bg-red-50 p-3 rounded-sm border border-red-100 animate-in fade-in">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 motion-safe:animate-pulse">
                      <span className="material-symbols-outlined text-sm">mic</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-red-600 block leading-none mb-1">Ouvindo...</span>
                      <span className="text-[10px] text-red-500 block leading-tight">Quando terminar, toque no botão</span>
                    </div>
                    <button onClick={() => stopRecording('audioCampoA')} className="px-3 py-1.5 rounded-full bg-red-600 text-white flex items-center justify-center gap-1 shrink-0 shadow-md transition-transform active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">stop</span> Parar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => simulateRecording('audioCampoA')}
                    className="flex items-center gap-2 text-left opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all bg-[var(--teal)]/5 text-[var(--teal)]">
                      <span className="material-symbols-outlined text-sm">mic</span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--teal)]">Prefere falar? Toque aqui.</span>
                  </button>
                )}
                
                {isRecordingFor !== 'audioCampoA' && (
                  <div className="flex flex-col items-end gap-1 ml-auto">
                    <span className="text-xs text-[var(--teal-light)]">{data.campoA.length}/1000</span>
                    {data.campoA.length > 900 && <span className="text-[10px] text-[var(--gold)] font-bold">Quase no limite</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Campo B */}
            <div className="bg-white/60 p-6 rounded-sm border border-[var(--teal)]/10 mb-10 shadow-sm relative">
              <label className="block heading-font text-base text-[var(--teal)] mb-3 leading-relaxed">
                {resolverGenero('Tem um detalhe, uma frase ou um momento que não pode faltar na música [DA_DO] [NOME]?', data.genero, data.nome)}
              </label>

              <textarea
                value={data.campoB}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setData({ ...data, campoB: e.target.value });
                }}
                maxLength={1000}
                rows={5}
                placeholder="Uma frase, um apelido, um dia específico..."
                className="w-full outline-none bg-white border border-[var(--teal)]/20 p-3 rounded-sm text-[var(--teal)] focus:border-transparent focus:ring-2 focus:ring-[var(--gold)] transition-all resize-none overflow-hidden mb-2 placeholder:italic placeholder:text-[15px] placeholder:text-[var(--teal-light)]/40 placeholder:leading-relaxed text-base"
              />

              <div className="flex flex-col gap-2 mb-3">
                {data.audioCampoB.map((audioId, idx) => (
                  <div key={audioId} className="flex items-center gap-3 bg-[var(--teal)]/5 p-3 rounded-sm border border-[var(--teal)]/10 animate-in fade-in">
                    <button onClick={() => playAudio(audioId)} className="w-8 h-8 rounded-full bg-[var(--gold)] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95">
                      <span className="material-symbols-outlined text-sm pt-[2px] pr-[1px]">play_arrow</span>
                    </button>
                    <div className="flex-1">
                      <div className="relative w-full h-3 flex items-center cursor-pointer">
                        <div className="absolute w-full h-1 bg-[var(--teal)]/20 rounded-full"></div>
                        <div className="absolute w-0 h-1 bg-[var(--teal)] rounded-full"></div>
                        <div className="absolute left-0 w-3 h-3 bg-[var(--teal)] rounded-full -ml-1.5 shadow"></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--teal)]">Áudio salvo</span>
                    <button onClick={() => removeAudio('audioCampoB', audioId)} className="text-red-500 hover:text-red-700 ml-1 transition-transform active:scale-95" title="Excluir gravação">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {isRecordingFor === 'audioCampoB' ? (
                  <div className="flex-1 flex items-center gap-3 bg-red-50 p-3 rounded-sm border border-red-100 animate-in fade-in">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 motion-safe:animate-pulse">
                      <span className="material-symbols-outlined text-sm">mic</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-red-600 block leading-none mb-1">Ouvindo...</span>
                      <span className="text-[10px] text-red-500 block leading-tight">Quando terminar, toque no botão</span>
                    </div>
                    <button onClick={() => stopRecording('audioCampoB')} className="px-3 py-1.5 rounded-full bg-red-600 text-white flex items-center justify-center gap-1 shrink-0 shadow-md transition-transform active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">stop</span> Parar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => simulateRecording('audioCampoB')}
                    className="flex items-center gap-2 text-left opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all bg-[var(--teal)]/5 text-[var(--teal)]">
                      <span className="material-symbols-outlined text-sm">mic</span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--teal)]">Prefere falar? Toque aqui.</span>
                  </button>
                )}
                
                {isRecordingFor !== 'audioCampoB' && (
                  <div className="flex flex-col items-end gap-1 ml-auto">
                    <span className="text-xs text-[var(--teal-light)]">{data.campoB.length}/1000</span>
                    {data.campoB.length > 900 && <span className="text-[10px] text-[var(--gold)] font-bold">Quase no limite</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Campo C */}
            <div className="bg-white/60 p-6 rounded-sm border border-[var(--teal)]/10 mb-10 shadow-sm relative">
              <label className="block heading-font text-base text-[var(--teal)] leading-relaxed mb-1">
                {resolverGenero("O que você quer que [A_O] [NOME] sinta quando ouvir essa música?", data.genero, data.nome)}
              </label>
              <p className="text-sm sm:text-base text-[var(--teal-light)] italic mb-4">(Pode escolher mais de uma)</p>
              <div className="flex flex-col gap-2">
                {INTENCOES.map(intencao => {
                  const isSelected = data.campoC.includes(intencao);
                  return (
                    <button
                      key={intencao}
                      onClick={() => {
                        let newCampoC = [...data.campoC];
                        if (isSelected) {
                          newCampoC = newCampoC.filter(i => i !== intencao);
                        } else {
                          newCampoC.push(intencao);
                        }
                        setData({ ...data, campoC: newCampoC });
                      }}
                      className={`text-base px-4 py-3 rounded-sm border transition-all text-left flex items-center justify-between w-full ${isSelected ? 'border-[var(--teal)] bg-[var(--teal)] text-[var(--cream)]' : 'border-[var(--teal)]/20 bg-white/50 text-[var(--teal)] hover:border-[var(--teal)]/40'}`}
                    >
                      <span>{resolverGenero(intencao, data.genero, data.nome)}</span>
                      {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    let newCampoC = [...data.campoC];
                    const isOutro = newCampoC.includes('Outro');
                    if (isOutro) {
                      newCampoC = newCampoC.filter(i => i !== 'Outro');
                    } else {
                      newCampoC.push('Outro');
                    }
                    setData({ ...data, campoC: newCampoC });
                  }}
                  className={`text-base px-4 py-3 rounded-sm border transition-all text-left flex items-center justify-between w-full ${data.campoC.includes('Outro') ? 'border-[var(--teal)] bg-[var(--teal)] text-[var(--cream)]' : 'border-[var(--teal)]/20 bg-white/50 text-[var(--teal)] hover:border-[var(--teal)]/40'}`}
                >
                  <span>Outro — toque para escrever</span>
                  {data.campoC.includes('Outro') && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
              </div>

              {data.campoC.includes('Outro') && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={1000}
                      value={data.campoCOutro}
                      onChange={(e) => setData({ ...data, campoCOutro: e.target.value })}
                      placeholder={resolverGenero("O que você quer que [ELA_ELE] sinta?", data.genero, data.nome)}
                      className="w-full outline-none bg-white border border-[var(--teal)]/20 p-4 rounded-sm text-[var(--teal)] focus:border-transparent focus:ring-2 focus:ring-[var(--gold)] transition-all pr-12 text-base placeholder:text-[15px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    {data.audioCampoCOutro.map((audioId, idx) => (
                      <div key={audioId} className="flex items-center gap-3 bg-[var(--teal)]/5 p-3 rounded-sm border border-[var(--teal)]/10 animate-in fade-in">
                        <button onClick={() => playAudio(audioId)} className="w-8 h-8 rounded-full bg-[var(--gold)] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95">
                          <span className="material-symbols-outlined text-sm pt-[2px] pr-[1px]">play_arrow</span>
                        </button>
                        <div className="flex-1">
                          <div className="relative w-full h-3 flex items-center cursor-pointer">
                            <div className="absolute w-full h-1 bg-[var(--teal)]/20 rounded-full"></div>
                            <div className="absolute w-0 h-1 bg-[var(--teal)] rounded-full"></div>
                            <div className="absolute left-0 w-3 h-3 bg-[var(--teal)] rounded-full -ml-1.5 shadow"></div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--teal)]">Áudio salvo</span>
                        <button onClick={() => removeAudio('audioCampoCOutro', audioId)} className="text-red-500 hover:text-red-700 ml-1 transition-transform active:scale-95" title="Excluir gravação">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2">
                    {isRecordingFor === 'audioCampoCOutro' ? (
                      <div className="flex-1 flex items-center gap-3 bg-red-50 p-3 rounded-sm border border-red-100 animate-in fade-in">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 motion-safe:animate-pulse">
                          <span className="material-symbols-outlined text-sm">mic</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-red-600 block leading-none mb-1">Ouvindo...</span>
                          <span className="text-[10px] text-red-500 block leading-tight">Quando terminar, toque no botão</span>
                        </div>
                        <button onClick={() => stopRecording('audioCampoCOutro')} className="px-3 py-1.5 rounded-full bg-red-600 text-white flex items-center justify-center gap-1 shrink-0 shadow-md transition-transform active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                          <span className="material-symbols-outlined text-sm">stop</span> Parar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => simulateRecording('audioCampoCOutro')}
                        className="flex items-center gap-2 text-left opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all bg-[var(--teal)]/5 text-[var(--teal)]">
                          <span className="material-symbols-outlined text-sm">mic</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--teal)]">Prefere falar? Toque aqui.</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Soft Warning - A and B are empty */}
            {(!data.campoA && !data.campoB && data.audioCampoA.length === 0 && data.audioCampoB.length === 0) ? (
              <div className="bg-[var(--gold)]/10 border border-[var(--gold)]/30 p-5 rounded-sm mb-6 text-center">
                <p className="text-base text-[var(--teal)] font-bold mb-5 leading-relaxed">
                  {resolverGenero('Sem nenhum detalhe, a música vai ter o nome [DELA_DELE] — mas poderia ter a história de vocês. Um detalhe já muda tudo.', data.genero, data.nome)}
                </p>
                <div className="flex flex-col gap-4 relative z-10">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('campoA');
                      if (el) el.focus();
                      window.scrollTo({ top: 100, behavior: 'smooth' });
                    }}
                    className="w-full py-4 text-white bg-[var(--gold)] font-bold text-[12px] sm:text-[13px] uppercase tracking-widest rounded-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    Adicionar Detalhes <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('virahit_rascunho_id', rascunhoId || '');
                      localStorage.removeItem('virahit_quiz_step');
                      localStorage.removeItem('virahit_quiz_draft');
                      localStorage.removeItem('virahit_audio_blobs');
                      onFinishQuiz();
                    }}
                    className="text-[var(--teal-light)] text-sm sm:text-base transition-opacity hover:opacity-70 font-medium"
                  >
                    Continuar sem adicionar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    sessionStorage.setItem('virahit_rascunho_id', rascunhoId || '');
                    localStorage.removeItem('virahit_quiz_step');
                    localStorage.removeItem('virahit_quiz_draft');
                    localStorage.removeItem('virahit_audio_blobs');
                    onFinishQuiz();
                  }}
                  className="group w-full py-5 bg-[var(--gold)] text-white heading-font text-[19px] rounded-sm flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95"
                >
                  {resolverGenero('Criar a música [DA_DO] [NOME]', data.genero, data.nome)} <span className="material-symbols-outlined animate-slide-right text-[22px]">arrow_forward</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[var(--teal)]/40">
                  <span className="material-symbols-outlined" style={{ fontSize: '13.5px' }}>lock</span>
                  <span className="text-[13px] font-medium tracking-wide">Suas informações são privadas</span>
                </div>
              </div>
            )}

            <div className="mt-8 mb-12 flex flex-col items-center justify-center space-y-4 bg-[var(--teal)]/5 py-6 px-6 rounded-xl border border-[var(--teal)]/10 animate-in fade-in duration-500">
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-base sm:text-lg text-[var(--teal)] font-bold text-center">
                {resolverGenero('A música [DA_DO] [NOME] está quase pronta...', data.genero, data.nome)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
