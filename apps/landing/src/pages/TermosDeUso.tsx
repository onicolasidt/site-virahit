import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';

export default function TermosDeUso() {
  return (
    <div className="v2-theme antialiased overflow-x-hidden selection:bg-[var(--gold)] selection:text-white" data-mode="connect">
      <Header />
      <main className="pt-32 pb-24 px-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 abstract-pattern -z-10 rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-[var(--gold)] font-bold mb-8 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" /> Voltar para o início
            </Link>
            <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Documento Legal</span>
            <h1 className="text-4xl @[480px]:text-5xl text-[var(--teal)]">Termos de Uso</h1>
          </div>

          <div className="bg-white/60 p-8 sm:p-12 border border-[var(--teal)]/5 asymmetric-border editorial-shadow">
            <div className="space-y-8 text-[var(--teal-light)] leading-relaxed text-lg font-light">
              <p className="italic border-l-2 border-[var(--gold)] pl-4"><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">1. Aceitação dos Termos</h2>
                <p>Ao acessar e utilizar os serviços do ViraHit, você concorda em cumprir e ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">2. Descrição do Serviço</h2>
                <p>O ViraHit oferece um serviço de criação de músicas personalizadas (louvores, testemunhos, orações) utilizando inteligência artificial a partir de relatos enviados pelos usuários via WhatsApp.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">3. Direitos Autorais e Propriedade</h2>
                <p>As músicas geradas pelo ViraHit são de propriedade do usuário que as encomendou. Você tem total liberdade para utilizar, compartilhar em redes sociais (Instagram, TikTok, YouTube) e distribuir a obra gerada para fins pessoais. A revenda comercial em larga escala requer autorização prévia.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">4. Conteúdo do Usuário</h2>
                <p>Você é o único responsável pelos áudios e textos enviados para a criação da música. O ViraHit reserva-se o direito de recusar a criação de conteúdos que violem leis, contenham discurso de ódio ou ofendam terceiros.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">5. Política de Reembolso</h2>
                <p>Oferecemos uma garantia de satisfação de 7 dias. Se a música gerada não atender às suas expectativas e não refletir o seu testemunho, você poderá solicitar o reembolso integral do valor pago dentro deste prazo.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">6. Limitação de Responsabilidade</h2>
                <p>O ViraHit utiliza tecnologias de Inteligência Artificial que podem gerar resultados variados. Não garantimos que a voz gerada será idêntica à de cantores específicos, mas garantimos alta fidelidade e qualidade de estúdio.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
