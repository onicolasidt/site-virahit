import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import HeroVideo from '../components/HeroVideo';
import WhatsAppTestimonial from '../components/WhatsAppTestimonial';
import AudioPlayerCard from '../components/AudioPlayerCard';
import { ArrowRight, BadgeCheck, Heart, Lock, ChevronDown, Zap } from 'lucide-react';

import depoimento1Audio from '../assets/depoimento1.mp3';
import depoimento2Audio from '../assets/depoimento2.mp3';
import depoimento3Audio from '../assets/depoimento3.mp3';
import fotoDepoimento1 from '../assets/fotodepoimento1.jpg';
import fotoDepoimento2 from '../assets/fotodepoimento2.jpg';
import fotoDepoimento3 from '../assets/fotodepoimento3.jpg';

// Áudios de demonstração de estilo
// Quando os arquivos estilo-*.mp3 chegarem, substituir os imports abaixo
// por: import estiloSertanejoAudio from '../assets/estilo-sertanejo.mp3'; etc.
const estiloSertanejoAudio = depoimento1Audio;
const estiloGospelAudio    = depoimento2Audio;
const estiloPagodeAudio    = depoimento3Audio;

// ─── Melhoria #10: FAQ com transição suave ───────────────────────────────────
interface FaqItemProps {
  question: string;
  answer: React.ReactNode;
}
function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--teal)]/10 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer py-6 text-left"
        aria-expanded={open}
      >
        <span className="heading-font text-lg uppercase">{question}</span>
        <ChevronDown
          className="w-6 h-6 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();

  return (
    <div className="v2-theme antialiased overflow-x-hidden selection:bg-[var(--gold)] selection:text-white" data-mode="connect">
      <Header />
      <main>

        {/* ===== SEÇÃO 1 — HERO ===== */}
        <section className="relative px-4 pt-24 pb-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 abstract-pattern -z-10 rotate-12 translate-x-1/2"></div>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="relative">
              <h1 className="text-[clamp(2.5rem,11vw,4rem)] sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-[var(--teal)] mb-8 tracking-tight">
                <span className="block">SUA</span>
                <span className="block">HISTÓRIA</span>
                <span className="text-[var(--gold)] block mt-2 italic">VIRA MÚSICA</span>
              </h1>
              {/* Melhoria #3: mais respiro entre H1 e sub-headline */}
              <div className="ml-auto w-4/5 border-l-2 border-[var(--gold)] pl-6 py-4 mb-6">
                <p className="text-[var(--teal-light)] text-lg sm:text-xl md:text-2xl font-light leading-relaxed italic">
                  Você conta o que viveram juntos.<br />
                  Em 24h, chega uma música com o nome de quem você ama —<br className="hidden sm:block" />
                  cantada do jeito que essa história merece.<br />
                  Por R$47, você dá um presente que essa pessoa vai ouvir pelo resto da vida.
                </p>
              </div>
            </div>

            {/* Framing antes do vídeo — melhoria #3: mt-8 para separar do conteúdo acima */}
            <p className="text-center text-[var(--teal-light)] text-sm uppercase tracking-[0.25em] font-semibold mt-2 mb-1">
              É isso que acontece quando alguém ouve pela primeira vez
            </p>

            <div className="relative w-full flex justify-center">
              <HeroVideo />
            </div>

            {/* Legenda abaixo do vídeo */}
            <p className="text-center text-[var(--teal-light)] text-sm italic -mt-2">
              Reação real. Sem script. Sem aviso que ia gravar.
            </p>

            {/* Melhoria #4: hero CTA mantém rounded-full + tamanho grande — hierarquia máxima */}
            <div className="flex flex-col items-center gap-4 w-full">
              <a
                href="/quiz"
                className="group w-full max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl hover:gold-glow active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <div className="text-[var(--teal)] text-base font-medium tracking-tight text-center opacity-70">
                Leva menos de 3 minutos • Entrega em 24h • Garantia de 7 dias
              </div>
            </div>
          </div>
        </section>

        {/* Melhoria #7: ornament-line REMOVIDA aqui — a transição cream→teal já separa visualmente */}

        {/* ===== SEÇÃO 2 — COMO FUNCIONA ===== */}
        <section id="como-funciona" className="px-6 py-24 bg-[var(--teal)] text-[var(--cream)]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20 text-center">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Simples assim</span>
              <h2 className="text-4xl mb-3">Como Funciona</h2>
              <p className="text-[var(--gold)] font-bold uppercase tracking-[0.2em] text-xs">(Leva menos de 3 minutos.)</p>
            </div>

            {/* Cirurgia 3: textos cortados para 2-3 linhas. Timeline visual mantida. */}
            <div className="relative">
              <div
                className="hidden md:block absolute left-7 top-8 bottom-8 w-px"
                style={{ background: 'linear-gradient(to bottom, rgba(234,161,21,0.15), rgba(234,161,21,0.35), rgba(234,161,21,0.15))' }}
              />

              <div className="space-y-20">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="heading-font text-6xl opacity-20 leading-none shrink-0 w-14 text-center">01</div>
                  <div className="flex-grow pt-4">
                    <h3 className="text-3xl mb-4 text-[var(--gold)]">Conta a história de vocês</h3>
                    <p className="text-lg opacity-80 leading-relaxed max-w-md font-light">
                      Responde um quiz rápido — nome, ocasião, estilo musical
                      e um momento que só vocês dois sabem.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row-reverse gap-10 items-start">
                  <div className="heading-font text-6xl opacity-20 leading-none shrink-0 w-14 text-center">02</div>
                  <div className="flex-grow pt-4">
                    <h3 className="text-3xl mb-4 text-[var(--gold)]">A música nasce</h3>
                    <p className="text-lg opacity-80 leading-relaxed max-w-md font-light">
                      Letra, melodia e arranjo criados do zero no estilo que você escolheu.<br />
                      <span className="opacity-60 italic">Essa canção não existia antes. Agora ela só existe por causa de vocês.</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="heading-font text-6xl opacity-20 leading-none shrink-0 w-14 text-center">03</div>
                  <div className="flex-grow pt-4">
                    <h3 className="text-3xl mb-4 text-[var(--gold)]">Você surpreende quem ama</h3>
                    <p className="text-lg opacity-80 leading-relaxed max-w-md font-light">
                      Em até 24h a música chega para você — manda pelo WhatsApp
                      ou coloca para tocar na hora certa.
                    </p>
                    <div className="mt-8 inline-flex items-center gap-3 py-2 px-4 border border-[var(--gold)]/30 rounded-sm">
                      <BadgeCheck className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Qualidade de estúdio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Melhoria #4: CTA secundário — rounded-lg menor, diferencia do hero */}
            <div className="flex justify-center mt-16">
              <a
                href="/quiz"
                className="group bg-[var(--gold)] text-white heading-font text-sm py-3 px-8 rounded-lg shadow-[0_6px_16px_rgba(234,161,21,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 3 — DEMONSTRAÇÃO DE QUALIDADE ===== */}
        <section className="px-6 py-20 bg-[var(--cream)] relative">
          <div className="max-w-4xl mx-auto">

            <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">
              Ouça antes de decidir
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--teal)] mb-4">
              É assim que fica
            </h2>
            <p className="text-[var(--teal-light)] text-lg sm:text-xl font-light leading-relaxed italic mb-14 max-w-xl">
              Três estilos. Três histórias reais.<br />
              Aperta o play e imagina alguém que você ama ouvindo isso.
            </p>

            {/* Melhoria #2: shadow nos AudioPlayerCards — editorial-shadow via style inline */}
            <div className="flex flex-col gap-8">
              <AudioPlayerCard
                style="Sertanejo"
                framing="Essa aqui foi feita para um aniversário de 15 anos. A filha tocou para o pai — ele não conseguiu segurar."
                audioSrc={estiloSertanejoAudio}
                accentColor="var(--gold)"
              />
              <AudioPlayerCard
                style="Gospel"
                framing="Presente de Dia das Mães. A mãe ouviu três vezes seguidas antes de conseguir falar."
                audioSrc={estiloGospelAudio}
                accentColor="var(--gold)"
              />
              <AudioPlayerCard
                style="Pagode"
                framing="Declaração de casamento. Ele tocou na festa surpresa — sem avisar."
                audioSrc={estiloPagodeAudio}
                accentColor="var(--gold)"
              />
            </div>

            <p className="text-center text-[var(--teal)] font-medium text-lg mt-14 leading-relaxed max-w-xl mx-auto">
              Não é playlist. Não é cover.<br />
              É uma música que só existe por causa da história de vocês.<br />
              <span className="italic text-[var(--teal-light)]">Cada palavra, cada nota.</span>
            </p>

            {/* Melhoria #4: CTA secundário — menor que o do hero */}
            <div className="flex justify-center mt-10">
              <a
                href="/quiz"
                className="group bg-[var(--gold)] text-white heading-font text-sm py-3 px-8 rounded-lg shadow-[0_6px_16px_rgba(234,161,21,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>

          </div>
        </section>

        {/* Melhoria #7: ornament-line MANTIDA aqui — separa cream→teal/5 sem contraste forte de fundo */}
        <div className="px-6">
          <div className="ornament-line"></div>
        </div>

        {/* ===== SEÇÃO 4 — PROVA SOCIAL ===== */}
        <section id="depoimentos" className="px-6 py-24 relative overflow-hidden bg-[var(--teal)]/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Quem já deu</span>
              <h2 className="text-3xl text-[var(--teal)] mb-6">O que acontece quando alguém ouve "sua" música</h2>
              <p className="text-[var(--teal-light)] italic">Não foi a gente que disse que funciona. Foram eles — depois de apertar o play pela primeira vez.</p>
              <p className="text-[var(--teal-light)] italic">1.200+ histórias transformadas em música.</p>
            </div>

            {/* Melhoria #2: shadow nos cards de depoimento via wrapper */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
              <WhatsAppTestimonial
                userName="Bruno"
                userLocation="São Paulo, SP"
                avatarLetters="B"
                avatarImgSrc={fotoDepoimento1}
                userText=""
                timeSent="10:42"
                timeReceived="10:51"
                songAudioSrc={depoimento1Audio}
                reviewText="Minha esposa chorou muito quando dei o play no carro. Foi o melhor presente de aniversário que já dei para ela na vida."
                rating={5}
              />
              <WhatsAppTestimonial
                userName="Fernando"
                userLocation="Rio de Janeiro, RJ"
                avatarLetters="F"
                avatarImgSrc={fotoDepoimento2}
                userText=""
                timeSent="09:05"
                timeReceived="09:12"
                songAudioSrc={depoimento3Audio}
                reviewText="Esqueci o nosso aniversário e fiz o pedido de manhã desesperado. De tarde a música já estava no meu WhatsApp. Me salvou demais!"
                rating={5}
              />
            </div>

            {/* Melhoria #4: CTA secundário menor */}
            <div className="flex justify-center mt-12">
              <a
                href="/quiz"
                className="group bg-[var(--gold)] text-white heading-font text-sm py-3 px-8 rounded-lg shadow-[0_6px_16px_rgba(234,161,21,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 5 — POR QUE A VIRAHIT É DIFERENTE ===== */}
        <section id="vantagens" className="px-6 py-24 bg-[#F4EEDC] relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Qualidade de Estúdio</span>
              <h2 className="text-3xl text-center text-[var(--teal)]">Por que a ViraHit é diferente</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Cirurgia 1: Amanda removida do card principal — card agora respira */}
              <div
                className="md:row-span-2 border-r border-b border-[var(--teal)]/10 p-10 flex flex-col justify-center"
                style={{ boxShadow: '20px 20px 0px rgba(44,93,99,0.04)' }}
              >
                <div className="w-16 h-16 bg-[var(--gold)] rounded-full flex items-center justify-center mb-8 shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h3 className="text-3xl text-[var(--teal)] mb-6">Feita para chorar — de emoção</h3>
                <p className="text-[var(--teal-light)] text-xl leading-relaxed mb-10 italic">
                  "Não é playlist. Não é cover. É uma música que só existe por causa da história de vocês. Cada palavra, cada nota."
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">
                      Essa música tem o nome de quem você ama na letra.<br />
                      Não tem igual em nenhum lugar do mundo.
                    </span>
                  </li>
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">
                      Não vai guardar numa gaveta.<br />
                      Toda vez que ouvir, vai lembrar de você.
                    </span>
                  </li>
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">
                      Você não precisa de nenhuma ideia.<br />
                      Responde o quiz. Em 24h está pronta.
                    </span>
                  </li>
                </ul>
              </div>

              <div
                className="p-10 border-t border-[var(--gold)]/20"
                style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 8px 32px rgba(44,93,99,0.06)', borderRadius: '12px' }}
              >
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">Pronta em 24h — de verdade</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">
                  Você faz o pedido agora. Amanhã a música já está na sua mão. Sem espera. Sem "previsão de entrega".
                </p>
              </div>

              <div
                className="p-10 border-t border-[var(--gold)]/20"
                style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 8px 32px rgba(44,93,99,0.06)', borderRadius: '12px' }}
              >
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">A música é SUA</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">
                  Pode postar no Instagram, mandar no grupo da família, tocar no aniversário. Sem medo de bloqueio. É sua para sempre.
                </p>
              </div>
            </div>

            {/* Cirurgia 1: Amanda solta, fora do card — respira entre os diferenciais e as ocasiões */}
            <div className="mt-16 max-w-xl mx-auto">
              <p className="text-center text-[var(--gold)] font-bold uppercase tracking-[0.3em] text-[10px] mb-6">O que nossos clientes dizem</p>
              <WhatsAppTestimonial
                userName="Amanda"
                userLocation="Curitiba, PR"
                avatarLetters="A"
                avatarImgSrc={fotoDepoimento3}
                userText=""
                timeSent="14:15"
                timeReceived="14:22"
                songAudioSrc={depoimento2Audio}
                reviewText="Eu estava com muito medo de ficar com voz de robô, sabe? Mas ficou perfeito — parece que foi gravado num estúdio de verdade!"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 6 — OCASIÕES ===== */}
        <section className="px-6 py-20 relative">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Para quem é essa música?</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--teal)] max-w-md">
                Escolha — e nós já sabemos por onde começar.
              </h2>
            </div>
            <div className="flex flex-col gap-12">
              {/* Melhoria #6: micro-interação nos cards + duration-200 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { emoji: '❤️', label: 'Amor', slug: 'amor' },
                  { emoji: '💍', label: 'Casamento', slug: 'casamento' },
                  { emoji: '🎂', label: 'Aniversário', slug: 'aniversario' },
                  { emoji: '👩', label: 'Mãe', slug: 'mae' },
                  { emoji: '👨', label: 'Pai', slug: 'pai' },
                  { emoji: '👶', label: 'Filho/a', slug: 'filho' },
                  { emoji: '🤝', label: 'Amizade', slug: 'amizade' },
                  { emoji: '🎓', label: 'Formatura', slug: 'formatura' },
                ].map(({ emoji, label, slug }) => (
                  <a
                    key={slug}
                    href={`/quiz?ocasiao=${slug}`}
                    className="bg-white/40 border border-[var(--teal)]/5 rounded-2xl p-8 text-center hover:shadow-lg hover:border-[var(--gold)]/40 hover:scale-[1.04] hover:bg-white/70 transition-all duration-200 cursor-pointer flex flex-col items-center gap-3 active:scale-95"
                  >
                    <div className="text-4xl">{emoji}</div>
                    <div className="text-[var(--teal)] font-bold text-sm heading-font uppercase tracking-wide">{label}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Melhoria #7: ornament-line MANTIDA aqui — separa cream→cream antes do bloco de oferta */}
        <div className="px-6">
          <div className="ornament-line"></div>
        </div>

        {/* ===== SEÇÃO 7 — BLOCO DE OFERTA ===== */}
        <section className="px-6 py-24 bg-[#F4EEDC] relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">O que você recebe</span>
              <h2 className="text-3xl sm:text-4xl text-[var(--teal)]">A música de quem você ama. Por R$47.</h2>
            </div>

            <ul className="space-y-8 mb-16 max-w-xl mx-auto">
              {[
                { titulo: "Uma composição original", desc: "Letra, melodia e arranjo feitos do zero — com o nome e a história de quem você ama. Não existe igual em nenhum lugar." },
                { titulo: "No estilo que essa pessoa ama", desc: "Sertanejo, Gospel, Pagode, Forró ou MPB. Você escolhe. A gente entrega no estilo certo." },
                { titulo: "Pronta em até 24 horas", desc: "Você faz o pedido hoje. Amanhã a música já está na sua mão — tempo de sobra para surpreender." },
                { titulo: "Chega direto no WhatsApp", desc: "Sem baixar app, sem complicação. A música chega onde você já está." },
                { titulo: "É sua para sempre", desc: "Pode ouvir, compartilhar, postar. Sem medo de bloqueio. Para sempre." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[var(--teal)]">
                  <span className="text-[var(--gold)] mt-1">✓</span>
                  <div>
                    <span className="font-bold italic block">{item.titulo}</span>
                    <span className="text-[var(--teal-light)] leading-relaxed">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            {/* Cirurgia 2: narrativa envolve em bloco visualmente separado */}
            <div className="my-14 max-w-md mx-auto bg-[var(--teal)]/5 p-8 rounded-2xl border-l-4 border-[var(--gold)]/40">
              <p className="text-[var(--teal-light)] text-lg font-light leading-relaxed italic font-serif">
                Você manda a música às 7 da manhã.<br /><br />
                Quem você ama abre no celular, a caminho do trabalho.<br />
                Ouve o primeiro verso — e é o próprio nome.<br />
                A história de vocês. Aquele momento que só vocês dois sabem.<br /><br />
                Para tudo.<br />
                Ouve de novo.<br />
                Manda pro grupo da família.<br />
                Liga pra você chorando.<br /><br />
                Você só precisou responder algumas perguntas.<br />
                A gente cuidou do resto.
              </p>
            </div>

            <div className="max-w-xl mx-auto text-center mb-12">
              <p className="text-[var(--teal-light)] text-lg leading-relaxed italic">
                Um buquê de flores custa R$80 e murcha em três dias.<br />
                Um jantar especial custa R$150 e acaba em duas horas.<br />
                A música fica para sempre — e custa R$47.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="text-5xl font-black text-[var(--gold)] heading-font">R$47</div>
              {/* Melhoria #4: CTA do bloco de oferta — menor que hero, maior que os intermediários */}
              <a
                href="/quiz"
                className="group bg-[var(--gold)] text-white heading-font text-base py-4 px-10 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3"
              >
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 8 — GARANTIA ===== */}
        {/* Melhoria #8: shimmer animado na borda + ambient glow gold */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto relative">
            {/* Shimmer border — conic-gradient rotacionando sobre a borda gold */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                padding: '2px',
                background: 'conic-gradient(from var(--shimmer-angle, 0deg), transparent 0%, rgba(234,161,21,0.6) 10%, transparent 20%, transparent 80%, rgba(234,161,21,0.4) 90%, transparent 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'vh-border-spin 6s linear infinite',
              }}
            />
            <div className="border-2 border-[var(--gold)] p-12 text-center relative"
              style={{ boxShadow: '0 0 40px rgba(234,161,21,0.07), 0 8px 32px rgba(44,93,99,0.06)' }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--cream)] px-6">
                <BadgeCheck className="w-12 h-12 text-[var(--gold)]" />
              </div>
              <h2 className="text-3xl text-[var(--teal)] mb-2">Se a música não emocionar, você não paga</h2>
              <p className="text-xl text-[var(--gold)] italic mb-6">Simples assim.</p>
              <p className="text-[var(--teal-light)] text-lg mb-8 max-w-lg mx-auto font-light leading-relaxed">
                Você tem 7 dias depois de receber a música. Se não rolar aquele arrepio — sabe aquele? — é só falar e a gente devolve tudo. Sem burocracia. Sem explicação. Sem pergunta. A gente confia tanto nessa música que oferece isso sem medo nenhum. Só que isso nunca aconteceu por aqui.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL — dark-teal ===== */}
        <section className="px-6 py-24 bg-[var(--teal)] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full abstract-pattern opacity-10"></div>
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
              Daqui 24h, alguém vai chorar por sua causa
            </h2>
            <p className="text-white/80 text-lg font-light mb-10 leading-relaxed">
              Não dê mais um presente que vai para o fundo da gaveta.<br />
              Responde o quiz. A gente faz o resto.
            </p>
            {/* CTA final = mesmo nível do hero: rounded-lg grande + shadow forte */}
            <a
              href="/quiz"
              className="group inline-flex items-center gap-3 bg-[var(--gold)] text-white heading-font text-lg py-5 px-12 rounded-lg shadow-[0_8px_20px_rgba(234,161,21,0.3)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>🎵 Criar Minha Música por R$47</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <p className="text-white/60 text-sm mt-6 tracking-wide">
              Leva menos de 3 minutos • Recebe em 24h • Garantia de 7 dias
            </p>
          </div>
        </section>

        {/* ===== SEÇÃO 9 — FAQ ===== */}
        {/* Melhoria #10: substituído <details> nativo por FaqItem com transição suave */}
        <section id="faq" className="px-6 py-24 max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl text-[var(--teal)] text-center">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-0">
            <FaqItem
              question="Preciso saber cantar para usar?"
              answer={<>
                Não. Você só precisa contar a história.<br />
                A música é composta e cantada por nós — com letra feita do zero a partir do que você contou.<br />
                Você não aparece na música. Só a história de vocês.
              </>}
            />
            <FaqItem
              question="Quanto tempo demora a entrega?"
              answer={<>
                Após responder o quiz e confirmar o pagamento, a música fica pronta em até 24 horas.<br />
                Você recebe o arquivo direto no WhatsApp.
              </>}
            />
            <FaqItem
              question="Posso postar nas redes sociais?"
              answer={<>
                Sim. A música é sua.<br />
                Pode postar no Instagram, mandar no grupo da família, colocar no TikTok.<br />
                Sem medo de bloqueio. É sua para sempre.
              </>}
            />
            <FaqItem
              question="Como é feito o pagamento?"
              answer={<>
                PIX ou cartão de crédito.<br />
                O processo é rápido e seguro.<br />
                Assim que o pagamento é confirmado, seu pedido já entra na fila.
              </>}
            />
            <FaqItem
              question="Como a música é feita?"
              answer={<>
                Você conta a história — nome, ocasião, o que viveram juntos.<br />
                A gente escreve a letra com os detalhes que você deu e grava no estilo que você escolheu.<br />
                Não é uma música pronta com o nome colocado no meio.<br />
                É uma composição feita do zero, que só existe por causa da história de vocês.
              </>}
            />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
