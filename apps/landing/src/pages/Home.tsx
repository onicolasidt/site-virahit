import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import HeroVideo from '../components/HeroVideo';
import WhatsAppTestimonial from '../components/WhatsAppTestimonial';
import { ArrowRight, MicOff, CreditCard, Clock, BadgeCheck, Heart, Lock, Award, ChevronDown, Zap } from 'lucide-react';

import depoimento1Audio from '../assets/depoimento1.mp3';
import depoimento2Audio from '../assets/depoimento2.mp3';
import depoimento3Audio from '../assets/depoimento3.mp3';
import fotoDepoimento1 from '../assets/fotodepoimento1.jpg';
import fotoDepoimento2 from '../assets/fotodepoimento2.jpg';
import fotoDepoimento3 from '../assets/fotodepoimento3.jpg';

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
              <div className="ml-auto w-4/5 border-l-2 border-[var(--gold)] pl-6 py-2 mb-4">
                <p className="text-[var(--teal-light)] text-lg sm:text-xl md:text-2xl font-light leading-relaxed italic">
                  Você conta o que viveram juntos.<br />
                  Em 24h, chega uma música com o nome de quem você ama — cantada do jeito que essa história merece.<br />
                  Por R$47, você dá um presente que essa pessoa vai ouvir pelo resto da vida.
                </p>
              </div>
            </div>
            <div className="relative w-full flex justify-center">
              <HeroVideo />
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <a href="/quiz" className="group w-full max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl hover:gold-glow active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 group-hover:gap-5">
                <span>Criar Minha Música</span>
                <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <div className="text-[var(--teal)] text-base font-medium tracking-tight text-center">
                R$ 47 • Leva menos de 3 minutos • Entrega em 24h • Garantia de 7 dias
              </div>
            </div>
          </div>
        </section>

        <div className="px-6">
          <div className="ornament-line"></div>
        </div>

        {/* ===== SEÇÃO 2 — PARA QUAL MOMENTO ESPECIAL? ===== */}
        <section className="px-6 py-20 relative">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Para quem é essa música?</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--teal)] max-w-md">Escolha — e nós já sabemos por onde começar.</h2>
            </div>
            <div className="flex flex-col gap-12">
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
                    className="bg-white/40 border border-[var(--teal)]/5 rounded-2xl p-8 text-center hover:shadow-md hover:border-[var(--gold)]/30 transition-all cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="text-4xl">{emoji}</div>
                    <div className="text-[var(--teal)] font-bold text-sm heading-font uppercase tracking-wide">{label}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="px-6">
          <div className="ornament-line"></div>
        </div>

        {/* ===== SEÇÃO 3 — O DESAFIO ===== */}
        <section className="px-6 py-20 relative">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">O Desafio</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--teal)] max-w-md">Você quer dar algo inesquecível. Mas...</h2>
            </div>
            <div className="flex flex-col gap-12">
              <div className="w-full md:w-2/3 lg:w-1/2 bg-white/40 p-10 border border-[var(--teal)]/5 asymmetric-border editorial-shadow self-start">
                <MicOff className="w-9 h-9 text-[var(--gold)] mb-6" />
                <h3 className="text-2xl text-[var(--teal)] mb-4">Não sabe o que dar de presente?</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Flores murcham. Chocolate acaba. Roupa já tem.<br />
                Você quer algo que dure para sempre — e não sabe como chegar lá.</p>
              </div>
              <div className="w-full md:w-2/3 lg:w-1/2 bg-white/40 p-10 border border-[var(--teal)]/5 asymmetric-border editorial-shadow self-end">
                <CreditCard className="w-9 h-9 text-[var(--gold)] mb-6" />
                <h3 className="text-2xl text-[var(--teal)] mb-4">Não quer gastar uma fortuna?</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Presente de verdade no shopping custa caro — e você ainda enfrenta trânsito, fila e estacionamento.<br />
                Aqui, por R$47, você dá um presente que essa pessoa vai ouvir de novo e de novo.<br />
                E sobra dinheiro para o jantar.</p>
              </div>
              <div className="w-full md:w-2/3 lg:w-1/2 bg-white/40 p-10 border border-[var(--teal)]/5 asymmetric-border editorial-shadow self-start">
                <Clock className="w-9 h-9 text-[var(--gold)] mb-6" />
                <h3 className="text-2xl text-[var(--teal)] mb-4">Tá sem tempo e sem ideia?</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Você não precisa escrever nada elaborado.<br />
                Responde um quiz rápido de 4 perguntas sobre quem você ama.<br />
                Nós transformamos em música. Pronto em 24h.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 4 — COMO FUNCIONA ===== */}
        <section id="como-funciona" className="px-6 py-24 bg-[var(--teal)] text-[var(--cream)]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20 text-center">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Simples e Rápido</span>
              <h2 className="text-4xl mb-3">Como Funciona</h2>
              <p className="text-[var(--gold)] font-bold uppercase tracking-[0.2em] text-xs">(é mais fácil do que parece)</p>
            </div>
            <div className="space-y-24">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="heading-font text-6xl opacity-10 leading-none">01</div>
                <div className="flex-grow pt-4">
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">Conta a História de Vocês</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">Responde um quiz rapidinho — leva menos de 3 minutos.<br />
                  Nome, ocasião especial, o estilo musical favorito<br />
                  e um momento que só vocês dois sabem.<br />
                  Sem escrever redação. Sem complicar.<br />
                  Nós perguntamos, você responde.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row-reverse gap-10 items-start">
                <div className="heading-font text-6xl opacity-10 leading-none">02</div>
                <div className="flex-grow pt-4">
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">A Música Nasce</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">Com tudo que você contou, a música é criada do zero — letra, melodia e arranjo no estilo que você escolheu: Sertanejo, Gospel, Pagode, Forró ou MPB. Essa canção não existia antes. Agora ela só existe por causa de vocês.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="heading-font text-6xl opacity-10 leading-none">03</div>
                <div className="flex-grow pt-4">
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">Você Surpreende Quem Ama</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">Em até 24h, a música chega para você.<br />
                  Você manda pelo WhatsApp, coloca para tocar na hora do jantar,<br />
                  ou aparece de surpresa com a música tocando.<br /><br />
                  O que acontece depois — você vai querer ter filmado.</p>
                  <div className="mt-10 inline-flex items-center gap-3 py-2 px-4 border border-[var(--gold)]/30 rounded-sm">
                    <BadgeCheck className="w-6 h-6 text-[var(--gold)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Qualidade de estudio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 5 — POR QUE A VIRAHIT É DIFERENTE ===== */}
        <section id="vantagens" className="px-6 py-24 bg-[#F4EEDC] relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Qualidade de Estúdio</span>
              <h2 className="text-3xl text-center text-[var(--teal)]">Por Que a ViraHit é Diferente</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="md:row-span-2 border-r border-b border-[var(--teal)]/10 p-10 flex flex-col justify-center">
                <div className="w-16 h-16 bg-[var(--gold)] rounded-full flex items-center justify-center mb-8 shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h3 className="text-3xl text-[var(--teal)] mb-6">Feita pra chorar (de emoção)</h3>
                <p className="text-[var(--teal-light)] text-xl leading-relaxed mb-10 italic">"Não é playlist. Não é cover. É uma música que só existe por causa da história de vocês. Cada palavra, cada nota."</p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">Essa música tem o nome de quem você ama na letra.<br />
                    Tem aquele momento que só vocês dois sabem.<br />
                    Não tem igual em nenhum lugar do mundo.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">Não vai guardar numa gaveta.<br />
                    Vai ouvir de novo. E de novo.<br />
                    E toda vez que ouvir, vai lembrar de você.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[var(--teal)]">
                    <span className="text-[var(--gold)]">✦</span>
                    <span className="font-bold italic">Você não precisa saber escrever nem ter ideia nenhuma. Responde o quiz, a gente faz o resto. Em 24h.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/50 p-10 border-t border-[var(--gold)]/20">
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">Pronta em 24h — de verdade</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Você faz o pedido agora. Amanhã a música já tá na sua mão. Sem espera. Sem "previsão de entrega".</p>
              </div>
              <div className="bg-white/50 p-10 border-t border-[var(--gold)]/20">
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">A música é SUA</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Pode postar no Instagram, mandar no grupo da família, tocar no aniversário. Sem medo de bloqueio. É sua para sempre.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 6 — TABELA COMPARATIVA ===== */}
        <section className="px-6 py-24 max-w-4xl mx-auto">
          <h2 className="text-3xl text-center mb-16 text-[var(--teal)]">Compare e Veja a Diferença</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--teal)]">
                  <th className="py-6 px-4 heading-font text-xs uppercase tracking-widest">Recurso</th>
                  <th className="py-6 px-4 heading-font text-xs uppercase tracking-widest opacity-40">Presente Normal</th>
                  <th className="py-6 px-4 heading-font text-xs uppercase tracking-widest text-[var(--gold)]">ViraHit</th>
                </tr>
              </thead>
              <tbody className="text-[var(--teal)]">
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Custo</td>
                  <td className="py-8 px-4 opacity-40">R$ 150-300</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">R$ 47</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">O que sobra</td>
                  <td className="py-8 px-4 opacity-40">Nada (acaba/murcha)</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">Música para sempre</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Tempo</td>
                  <td className="py-8 px-4 opacity-40">Horas no shopping</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">3 minutos no quiz</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Diferente?</td>
                  <td className="py-8 px-4 opacity-40">Todo mundo dá igual</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">Só existe para vocês</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Facilidade</td>
                  <td className="py-8 px-4 opacity-40">Fila, trânsito, loja</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">Do celular, de casa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== SEÇÃO 7 — DEPOIMENTOS ===== */}
        <section id="depoimentos" className="px-6 py-24 relative overflow-hidden bg-[var(--teal)]/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Quem já deu</span>
              <h2 className="text-3xl text-[var(--teal)] mb-6">O Que Acontece Quando Alguém Ouve "Sua" Música</h2>
              <p className="text-[var(--teal-light)] italic">Não foi a gente que disse que funciona. Foram eles — depois de apertar o play pela primeira vez.</p>
              <p className="text-[var(--teal-light)] italic">1.200+ histórias transformadas em música.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              <WhatsAppTestimonial 
                userName="Bruno"
                userLocation="São Paulo, SP"
                avatarLetters="B"
                avatarImgSrc={fotoDepoimento1}
                userText=""
                timeSent="10:42"
                timeReceived="10:51"
                songAudioSrc={depoimento1Audio}
                reviewText="Minha esposa chorou muito quando dei o play no carro. Foi o melhor presente de aniversário que já dei pra ela na vida."
                rating={5}
              />
              <WhatsAppTestimonial 
                userName="Amanda"
                userLocation="Curitiba, PR"
                avatarLetters="A"
                avatarImgSrc={fotoDepoimento3}
                userText=""
                timeSent="14:15"
                timeReceived="14:22"
                songAudioSrc={depoimento2Audio}
                reviewText="Eu tava com muito medo de ficar com voz de robô, sabe? Mas ficou perfeito, parece que foi gravado num estúdio de verdade!"
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
                reviewText="Esqueci o nosso aniversário e fiz o pedido de manhã desesperado. De tarde a música já tava no meu WhatsApp. Me salvou demais!"
                rating={5}
              />
            </div>

            {/* CTA secundário após depoimentos */}
            <div className="flex flex-col items-center gap-4 mt-16">
              <a href="/quiz" className="group w-full max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl hover:gold-glow active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3">
                <span>Criar Minha Música</span>
                <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 8 — BLOCO DE OFERTA ===== */}
        <section className="px-6 py-24 bg-[#F4EEDC] relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center mb-16 text-center">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">O que você recebe</span>
              <h2 className="text-3xl sm:text-4xl text-[var(--teal)]">A música de quem você ama. Por R$47.</h2>
            </div>

            {/* Stack de valor */}
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

            {/* Ancoragem de preço */}
            <div className="max-w-xl mx-auto text-center mb-12">
              <p className="text-[var(--teal-light)] text-lg leading-relaxed italic">
                Um buquê de flores custa R$80 e murcha em três dias.<br />
                Um jantar especial custa R$150 e acaba em duas horas.<br />
                A música fica para sempre — e custa R$47.
              </p>
            </div>

            {/* Preço e CTA */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-5xl font-black text-[var(--gold)] heading-font">R$47</div>
              <a href="/quiz" className="group w-full max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl hover:gold-glow active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3">
                <span>Criar Minha Música por R$47</span>
                <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== SEÇÃO 9 — GARANTIA ===== */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto border-2 border-[var(--gold)] p-12 text-center relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--cream)] px-6">
              <BadgeCheck className="w-12 h-12 text-[var(--gold)]" />
            </div>
            <h2 className="text-3xl text-[var(--teal)] mb-2">Se a música não emocionar, você não paga</h2>
            <p className="text-xl text-[var(--gold)] italic mb-6">Simples assim.</p>
            <p className="text-[var(--teal-light)] text-lg mb-8 max-w-lg mx-auto font-light leading-relaxed">
              Você tem 7 dias depois de receber a música. Se não rolar aquele arrepio — sabe aquele? — é só falar e a gente devolve tudo. Sem burocracia. Sem explicação. Sem pergunta. A gente confia tanto nessa música que oferece isso sem medo nenhum. Só que isso nunca aconteceu por aqui.
            </p>
          </div>

          {/* CTA secundário após garantia */}
          <div className="flex flex-col items-center gap-4 mt-12">
            <a href="/quiz" className="group w-full max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl hover:gold-glow active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3">
              <span>Criar Minha Música</span>
              <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        {/* ===== SEÇÃO 10 — IMAGINE ESSA CENA ===== */}
        <section className="px-6 py-24 bg-[var(--teal)] text-[var(--cream)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full abstract-pattern opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl leading-tight mb-8">
              Imagine <span className="text-[var(--gold)] italic">Essa Cena</span>
            </h2>
            <p className="text-lg sm:text-xl font-light opacity-80 max-w-xl mx-auto leading-relaxed">
              Você manda a música às 7 da manhã.<br /><br />
              Abre no celular, a caminho do trabalho.<br />
              Ouve o primeiro verso — e é o nome de quem você ama.<br />
              A história de vocês. Aquele momento que só vocês dois sabem.
            </p>
            <p className="text-lg sm:text-xl font-light opacity-80 max-w-xl mx-auto leading-relaxed mt-6">
              Ela para tudo. Ouve de novo. Manda pro grupo da família. Liga pra você chorando.
            </p>
            <p className="text-lg sm:text-xl font-light opacity-80 max-w-xl mx-auto leading-relaxed mt-6">
              Você só precisou responder algumas perguntas.<br />
              Nós cuidamos do resto.
            </p>
          </div>
        </section>

        {/* ===== SEÇÃO 11 — CTA FINAL ===== */}
        <section className="px-6 py-32 text-center bg-[var(--teal)] text-[var(--cream)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full abstract-pattern opacity-10"></div>
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl leading-tight">
              Daqui 24h, Alguém Vai Chorar <span className="text-[var(--gold)] italic">Por Sua Causa</span>
            </h2>
            <p className="text-lg sm:text-xl font-light opacity-70 max-w-xl">
              Não dê mais um presente que vai pro fundo da gaveta. Responde o quiz. A gente faz o resto.
            </p>
            <div className="flex flex-col items-center gap-4 w-full mt-4">
              <a href="/quiz" className="group flex items-center justify-center gap-3 w-full sm:w-auto min-w-[320px] max-w-[480px] bg-[var(--gold)] text-white heading-font text-lg py-5 px-8 rounded-full shadow-2xl hover:scale-105 hover:gold-glow active:scale-95 transition-transform duration-200 group-hover:gap-5">
                <span>🎵 Criar Minha Música</span>
                <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <div className="mt-3 text-base font-medium tracking-tight text-center">
                R$ 47 • Leva menos de 3 minutos • Recebe em 24h • Garantia de 7 dias
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="px-6 py-24 max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl text-[var(--teal)] text-center">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-4">
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Preciso saber cantar para usar?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Não. Você só precisa contar a história.<br />
                A música é composta e cantada por nós — com letra feita do zero a partir do que você contou.<br />
                Você não aparece na música. Só a história de vocês.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Quanto tempo demora a entrega?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Após responder o quiz e confirmar o pagamento, a música fica pronta em até 24 horas.<br />
                Você recebe o arquivo direto no WhatsApp.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Posso postar nas redes sociais?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Sim. A música é sua.<br />
                Pode postar no Instagram, mandar no grupo da família, colocar no TikTok.<br />
                Sem medo de bloqueio. É sua para sempre.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Como é feito o pagamento?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                PIX ou cartão de crédito.<br />
                O processo é rápido e seguro.<br />
                Assim que o pagamento é confirmado, seu pedido já entra na fila.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Como a música é feita?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Você conta a história — nome, ocasião, o que viveram juntos.<br />
                A gente escreve a letra com os detalhes que você deu e grava a música no estilo que você escolheu.<br />
                Não é uma música pronta com o nome colocado no meio.<br />
                É uma composição feita do zero, que só existe por causa da história de vocês.
              </div>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
