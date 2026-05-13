import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import PhoneMockupCSS from '../components/PhoneMockupCSS';
import WhatsAppTestimonial from '../components/WhatsAppTestimonial';
import { ArrowRight, MicOff, CreditCard, Clock, BadgeCheck, Heart, Lock, Award, ChevronDown, Zap } from 'lucide-react';

import depoimento1Audio from '../assets/depoimento1.mp3';
import depoimento2Audio from '../assets/depoimento2.mp3';
import depoimento3Audio from '../assets/depoimento3.mp3';
import fotoDepoimento1 from '../assets/fotodepoimento1.jpg';
import fotoDepoimento2 from '../assets/fotodepoimento2.jpg';
import fotoDepoimento3 from '../assets/fotodepoimento3.jpg';

export default function Home() {
  const [visitorLocation, setVisitorLocation] = useState<string | null>(null);

  useEffect(() => {
    // Busca silenciosa da localização do usuário (sem bloquear a tela)
    // Usando geojs.io pois não tem limite estrito de requisições gratuitas
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.region) {
          setVisitorLocation(`${data.city}, ${data.region}`);
        }
      })
      .catch(() => {
        // Falha silenciosa: mantém as cidades padrão se der erro ou block
      });
  }, []);

  const whatsappLink = "https://wa.me/5511926681180?text=Oi!%20Quero%20encomendar%20uma%20m%C3%BAsica%20personalizada.%20Por%20onde%20come%C3%A7o%3F";

  return (
    <div className="v2-theme antialiased overflow-x-hidden selection:bg-[var(--gold)] selection:text-white" data-mode="connect">
      <Header />
      <main>
        <section className="relative px-6 pt-32 pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 abstract-pattern -z-10 rotate-12 translate-x-1/2"></div>
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-[var(--teal)]/20"></div>
              <span className="text-[var(--gold)] font-bold text-xs tracking-widest uppercase">★★★★★ (4.9) • +500 histórias em música</span>
              <div className="h-[1px] flex-grow bg-[var(--teal)]/20"></div>
            </div>
            <div className="relative">
              <h1 className="text-[clamp(2.5rem,11vw,4rem)] sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-[var(--teal)] mb-8 tracking-tight">
                <span className="block">Sua</span>
                <span className="block">História</span>
                <span className="text-[var(--gold)] block mt-2 italic">Vira Música</span>
              </h1>
              <div className="ml-auto w-4/5 border-l-2 border-[var(--gold)] pl-6 py-2 mb-10">
                <p className="text-[var(--teal-light)] text-lg sm:text-xl md:text-2xl font-light leading-relaxed italic">
                  Mande um áudio no WhatsApp contando sua história. Em 24h, receba uma música original feita sob medida — pra você dar o presente que ninguém esquece.
                </p>
              </div>
            </div>
            <div className="relative w-full flex justify-center py-8">
              <PhoneMockupCSS />
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <a href="/quiz" className="group w-full bg-[var(--gold)] text-white heading-font text-lg py-5 rounded-full shadow-xl hover:translate-x-1 transition-all flex items-center justify-center gap-4">
                <span className="">Criar Minha Música</span>
                <ArrowRight className="w-6 h-6" />
              </a>
              <div className="mt-3 w-full max-w-[420px] mx-auto bg-white/80 backdrop-blur-md border border-[var(--teal)]/10 text-[var(--teal)] px-4 py-3 rounded-2xl sm:rounded-full font-medium shadow-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="font-bold text-base sm:text-lg">R$ 97</span>
                <span className="text-[var(--teal)]/30 hidden sm:block">|</span>
                <span className="text-[13px] sm:text-base opacity-80 tracking-tight text-center">Entrega em 24h | Feita com carinho</span>
              </div>
            </div>
          </div>
        </section>
        <div className="px-6">
          <div className="ornament-line"></div>
        </div>
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
                <p className="text-[var(--teal-light)] leading-relaxed">Flores murcham. Chocolate acaba. Roupa ele já tem. Você quer algo que ele guarde pra sempre — mas não sabe como.</p>
              </div>
              <div className="w-full md:w-2/3 lg:w-1/2 bg-white/40 p-10 border border-[var(--teal)]/5 asymmetric-border editorial-shadow self-end">
                <CreditCard className="w-9 h-9 text-[var(--gold)] mb-6" />
                <h3 className="text-2xl text-[var(--teal)] mb-4">Não quer gastar uma fortuna?</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Um presente de verdade custa caro no shopping. Aqui, com R$97, você entrega emoção pura — e sobra dinheiro pro jantar.</p>
              </div>
              <div className="w-full md:w-2/3 lg:w-1/2 bg-white/40 p-10 border border-[var(--teal)]/5 asymmetric-border editorial-shadow self-start">
                <Clock className="w-9 h-9 text-[var(--gold)] mb-6" />
                <h3 className="text-2xl text-[var(--teal)] mb-4">Tá sem tempo e sem ideia?</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Você não precisa escrever nada. Manda um áudio de 1 minutinho no WhatsApp. A gente transforma em música. Pronto em 24h.</p>
              </div>
            </div>
          </div>
        </section>
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
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">Manda um áudio no WhatsApp</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">Conta a história de vocês — pode ser falando normal, sem ensaio. Nome, como se conheceram, uma piada interna. Só isso.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row-reverse gap-10 items-start">
                <div className="heading-font text-6xl opacity-10 leading-none">02</div>
                <div className="flex-grow pt-4">
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">A gente transforma em música</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">Nossa equipe cria letra, melodia e arranjo no estilo que vocês curtirem: Sertanejo, Gospel, Pagode ou MPB.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="heading-font text-6xl opacity-10 leading-none">03</div>
                <div className="flex-grow pt-4">
                  <h3 className="text-3xl mb-6 text-[var(--gold)]">Recebe a música pronta em 24h</h3>
                  <p className="text-lg opacity-80 leading-relaxed max-w-xl font-light">O MP3 chega no seu WhatsApp. É só dar o play e ver a mágica acontecer.</p>
                  <div className="mt-10 inline-flex items-center gap-3 py-2 px-4 border border-[var(--gold)]/30 rounded-sm">
                    <BadgeCheck className="w-6 h-6 text-[var(--gold)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Qualidade de estudio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="vantagens" className="px-6 py-24 bg-[#F4EEDC] relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Por que Nós?</span>
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
                  <li className="flex items-center gap-4 text-[var(--teal)] font-bold italic">
                    <span className="text-[var(--gold)]">✦</span> Eternize seus melhores momentos
                  </li>
                  <li className="flex items-center gap-4 text-[var(--teal)] font-bold italic">
                    <span className="text-[var(--gold)]">✦</span> Presenteie quem você ama de verdade
                  </li>
                  <li className="flex items-center gap-4 text-[var(--teal)] font-bold italic">
                    <span className="text-[var(--gold)]">✦</span> Surpreenda de um jeito que ninguém espera
                  </li>
                </ul>
              </div>
              <div className="bg-white/50 p-10 border-t border-[var(--gold)]/20">
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">Pronta em 24h — de verdade</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Você manda o áudio hoje. Amanhã a música tá na sua mão. Sem esperas. Sem burocracia. Sem "previsão de entrega".</p>
              </div>
              <div className="bg-white/50 p-10 border-t border-[var(--gold)]/20">
                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-2xl text-[var(--teal)] mb-4">A música é SUA</h3>
                <p className="text-[var(--teal-light)] leading-relaxed">Pode postar no Instagram, mandar no grupo da família, tocar no aniversário. Sem medo de bloqueio. É sua pra sempre.</p>
              </div>
            </div>
          </div>
        </section>
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
                  <td className="py-8 px-4 font-black text-[var(--gold)]">R$ 97</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">O que sobra</td>
                  <td className="py-8 px-4 opacity-40">Nada (acaba/murcha)</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">Música pra sempre</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Tempo</td>
                  <td className="py-8 px-4 opacity-40">Horas no shopping</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">1 minutinho de áudio</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Diferente?</td>
                  <td className="py-8 px-4 opacity-40">Todo mundo dá igual</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">Só existe pra vocês</td>
                </tr>
                <tr className="border-b border-[var(--teal)]/5">
                  <td className="py-8 px-4 font-bold italic">Facilidade</td>
                  <td className="py-8 px-4 opacity-40">Fila, trânsito, loja</td>
                  <td className="py-8 px-4 font-black text-[var(--gold)]">WhatsApp, de casa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="depoimentos" className="px-6 py-24 relative overflow-hidden bg-[var(--teal)]/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Comunidade</span>
              <h2 className="text-3xl text-[var(--teal)] mb-6">O Que Acontece Quando Alguém Ouve "Sua" Música</h2>
              <p className="text-[var(--teal-light)] italic">1.000+ histórias transformadas em música.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              <WhatsAppTestimonial 
                userName="Bruno"
                userLocation={visitorLocation || "São Paulo, SP"}
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
          </div>
        </section>
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto border-2 border-[var(--gold)] p-12 text-center relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--cream)] px-6">
              <BadgeCheck className="w-12 h-12 text-[var(--gold)]" />
            </div>
            <h2 className="text-3xl text-[var(--teal)] mb-2">Se Não Arrepiar, Devolvemos Seu Dinheiro</h2>
            <p className="text-xl text-[var(--gold)] italic mb-6">Simples assim.</p>
            <p className="text-[var(--teal-light)] text-lg mb-8 max-w-lg mx-auto font-light leading-relaxed">
              Se em até 7 dias você não sentir arrepios ao ouvir sua música, devolvemos 100% do seu dinheiro. Sem perguntas. Sem burocracia.
            </p>
            <p className="text-[var(--teal)] font-bold text-xl mb-10">O risco é nosso. A emoção é sua.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--teal)] opacity-60">
                <Lock className="w-4 h-4" /> Pagamento Seguro
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--teal)] opacity-60">
                <Award className="w-4 h-4" /> Selo de Qualidade
              </div>
            </div>
          </div>
        </section>
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
                Não! Nossa plataforma possui tecnologia de síntese vocal de alta fidelidade que cria vozes afinadas e emocionantes. Você só precisa contar a história.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Quanto tempo demora a entrega?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Após enviar o seu relato, nosso estúdio processa tudo em até 24 horas. Você recebe o link no WhatsApp imediatamente após a conclusão.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Posso postar nas redes sociais?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Sim! Você detém os direitos de uso da sua criação para fins pessoais e compartilhamento em redes sociais como YouTube, Instagram e TikTok.
              </div>
            </details>
            <details className="group border-b border-[var(--teal)]/10 pb-4">
              <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                <span className="heading-font text-lg uppercase">Como é feito o pagamento?</span>
                <ChevronDown className="w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-6 text-[var(--teal-light)] leading-relaxed italic">
                Aceitamos PIX e Cartão de Crédito através de nossa plataforma segura. O acesso é liberado instantaneamente.
              </div>
            </details>
          </div>
        </section>
        <section className="px-6 py-32 text-center bg-[var(--teal)] text-[var(--cream)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full abstract-pattern opacity-10"></div>
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl leading-tight">
              Daqui 24h, Alguém Vai Chorar <span className="text-[var(--gold)] italic">Por Sua Causa</span>
            </h2>
            <p className="text-lg sm:text-xl font-light opacity-70 max-w-xl">
              Não dê mais um presente que vai pro fundo da gaveta. Manda um áudio. A gente faz o resto.
            </p>
            <div className="flex flex-col items-center gap-4 w-full mt-4">
              <a href={whatsappLink} className="flex items-center justify-center gap-4 w-full sm:w-auto min-w-[320px] bg-[var(--gold)] text-white heading-font text-lg py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all gold-glow">
                <span>Criar Minha Música</span>
                <ArrowRight className="w-6 h-6" />
              </a>
              <div className="mt-3 w-full max-w-[480px] mx-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-2xl sm:rounded-full font-medium shadow-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="font-bold text-base sm:text-lg">R$ 97</span>
                <span className="text-white/30 hidden sm:block">|</span>
                <span className="text-[13px] sm:text-base opacity-90 tracking-tight text-center">Entrega em 24h | Se não gostar, devolvemos</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
