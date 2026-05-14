import { useState, useEffect, useRef, RefObject } from 'react';
import { resolverGenero } from './Quiz';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AUDIO_EXEMPLOS_CONVERSAO } from '../lib/audioExemplos';

interface ConversionScreenProps {
  onBackToQuiz: () => void;
  onGoToCheckout: () => void;
}

export function ConversionScreen({ onBackToQuiz, onGoToCheckout }: ConversionScreenProps) {
  const [data, setData] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ nome: '', whatsapp: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [isPlayingAmostra, setIsPlayingAmostra] = useState(false);
  const [isLoadingAmostra, setIsLoadingAmostra] = useState(false);
  const audioAmostraRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioAmostraRef.current?.pause();
    };
  }, []);

  const handlePlayAmostra = () => {
    if (isPlayingAmostra) {
      audioAmostraRef.current?.pause();
      audioAmostraRef.current = null;
      setIsPlayingAmostra(false);
      return;
    }

    const estilo = data?.estilo || 'Sertanejo';
    const url = AUDIO_EXEMPLOS_CONVERSAO[estilo];

    if (!url || url.includes('[URL_FIREBASE_STORAGE]')) {
      setIsLoadingAmostra(true);
      setTimeout(() => {
        setIsLoadingAmostra(false);
        setIsPlayingAmostra(true);
        setTimeout(() => setIsPlayingAmostra(false), 15000);
      }, 800);
      return;
    }

    setIsLoadingAmostra(true);
    const audio = new Audio(url);
    audio.oncanplay = () => {
      setIsLoadingAmostra(false);
      setIsPlayingAmostra(true);
      audio.play();
    };
    audio.onended = () => {
      setIsPlayingAmostra(false);
      audioAmostraRef.current = null;
    };
    audio.onerror = () => {
      setIsLoadingAmostra(false);
      setIsPlayingAmostra(false);
    };
    audioAmostraRef.current = audio;
  };

  const nomeRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedData = sessionStorage.getItem('virahit_quiz_data');
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      onBackToQuiz();
    }
    setNome(localStorage.getItem('compradorNome') || '');
    setWhatsapp(localStorage.getItem('compradorWhatsApp') || '');
    setEmail(localStorage.getItem('compradorEmail') || '');
  }, []);

  if (!data) return null;

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const cleanPhone = (p: string) => p.replace(/\D/g, '');

  const formatPhone = (val: string) => {
    const p = cleanPhone(val);
    if (p.length === 0) return '';
    if (p.length <= 2) return '(' + p;
    if (p.length <= 7) return '(' + p.slice(0, 2) + ') ' + p.slice(2);
    return '(' + p.slice(0, 2) + ') ' + p.slice(2, 7) + '-' + p.slice(7, 11);
  };

  const handlePhoneChange = (e: any) => {
    const formatted = formatPhone(e.target.value);
    setWhatsapp(formatted);
    localStorage.setItem('compradorWhatsApp', formatted);
    if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
  };

  const triggerShake = (refs: Array<RefObject<HTMLDivElement>>) => {
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add('animate-shake');
        setTimeout(() => ref.current?.classList.remove('animate-shake'), 400);
      }
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const newErrors = { nome: '', whatsapp: '', email: '' };
    const errorRefs: Array<RefObject<HTMLDivElement>> = [];
    let hasError = false;

    if (!nome.trim()) {
      newErrors.nome = 'Qual é o seu nome?';
      errorRefs.push(nomeRef);
      hasError = true;
    }
    const phoneDigits = cleanPhone(whatsapp).replace(/^55/, '');
    if (phoneDigits.length !== 11 || phoneDigits[2] !== '9') {
newErrors.whatsapp = 'Digite um celular válido com DDD (ex: 11 99999-9999)';
      errorRefs.push(whatsappRef);
      hasError = true;
    }
    if (!validateEmail(email)) {
newErrors.email = 'Digite um e-mail válido';
      errorRefs.push(emailRef);
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      triggerShake(errorRefs);
      return;
    }

    setIsSubmitting(true);

    try {
      // Salva TUDO: dados do Quiz e do comprador num único registro central!
      const pedidoPayload = {
        ...data,
        compradorNome: nome,
        compradorWhatsApp: '55' + cleanPhone(whatsapp).replace(/^55/, ''),
        compradorEmail: email,
        status: 'pendente',
        gateway: 'stripe',
        criadoEm: serverTimestamp()
      };
      const withTimeout = (p: Promise<any>, ms: number) =>
        Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
      let pedidoRef: any;
      try {
        pedidoRef = await withTimeout(addDoc(collection(db, 'pedidos'), pedidoPayload), 10000);
      } catch (e1: any) {
        // Retry automatico 1x apos 2s
        await new Promise(r => setTimeout(r, 2000));
        pedidoRef = await withTimeout(addDoc(collection(db, 'pedidos'), pedidoPayload), 10000);
      }


      
      // Salva o idPedido para que o Checkout use
      localStorage.setItem('idPedido', pedidoRef.id);

      // Limpar o draft do quiz — pedido criado, dados velhos nao devem poluir proxima sessao
      localStorage.removeItem('virahit_quiz_draft');
      localStorage.removeItem('virahit_audio_blobs');

      // Escrever pedidoId na URL — habilita recuperação de carrinho e retorno pelo link
      window.history.replaceState(null, '', '/quiz/?pedido=' + pedidoRef.id);

      setShowToast(false);
      onGoToCheckout();
    } catch (e: any) {
      const errName = e?.code || e?.name || 'FirebaseError';
      const errMsg = e?.message || String(e);
      const errStack = e?.stack || '';
      console.error("Erro ao salvar pedido: ", e);

      // Log do erro → servidor (fire-and-forget)
      (async () => {
        try {
          await fetch('/api/log-erro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pagina: 'conversion',
              etapa: 'criar_pedido',
              erro_tipo: errName,
              erro_mensagem: errMsg,
              erro_stack: errStack,
              user_agent: navigator.userAgent,
              pedido_id: null,
              comprador_nome: nome,
              comprador_whatsapp: whatsapp,
              comprador_email: email,
            }),
          });
        } catch {}
      })();

      setIsSubmitting(false);
      setShowToast(true);
      // Mensagem do toast agora mostra que o erro foi registrado
    }
  };

  const isValid = nome.trim() && cleanPhone(whatsapp).length >= 10 && validateEmail(email);

  return (
    <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden pb-20 font-['Merriweather']">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[var(--gold)]/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[var(--teal)]/5 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-100px] w-[300px] h-[300px] bg-[var(--gold)]/5 rounded-full blur-[60px] pointer-events-none z-0" />
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-5px); }
          50%       { transform: translateX(5px); }
          75%       { transform: translateX(-5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .loading-dots::after {
          content: '...';
          animation: dots 1.2s steps(1) infinite;
        }
        @keyframes dots {
          0%  { content: '.';   }
          33% { content: '..';  }
          66% { content: '...'; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 7s ease-in-out infinite 2s; }
        .animate-float-slow { animation: float 8s ease-in-out infinite 4s; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(51,168,84, 0.4); }
          50% { box-shadow: 0 0 20px 4px rgba(51,168,84, 0.6); }
        }
        .animate-pulse-glow { animation: pulse-glow 2.5s infinite; }
        @keyframes slide-right {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(6px); }
        }
      `}</style>

      {/* FLOATING ICONS FOR EMOTION */}
      <div className="hidden sm:block absolute top-[15%] left-[10%] text-[var(--gold)]/20 animate-float">
        <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
      </div>
      <div className="hidden sm:block absolute top-[25%] right-[10%] text-[var(--teal)]/10 animate-float-delayed">
        <span className="material-symbols-outlined text-7xl">music_note</span>
      </div>
      <div className="hidden sm:block absolute top-[60%] left-[8%] text-[var(--teal)]/5 animate-float-slow">
        <span className="material-symbols-outlined text-5xl">auto_awesome</span>
      </div>
      <div className="hidden sm:block absolute top-[70%] right-[12%] text-[var(--gold)]/15 animate-float">
        <span className="material-symbols-outlined text-6xl">straighten</span>
      </div>

      <header className="sticky top-0 z-50 bg-[var(--cream)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-center border-b border-[var(--teal)]/10">
        <img src="/nova-logo-virahit.svg" alt="ViraHit" className="h-8 w-auto" />
      </header>

      <div className="max-w-md mx-auto px-5 pt-8 sm:pt-14 relative z-10">

        {/* BLOCO 1 — HEADLINE */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--gold)]/10 rounded-full mb-4 text-[var(--gold)]">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <h1 className="font-['Open_Sans'] font-extrabold text-[var(--teal)] uppercase text-[30px] sm:text-[34px] leading-[1.1] mb-5">
            {resolverGenero('A história [DA_DO] [NOME] vai virar uma música só pra [ELA_ELE]', data.genero, data.nome)}
          </h1>
          <p className="font-['Merriweather'] text-[16px] sm:text-[18px] text-[var(--teal)]/80 leading-relaxed max-w-[360px] mx-auto opacity-90">
            Essa música não existe em lugar nenhum ainda. <strong className="text-[var(--teal)] font-bold">Você acabou de criar ela.</strong>
          </p>
        </div>

        {/* BLOCO 2 — PLAYER PREMIUM */}
        <div className="mb-12 bg-gradient-to-br from-[var(--teal)] to-[#153438] rounded-3xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(44,93,99,0.25)] border border-[var(--teal-light)]/20 animate-in fade-in slide-in-from-bottom-4 delay-100 relative overflow-hidden group">
          
          {/* Reflexo Canto */}
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 blur-[30px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-150"></div>
          <div className="absolute bottom-[-30px] left-[-30px] w-24 h-24 bg-[var(--gold)]/20 blur-[20px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <span className="bg-white/10 text-white/90 text-[11px] font-['Open_Sans'] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">headphones</span>
              Amostra de Estilo
            </span>
            
            <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-5 flex items-center gap-4 shadow-inner">
              <button 
                aria-label="Reproduzir amostra" 
                onClick={handlePlayAmostra}
                className="w-14 h-14 rounded-full bg-[var(--gold)] text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(234,161,21,0.3)] transition-all hover:scale-105 active:scale-95 group/btn"
              >
                {isLoadingAmostra ? (
                  <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                ) : isPlayingAmostra ? (
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
                ) : (
                  <span className="material-symbols-outlined text-3xl ml-[2px] transition-transform group-hover/btn:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                )}
              </button>
              <div className="flex flex-col flex-1 py-1 overflow-hidden">
                <span className="font-['Open_Sans'] font-bold text-white text-[15px] leading-tight truncate mb-2 drop-shadow-sm">{data.estilo || 'Sertanejo'}</span>
                <div className="w-full text-white/30">
                  <svg viewBox="0 0 200 24" className={`w-full h-5 transition-colors duration-300 ${isPlayingAmostra ? 'text-white/80 animate-pulse' : 'text-white/30'}`} fill="currentColor" preserveAspectRatio="none">
                    <path d="M0,12 L2,8 L4,16 L6,10 L8,14 L10,6 L12,18 L14,4 L16,20 L18,8 L20,16 L22,10 L24,14 L26,12 L28,8 L30,16 L32,10 L34,14 L36,6 L38,18 L40,4 L42,20 L44,8 L46,16 L48,10 L50,14 L52,12 L54,8 L56,16 L58,10 L60,14 L62,6 L64,18 L66,4 L68,20 L70,8 L72,16 L74,10 L76,14 L78,12 L80,8 L82,16 L84,10 L86,14 L88,6 L90,18 L92,4 L94,20 L96,8 L98,16 L100,10 L102,14 L104,12 L106,8 L108,16 L110,10 L112,14 L114,6 L116,18 L118,4 L120,20 L122,8 L124,16 L126,10 L128,14 L130,12 L132,8 L134,16 L136,10 L138,14 L140,6 L142,18 L144,4 L146,20 L148,8 L150,16 L152,10 L154,14 L156,12 L158,8 L160,16 L162,10 L164,14 L166,6 L168,18 L170,4 L172,20 L174,8 L176,16 L178,10 L180,14 L182,12 L184,8 L186,16 L188,10 L190,14 L192,6 L194,18 L196,4 L198,12 L200,12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="font-['Merriweather'] text-[13px] text-white/70 text-center italic max-w-[280px] mx-auto leading-relaxed">
              (Essa foi feita pra outra pessoa — a {resolverGenero('música [DA_DO] [NOME]', data.genero, data.nome)} vai ser única, só com o que você escreveu)
            </p>
          </div>
        </div>

        {/* BLOCO 3 — FORMULÁRIO ENVELOPE */}
        <div className="mb-10 py-8 px-6 sm:px-8 bg-white rounded-3xl shadow-[0_12px_30px_rgba(44,93,99,0.04)] border border-[var(--teal)]/5 animate-in fade-in slide-in-from-bottom-4 delay-200">
          <div className="text-center mb-8">
            <h2 className="font-['Open_Sans'] font-extrabold text-[18px] sm:text-[20px] text-[var(--teal)] uppercase leading-snug mb-2">
              {resolverGenero('Para onde enviamos a música [DA_DO] [NOME]?', data.genero, data.nome)}
            </h2>
            <p className="font-['Merriweather'] text-[15px] text-[var(--teal)]/70">
              Só falta você falar pra onde a gente manda
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div ref={nomeRef}>
              <label htmlFor="campo-nome" className="block font-['Open_Sans'] font-bold text-[13px] text-[var(--teal)]/80 mb-2 uppercase tracking-wide">Seu nome</label>
              <div className="relative">
                <input id="campo-nome" type="text" maxLength={100} value={nome}
                  onChange={(e) => { setNome(e.target.value); localStorage.setItem('compradorNome', e.target.value); if (errors.nome) setErrors({ ...errors, nome: '' }); }}
                  className={'w-full bg-[#F5F3EC]/50 outline-none border ' + (errors.nome ? 'border-[#E53935] bg-red-50' : 'border-[var(--teal)]/10 focus:border-[var(--teal)]/30 focus:bg-white') + ' px-4 py-3.5 rounded-xl text-[var(--teal)] transition-all text-[16px] shadow-inner'}
                  placeholder="Seu nome" aria-invalid={!!errors.nome} />
              </div>
              <div className="min-h-[20px] mt-1.5">
                {errors.nome && <span role="alert" className="text-[#E53935] text-[13px] font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.nome}</span>}
              </div>
            </div>

            <div ref={whatsappRef}>
              <label htmlFor="campo-whatsapp" className="block font-['Open_Sans'] font-bold text-[13px] text-[var(--teal)]/80 mb-2 uppercase tracking-wide">Seu WhatsApp</label>
              <div className="relative">
                <input id="campo-whatsapp" type="tel" value={whatsapp} onChange={handlePhoneChange} placeholder="(11) 99999-9999"
                  className={'w-full bg-[#F5F3EC]/50 outline-none border ' + (errors.whatsapp ? 'border-[#E53935] bg-red-50' : 'border-[var(--teal)]/10 focus:border-[var(--teal)]/30 focus:bg-white') + ' px-4 py-3.5 rounded-xl text-[var(--teal)] transition-all text-[16px] shadow-inner'}
                  aria-invalid={!!errors.whatsapp} />
              </div>
              <div className="min-h-[20px] mt-1.5">
                {errors.whatsapp
                  ? <span role="alert" className="text-[#E53935] text-[13px] font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.whatsapp}</span>
                  : <span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">É por aqui que a música chega</span>}
              </div>
            </div>

            <div ref={emailRef}>
              <label htmlFor="campo-email" className="block font-['Open_Sans'] font-bold text-[13px] text-[var(--teal)]/80 mb-2 uppercase tracking-wide">Seu email</label>
              <div className="relative">
                <input id="campo-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); localStorage.setItem('compradorEmail', e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                  placeholder="seuemail@gmail.com"
                  className={'w-full bg-[#F5F3EC]/50 outline-none border ' + (errors.email ? 'border-[#E53935] bg-red-50' : 'border-[var(--teal)]/10 focus:border-[var(--teal)]/30 focus:bg-white') + ' px-4 py-3.5 rounded-xl text-[var(--teal)] transition-all text-[16px] shadow-inner'}
                  aria-invalid={!!errors.email} />
              </div>
              <div className="min-h-[20px] mt-1.5">
                {errors.email
                  ? <span role="alert" className="text-[#E53935] text-[13px] font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.email}</span>
                  : <span className="text-[13.5px] text-[var(--teal)]/60 font-['Merriweather']">Você recebe o link da música aqui também</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 pt-6 border-t border-[var(--teal)]/5 opacity-60">
            <span className="material-symbols-outlined text-[14px] text-[var(--teal)]">lock</span>
            <span className="font-['Merriweather'] font-bold text-[11px] uppercase tracking-widest text-[var(--teal)]">
              Seus dados estão seguros
            </span>
          </div>
        </div>

        {/* BLOCO 4 — OFERTA + CTA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--teal)]/10 border-t-8 border-t-[var(--gold)] shadow-[0_15px_40px_rgba(44,93,99,0.06)] animate-in fade-in slide-in-from-bottom-4 delay-300 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-[30px] pointer-events-none"></div>

          <div className="text-center relative z-10">
            <h3 className="font-['Open_Sans'] font-extrabold text-[15px] sm:text-[16px] text-[var(--teal)]/70 uppercase tracking-[0.15em] mb-8">
              {resolverGenero('A música que só [A_O] [NOME] vai ter', data.genero, data.nome)}
            </h3>

            <div className="flex flex-col gap-6 text-left mx-auto w-full max-w-[340px] mb-10">
              {[
                {
                  title: resolverGenero('[ELA_ELE_CAPS] pode ouvir essa música pra sempre', data.genero, data.nome),
                  desc: ['Salva no celular', 'Toca no aniversário, em qualquer dia']
                },
                {
                  title: 'Não existe outra igual no mundo',
                  desc: ['Só com a história que você contou', resolverGenero('Só pra [ELA_ELE]', data.genero, data.nome)]
                },
                {
                  title: 'A gente escreve, grava e manda em até 24h',
                  desc: ['Direto no seu WhatsApp']
                },
                {
                  title: 'Você não perde nada — 7 dias de garantia total',
                  desc: ['Ouviu e não gostou? Devolução completa', 'Sem pergunta. Sem enrolação.']
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[var(--gold)] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Merriweather'] text-[15px] text-[var(--teal)] font-bold block first-letter:uppercase">{item.title}</span>
                    <span className="font-['Merriweather'] text-[13.5px] text-[var(--teal)]/60 mt-1 leading-relaxed">
                      {item.desc.map((d, j) => <span key={j} className="block">{d}</span>)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 my-8 justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--teal)]/20 to-transparent w-full max-w-[80px]"></div>
              <span className="material-symbols-outlined text-[var(--gold)]/50 text-[20px]">music_cast</span>
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--teal)]/20 to-transparent w-full max-w-[80px]"></div>
            </div>

            <div className="flex flex-col items-center gap-1.5 mb-8 text-center px-2">
              <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pt-1">Flores murcham em 3 dias</span>
              <span className="text-[14px] text-[var(--teal)]/60 italic font-['Merriweather'] pb-1">Chocolates somem em 5 minutos</span>
              <span className="font-['Open_Sans'] font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--teal)] tracking-tight mt-1">
                Essa música fica pra sempre
              </span>
            </div>

            <div className="flex flex-col items-center mb-10 mt-2 relative py-2">
              <div className="flex items-start gap-1">
                <span className="font-['Open_Sans'] font-extrabold text-[54px] sm:text-[60px] leading-none text-[var(--teal)] tracking-tighter">R$ 47</span>
              </div>
              <span className="font-['Merriweather'] text-[13px] text-[var(--teal)]/60 mt-3 font-bold italic">Pagamento único. Sem assinatura.</span>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting}
              className={'relative w-full mx-auto block py-[22px] px-6 rounded-2xl font-[\'Open_Sans\'] font-extrabold uppercase text-white transition-all group border-none overflow-hidden ' + (isSubmitting ? 'bg-[#33A854]/70 cursor-wait shadow-none' : 'bg-[#33A854] hover:bg-[#2d954b] hover:-translate-y-1 active:translate-y-0 cursor-pointer animate-pulse-glow')}>
              {/* Shine effect overlay */}
              {!isSubmitting && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"></div>
              )}
              
              <div className="relative z-10 flex items-center justify-center gap-2 text-[15px] sm:text-[16px] tracking-widest">
                {isSubmitting
                  ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '22px' }}>progress_activity</span><span className="loading-dots">Criando seu pedido</span></>
                  : <>{resolverGenero('Criar a música [DA_DO] [NOME] por R$ 47', data.genero, data.nome)}<span className="material-symbols-outlined text-[20px] animate-[slide-right_1.5s_ease-in-out_infinite]">arrow_forward</span></>}
              </div>
            </button>

            <style>{`
              @keyframes shimmer { 100% { transform: translateX(200%); } }
            `}</style>

            {!isValid && !isSubmitting && (
              <p className="font-['Merriweather'] text-[13px] text-[var(--teal)]/40 text-center mt-4 italic">
                Preencha seus dados para continuar
              </p>
            )}

            <div className="flex flex-col items-center justify-center mt-8 pt-6 border-t border-[var(--teal)]/5">
               {/* TRUST BADGES */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mb-3">
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2.5 min-w-[50px] h-[30px] flex items-center justify-center grayscale opacity-80">
                  <span className="font-['Open_Sans'] font-extrabold text-gray-800 text-[12px] tracking-tight">PIX</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2.5 min-w-[50px] h-[30px] flex items-center justify-center grayscale opacity-80">
                  <span className="font-['Open_Sans'] font-extrabold text-[#1434CB] italic text-[13px] tracking-tighter pr-0.5">VISA</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2.5 min-w-[50px] h-[30px] flex items-center justify-center grayscale opacity-80">
                  <div className="flex items-center">
                    <div className="w-[13px] h-[13px] rounded-full bg-[#EB001B]" />
                    <div className="w-[13px] h-[13px] rounded-full bg-[#F79E1B] -ml-[6px] opacity-90" />
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2.5 min-w-[50px] h-[30px] flex items-center justify-center grayscale opacity-80 gap-0.5 text-gray-800">
                  <svg viewBox="0 0 488 512" fill="currentColor" className="w-[11px] h-[11px]"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
                  <span className="font-['Open_Sans'] font-medium text-[11px] tracking-tight">Pay</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2.5 min-w-[50px] h-[30px] flex items-center justify-center grayscale opacity-80 gap-0.5 text-gray-800">
                  <svg viewBox="0 0 384 512" fill="currentColor" className="w-[11px] h-[11px] pb-[1px]"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  <span className="font-['Open_Sans'] font-medium text-[11px] tracking-tight">Pay</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="material-symbols-outlined text-[14px] text-[var(--teal)]">verified_user</span>
                <span className="font-['Merriweather'] font-bold text-[11px] uppercase tracking-widest text-[var(--teal)]">Transação Criptografada</span>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF (REVIEWS) */}
        <div className="mt-12 mb-4 relative z-10 w-full max-w-md mx-auto px-2">
          <div className="flex items-center justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} viewBox="0 0 24 24" fill="#F5B041" className="w-[18px] h-[18px]">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <div className="space-y-3">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0_4px_20px_rgba(44,93,99,0.02)]">
               <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
                 "Chorei horrores ouvindo a música. Ficou perfeita, entregaram super rápido direto no WhatsApp."
               </p>
               <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Mariana S.</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0_4px_20px_rgba(44,93,99,0.02)]">
               <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
                 "Zero burocracia. O PIX aprovou na hora e a música ficou surreal de boa! Recomendo pra todo mundo."
               </p>
               <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Pedro H.</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--teal)]/5 shadow-[0_4px_20px_rgba(44,93,99,0.02)]">
               <p className="font-['Merriweather'] text-[13px] sm:text-[14px] text-[var(--teal)] italic mb-2 leading-relaxed">
                 "Melhor presente que já dei na vida. Confiança total nessa galera, valeu cada centavo!"
               </p>
               <p className="font-['Open_Sans'] text-[11px] font-bold text-[var(--teal)]/60 uppercase tracking-wider">— Amanda L.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center pb-8 flex flex-col items-center justify-center relative z-10">
          <a href="https://wa.me/5511999999999?text=Oi%20Monica!" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3 items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#33A854" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <div className="flex flex-col items-center gap-1 mt-1">
              <span className="font-['Merriweather'] text-[14px] text-[var(--teal)]/70">Tem dúvida rápida?</span>
              <span className="font-['Merriweather'] font-bold text-[15px] text-[var(--teal)] group-hover:text-[#33A854] transition-colors">
                Fala com a Mônica no WhatsApp
              </span>
            </div>
          </a>
        </div>
      </div>

      {showToast && (
        <div role="alert" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#C62828] text-white px-5 py-4 rounded-2xl text-[14px] font-bold shadow-[0_10px_30px_rgba(198,40,40,0.3)] animate-in slide-in-from-bottom-4 fade-in z-50 flex items-center gap-3 max-w-[340px] w-[calc(100vw-32px)] border border-red-400/30">
          <span className="material-symbols-outlined text-[24px] shrink-0">error</span>
          <span className="flex-1 text-[13px] font-medium leading-snug">Não conseguimos processar. Verifica sua conexão.</span>
          <button onClick={() => { setShowToast(false); handleSubmit(); }}
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
            Tentar de novo
          </button>
          <button onClick={() => setShowToast(false)}
            className="shrink-0 text-white/70 hover:text-white transition-colors ml-1" aria-label="Fechar">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
